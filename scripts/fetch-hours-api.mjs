// Fetches operating hours for all NEA hawker centres via Google Places API (New).
// Usage: GOOGLE_PLACES_API_KEY=<key> node scripts/fetch-hours-api.mjs
//
// Output: scripts/market-hours-api.json (gitignored, resumable if interrupted)
// NEA market list is cached in scripts/nea-markets.json (gitignored)

import { readFileSync, writeFileSync, existsSync } from 'fs';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('Set GOOGLE_PLACES_API_KEY env var');
  process.exit(1);
}

const NEA_API_URL =
  'https://data.gov.sg/api/action/datastore_search?resource_id=d_bda4baa634dd1cc7a6c7cad5f19e2d68&limit=200';
const marketsFile = 'scripts/nea-markets.json';
const outputFile = 'scripts/market-hours-api.json';

let markets;
if (existsSync(marketsFile)) {
  markets = JSON.parse(readFileSync(marketsFile, 'utf8'));
} else {
  const res = await fetch(NEA_API_URL);
  const json = await res.json();
  markets = json.result.records.map((r) => ({
    name: r.name,
    address: r.address_myenv,
    lat: r.latitude_hc,
    lng: r.longitude_hc,
  }));
  writeFileSync(marketsFile, JSON.stringify(markets, null, 2));
  console.log(`Fetched ${markets.length} markets from NEA API`);
}

let results = [];
if (existsSync(outputFile)) {
  results = JSON.parse(readFileSync(outputFile, 'utf8'));
}
const doneNames = new Set(results.map((r) => r.name));

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function formatTimeMin(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const mer = h < 12 ? 'am' : 'pm';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, '0')} ${mer}`;
}

function formatPeriod(period) {
  if (!period || !period.open || !period.close) return null;
  const open = period.open.hour * 60 + (period.open.minute || 0);
  const close = period.close.hour * 60 + (period.close.minute || 0);
  return `${formatTimeMin(open)}–${formatTimeMin(close)}`;
}

function hoursFromPeriods(periods) {
  if (!periods || periods.length === 0) return null;
  const hours = {};
  for (const p of periods) {
    const dayIdx = p.open.day % 7;
    const key = DAY_KEYS[dayIdx];
    if (hours[key]) {
      hours[key] += ', ' + formatPeriod(p);
    } else {
      hours[key] = formatPeriod(p);
    }
  }
  return hours;
}

function searchPlace(name, address) {
  const match = name.match(/\((.+)\)/);
  const friendlyName = match ? match[1] : name;
  // Use well-known name if there's an override
  const OVERRIDES = {
    'Kim Hua Market': 'Maxwell Food Centre',
    'Telok Ayer Food Centre': 'Amoy Street Food Centre',
  };
  const searchName = OVERRIDES[friendlyName] || friendlyName;
  const url = 'https://places.googleapis.com/v1/places:searchText';

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types',
    },
    body: JSON.stringify({ textQuery: `${searchName} Singapore` }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (!data.places || data.places.length === 0) return null;
      // Prefer results that look like a food centre / market, not a restaurant
      const good = data.places.find((p) =>
        p.types?.some((t) => /food_court|market|hawker/i.test(t))
      );
      return { id: (good || data.places[0]).id, name: (good || data.places[0]).displayName?.text, address: (good || data.places[0]).formattedAddress };
    });
}

function searchByAddress(name, address) {
  const match = name.match(/\((.+)\)/);
  const friendlyName = match ? match[1] : name;
  const url = 'https://places.googleapis.com/v1/places:searchText';
  // Extract postal code from address for a precise query
  const postalMatch = address?.match(/Singapore\s+(\d{6})/);
  const postal = postalMatch ? postalMatch[1] : null;
  if (!postal) return Promise.resolve(null);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types',
    },
    body: JSON.stringify({ textQuery: `${friendlyName} ${postal} Singapore` }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (!data.places || data.places.length === 0) return null;
      return { id: data.places[0].id, name: data.places[0].displayName?.text, address: data.places[0].formattedAddress };
    });
}

function getPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  return fetch(url, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'regularOpeningHours,displayName,formattedAddress',
    },
  })
    .then((r) => r.json())
    .then((data) => {
      const placeName = data.displayName?.text || '';
      const address = data.formattedAddress || '';
      const source = data.regularOpeningHours;
      if (!source) return { placeName, address, hours: null };
      const periods = source.periods;
      if (!periods || periods.length === 0) {
        if (source.isOpen === true) {
          return { placeName, address, hours: { _24h: true } };
        }
        return { placeName, address, hours: null };
      }
      const hours = hoursFromPeriods(periods);
      return { placeName, address, hours };
    });
}

async function main() {
  let count = 0;
  const total = markets.length;

  for (const market of markets) {
    if (doneNames.has(market.name)) {
      count++;
      continue;
    }

    const match = market.name.match(/\((.+)\)/);
    const friendlyName = match ? match[1] : market.name;

    try {
      let searchResult = await searchPlace(market.name, market.address);
      if (!searchResult) {
        results.push({ name: market.name, error: 'No place found' });
        writeFileSync(outputFile, JSON.stringify(results, null, 2));
        count++;
        console.log(`[${count}/${total}] ${market.name}: no place found`);
        await sleep(300);
        continue;
      }

      let details = await getPlaceDetails(searchResult.id);

      // If no hours, retry with address-based search
      if (!details || !details.hours) {
        const addrResult = await searchByAddress(market.name, market.address);
        if (addrResult) {
          const addrDetails = await getPlaceDetails(addrResult.id);
          if (addrDetails && addrDetails.hours) {
            details = addrDetails;
            searchResult = addrResult;
          }
        }
      }

      if (!details || !details.hours) {
        results.push({ name: market.name, error: 'No opening hours', placeName: details?.placeName || searchResult.name });
        writeFileSync(outputFile, JSON.stringify(results, null, 2));
        count++;
        console.log(`[${count}/${total}] ${market.name}: no opening hours (matched: ${details?.placeName || searchResult.name || '?'})`);
        await sleep(300);
        continue;
      }

      let hoursData;
      if (details.hours._24h) {
        hoursData = {};
        for (const k of DAY_KEYS) hoursData[k] = 'Open 24 hours';
      } else {
        hoursData = details.hours;
      }

      const result = { name: market.name, ...hoursData };
      results.push(result);
      writeFileSync(outputFile, JSON.stringify(results, null, 2));
      count++;
      const days = Object.keys(hoursData).length;
      console.log(`[${count}/${total}] ${market.name}: ${days} days (matched: ${details.placeName})`);
    } catch (e) {
      results.push({ name: market.name, error: e.message });
      writeFileSync(outputFile, JSON.stringify(results, null, 2));
      count++;
      console.log(`[${count}/${total}] ${market.name}: ERROR - ${e.message}`);
    }

    await sleep(300);
  }

  const withHours = results.filter((r) => !r.error).length;
  const withError = results.filter((r) => r.error).length;
  console.log(`\nDone! Total: ${results.length}, With hours: ${withHours}, Error: ${withError}`);
}

main().catch(console.error);
