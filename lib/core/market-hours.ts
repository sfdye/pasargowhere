const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type MarketHours = Partial<Record<DayKey, string>>;

const DAY_KEYS: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

interface TimeRange {
  open: number;
  close: number;
}

type ParsedRange = TimeRange | '24h' | 'closed' | null;

const HOURS: Record<string, MarketHours> = {
  "Adam Road Food Centre": { wed: "7:00 am–2:00 am", thu: "7:00 am–2:00 am", fri: "7:00 am–2:00 am", sat: "7:00 am–2:00 am", sun: "7:00 am–2:00 am", mon: "7:00 am–2:00 am", tue: "7:00 am–2:00 am" },
  "Aljunied Ave 2 Blk 117 (Blk 117 Aljunied Market and Food Centre)": { wed: "5:30 am–8:00 pm", thu: "5:30 am–8:00 pm", fri: "5:30 am–8:00 pm", sat: "5:30 am–8:00 pm", sun: "5:30 am–8:00 pm", mon: "5:30 am–8:00 pm", tue: "5:30 am–8:00 pm" },
  "Amoy Street Food Centre (Telok Ayer Food Centre)": { wed: "6:30 am–9:00 pm", thu: "6:30 am–9:00 pm", fri: "6:30 am–9:00 pm", sat: "6:30 am–9:00 pm", sun: "6:30 am–6:00 pm", mon: "6:30 am–9:00 pm", tue: "6:30 am–9:00 pm" },
  "Anchorvale Village Hawker Centre": { wed: "6:30 am–10:00 pm", thu: "6:30 am–10:00 pm", fri: "6:30 am–10:00 pm", sat: "6:30 am–10:00 pm", sun: "6:30 am–10:00 pm", mon: "6:30 am–10:00 pm", tue: "6:30 am–10:00 pm" },
  "Ang Mo Kio Ave 1 Blk 226D (Kebun Baru Market and Food Centre)": { wed: "5:30 am–10:00 pm", thu: "5:30 am–10:00 pm", fri: "5:30 am–10:00 pm", sat: "5:30 am–10:00 pm", sun: "5:30 am–10:00 pm", mon: "5:30 am–10:00 pm", tue: "5:30 am–10:00 pm" },
  "Ang Mo Kio Ave 1 Blk 341 (Teck Ghee Court)": { wed: "7:00 am–10:00 pm", thu: "7:00 am–10:00 pm", fri: "7:00 am–10:00 pm", sat: "7:00 am–10:00 pm", sun: "7:00 am–10:00 pm", mon: "7:00 am–10:00 pm", tue: "7:00 am–10:00 pm" },
  "Ang Mo Kio Ave 10 Blk 409 (Teck Ghee Square)": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Ang Mo Kio Ave 10 Blk 453A (Chong Boon Market and Food Centre)": { wed: "7:00 am–9:00 pm", thu: "7:00 am–9:00 pm", fri: "7:00 am–9:00 pm", sat: "7:00 am–9:00 pm", sun: "7:00 am–9:00 pm", mon: "7:00 am–9:00 pm", tue: "7:00 am–9:00 pm" },
  "Ang Mo Kio Ave 10 Blk 527 (Cheng San Market and Cooked Food Centre)": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Ang Mo Kio Ave 4 Blk 160/162 (Mayflower Market)": { wed: "6:30 am–8:00 pm", thu: "6:30 am–8:00 pm", fri: "6:30 am–8:00 pm", sat: "6:30 am–8:00 pm", sun: "6:30 am–8:00 pm", mon: "6:30 am–8:00 pm", tue: "6:30 am–8:00 pm" },
  "Ang Mo Kio Ave 4 Blk 628 (Ang Mo Kio 628 Market)": { wed: "6:30 am–9:30 pm", thu: "6:30 am–9:30 pm", fri: "6:30 am–9:30 pm", sat: "6:30 am–9:30 pm", sun: "6:30 am–9:30 pm", mon: "6:30 am–9:30 pm", tue: "6:30 am–9:30 pm" },
  "Ang Mo Kio Ave 6 Blk 724 (Blk 724 Ang Mo Kio Market)": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Ang Mo Kio Street 22 Blk 226H (Kebun Baru Food Centre)": { wed: "5:30 am–10:00 pm", thu: "5:30 am–10:00 pm", fri: "5:30 am–10:00 pm", sat: "5:30 am–10:00 pm", sun: "5:30 am–10:00 pm", mon: "5:30 am–10:00 pm", tue: "5:30 am–10:00 pm" },
  "Bedok Food Centre": { wed: "8:00 am–10:00 pm", thu: "8:00 am–10:00 pm", fri: "8:00 am–10:00 pm", sat: "8:00 am–10:00 pm", sun: "8:00 am–10:00 pm", mon: "8:00 am–10:00 pm", tue: "8:00 am–10:00 pm" },
  "Bedok North Street 3 Blk 511 (Kaki Bukit 511 Market and Food Centre)": { wed: "6:30 am–1:00 am", thu: "6:30 am–1:00 am", fri: "6:30 am–1:00 am", sat: "6:30 am–1:00 am", sun: "6:30 am–1:00 am", mon: "6:30 am–1:00 am", tue: "6:30 am–1:00 am" },
  "Bedok North Street 3 Blk 538": { wed: "11:00 am–8:00 pm", thu: "11:00 am–8:00 pm", fri: "11:00 am–8:00 pm", sat: "11:00 am–8:00 pm", sun: "11:00 am–8:00 pm", mon: "6:00 am–6:00 pm", tue: "11:00 am–8:00 pm" },
  "Bedok North Street 4 Blk 85 (85 Fengshan Centre)": { wed: "7:00 am–2:00 am", thu: "7:00 am–2:00 am", fri: "7:00 am–2:00 am", sat: "7:00 am–2:00 am", sun: "Closed", mon: "7:00 am–2:00 am", tue: "7:00 am–2:00 am" },
  "Bedok Reservoir Road Blk 630": { wed: "5:30 am–2:00 pm", thu: "5:30 am–2:00 pm", fri: "5:30 am–2:00 pm", sat: "5:30 am–2:00 pm", sun: "5:30 am–2:00 pm", mon: "5:30 am–2:00 pm", tue: "5:30 am–2:00 pm" },
  "Bedok South Road Blk 16": { wed: "8:00 am–8:00 pm", thu: "8:00 am–8:00 pm", fri: "8:00 am–8:00 pm", sat: "8:00 am–8:00 pm", sun: "8:00 am–8:00 pm", mon: "8:00 am–8:00 pm", tue: "8:00 am–8:00 pm" },
  "Bendemeer Road Blk 29 (Bendemeer Market and Food Centre)": { wed: "7:00 am–9:00 pm", thu: "7:00 am–9:00 pm", fri: "7:00 am–9:00 pm", sat: "7:00 am–9:00 pm", sun: "7:00 am–9:00 pm", mon: "7:00 am–9:00 pm", tue: "7:00 am–9:00 pm" },
  "Beo Crescent Market": { wed: "6:00 am–8:00 pm", thu: "6:00 am–8:00 pm", fri: "6:00 am–8:00 pm", sat: "6:00 am–8:00 pm", sun: "6:00 am–7:30 pm", mon: "6:00 am–8:00 pm", tue: "6:00 am–8:00 pm" },
  "Berseh Food Centre": { wed: "Open 24 hours", thu: "Open 24 hours", fri: "Open 24 hours", sat: "Open 24 hours", sun: "Closed", mon: "Closed", tue: "5:30 am–1:00 pm" },
  "Boon Lay Place Blk 221A/B (Boon Lay Place Market and Food Village)": { wed: "Open 24 hours", thu: "Open 24 hours", fri: "Open 24 hours", sat: "Open 24 hours", sun: "Open 24 hours", mon: "Open 24 hours", tue: "Open 24 hours" },
  "Buangkok Hawker Centre": { wed: "7:00 am–9:30 pm", thu: "7:00 am–9:30 pm", fri: "7:00 am–9:30 pm", sat: "7:00 am–9:30 pm", sun: "7:00 am–9:30 pm", mon: "7:00 am–9:30 pm", tue: "7:00 am–9:30 pm" },
  "Bukit Canberra Hawker Centre": { wed: "7:00 am–11:00 pm", thu: "7:00 am–11:00 pm", fri: "7:00 am–11:00 pm", sat: "7:00 am–11:00 pm", sun: "7:00 am–11:00 pm", mon: "7:00 am–11:00 pm", tue: "7:00 am–11:00 pm" },
  "Bukit Merah Central Blk 163 (Bukit Merah Central Food Centre)": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Bukit Merah Lane 1 Blk 120 (Alexandra Village Food Centre)": { wed: "7:00 am–9:00 pm", thu: "7:00 am–9:00 pm", fri: "7:00 am–9:00 pm", sat: "7:00 am–9:00 pm", sun: "11:00 am–9:00 pm", mon: "11:00 am–9:00 pm", tue: "7:00 am–9:00 pm" },
  "Bukit Merah View Blk 115 (Blk 115 Bukit Merah View Market and Food Centre)": { wed: "7:00 am–9:00 pm", thu: "7:00 am–9:00 pm", fri: "7:00 am–9:00 pm", sat: "7:00 am–9:00 pm", sun: "7:00 am–9:00 pm", mon: "7:00 am–9:00 pm", tue: "7:00 am–9:00 pm" },
  "Bukit Panjang Hawker Centre and Market": { wed: "6:00 am–9:00 pm", thu: "6:00 am–9:00 pm", fri: "6:00 am–9:00 pm", sat: "6:00 am–9:00 pm", sun: "6:00 am–9:00 pm", mon: "6:00 am–9:00 pm", tue: "6:00 am–9:00 pm" },
  "Bukit Timah Market": { wed: "6:00 am–12:00 am", thu: "6:00 am–12:00 am", fri: "6:00 am–12:00 am", sat: "6:00 am–12:00 am", sun: "6:00 am–12:00 am", mon: "6:00 am–12:00 am", tue: "6:00 am–12:00 am" },
  "Cambridge Road Blk 41A (Pek Kio Market and Food Centre)": { wed: "5:30 am–11:00 pm", thu: "5:30 am–11:00 pm", fri: "5:30 am–11:00 pm", sat: "5:30 am–11:00 pm", sun: "5:30 am–11:00 pm", mon: "Closed", tue: "5:30 am–11:00 pm" },
  "Changi Village Blk 2 and 3": { wed: "6:00 am–2:00 am", thu: "6:00 am–2:00 am", fri: "6:00 am–12:00 am", sat: "Open 24 hours", sun: "Open 24 hours", mon: "6:00 am–2:00 am", tue: "6:00 am–2:00 am" },
  "Chomp Chomp Food Centre": { wed: "4:00 pm–12:30 am", thu: "4:00 pm–12:30 am", fri: "4:00 pm–12:30 am", sat: "4:00 pm–12:30 am", sun: "4:00 pm–12:30 am", mon: "4:00 pm–12:30 am", tue: "4:00 pm–12:30 am" },
  "Ci Yuan Hawker Centre": { wed: "7:00 am–10:00 pm", thu: "7:00 am–10:00 pm", fri: "7:00 am–10:00 pm", sat: "7:00 am–10:00 pm", sun: "7:00 am–10:00 pm", mon: "7:00 am–10:00 pm", tue: "7:00 am–10:00 pm" },
  "Circuit Road Blk 79/79A": { wed: "9:00 am–11:00 pm", thu: "9:00 am–11:00 pm", fri: "9:00 am–11:00 pm", sat: "9:00 am–11:00 pm", sun: "9:00 am–11:00 pm", mon: "Closed", tue: "9:00 am–11:00 pm" },
  "Circuit Road Blk 80 (80 Circuit Road Market and Food Centre)": { wed: "5:00 am–2:00 pm", thu: "5:00 am–2:00 pm", fri: "5:00 am–2:00 pm", sat: "5:00 am–2:00 pm", sun: "5:00 am–2:00 pm", mon: "5:00 am–2:00 pm", tue: "5:00 am–2:00 pm" },
  "Circuit Road Blk 89": { wed: "5:00 am–2:00 pm", thu: "5:00 am–2:00 pm", fri: "5:00 am–2:00 pm", sat: "5:00 am–2:00 pm", sun: "5:00 am–2:00 pm", mon: "5:00 am–2:00 pm", tue: "5:00 am–2:00 pm" },
  "Clementi Ave 2 Blk 353 (Clementi Ave 2 Market/Cooked Food Centre)": { wed: "6:30 am–5:25 pm", thu: "6:30 am–5:25 pm", fri: "6:30 am–5:25 pm", sat: "6:30 am–5:25 pm", sun: "6:30 am–5:25 pm", mon: "6:30 am–5:25 pm", tue: "6:30 am–5:25 pm" },
  "Clementi Ave 3 Blk 448": { wed: "7:00 am–9:00 pm", thu: "7:00 am–9:00 pm", fri: "7:00 am–9:00 pm", sat: "7:00 am–9:00 pm", sun: "7:00 am–9:00 pm", mon: "7:00 am–9:00 pm", tue: "7:00 am–9:00 pm" },
  "Clementi West Street 2 Blk 726": { wed: "5:30 am–10:30 pm", thu: "5:30 am–10:30 pm", fri: "5:30 am–10:30 pm", sat: "5:30 am–10:30 pm", sun: "5:30 am–10:30 pm", mon: "5:30 am–10:30 pm", tue: "5:30 am–10:30 pm" },
  "Commonwealth Crescent Market": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Dunman Food Centre": { wed: "7:00 am–8:30 pm", thu: "7:00 am–8:30 pm", fri: "7:00 am–8:30 pm", sat: "7:00 am–8:30 pm", sun: "7:00 am–8:30 pm", mon: "9:00 am–5:00 pm", tue: "9:00 am–8:30 pm" },
  "East Coast Lagoon Food Village": { wed: "4:00 pm–10:45 pm", thu: "4:00 pm–10:45 pm", fri: "11:00 am–10:45 pm", sat: "10:00 am–10:45 pm", sun: "10:00 am–10:30 pm", mon: "4:00 pm–12:00 am", tue: "4:00 pm–10:45 pm" },
  "Empress Road Blk 7 (Empress Road Market and Food Centre)": { wed: "Open 24 hours", thu: "Open 24 hours", fri: "Open 24 hours", sat: "Open 24 hours", sun: "Open 24 hours", mon: "Open 24 hours", tue: "Open 24 hours" },
  "Eunos Crescent Blk 4A": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Fernvale Hawker Centre and Market": { wed: "10:00 am–10:00 pm", thu: "10:00 am–10:00 pm", fri: "10:00 am–10:00 pm", sat: "10:00 am–10:00 pm", sun: "10:00 am–10:00 pm", mon: "10:00 am–10:00 pm", tue: "10:00 am–10:00 pm" },
  "Geylang Bahru Blk 69 (Blk 69 Geylang Bahru Market and Food Centre)": { wed: "6:00 am–11:45 pm", thu: "6:00 am–11:45 pm", fri: "6:00 am–11:45 pm", sat: "6:00 am–11:45 pm", sun: "7:00 am–11:45 pm", mon: "6:00 am–11:45 pm", tue: "6:00 am–11:45 pm" },
  "Geylang Serai Market": { wed: "7:00 am–2:45 pm", thu: "7:00 am–2:45 pm", fri: "7:00 am–2:45 pm", sat: "7:00 am–2:45 pm", sun: "7:00 am–2:45 pm", mon: "7:00 am–2:45 pm", tue: "7:00 am–2:45 pm" },
  "Golden Mile Food Centre": { wed: "8:00 am–8:00 pm", thu: "8:00 am–8:00 pm", fri: "8:00 am–8:00 pm", sat: "8:00 am–8:00 pm", sun: "8:00 am–8:00 pm", mon: "8:00 am–8:00 pm", tue: "8:00 am–8:00 pm" },
  "Haig Road Blk 13/14 (Haig Road Market and Cooked Food Centre)": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Havelock Road Blk 22A/B (Havelock Road Cooked Food Centre)": { wed: "6:30 am–10:30 pm", thu: "6:30 am–10:30 pm", fri: "6:30 am–10:30 pm", sat: "6:30 am–10:30 pm", sun: "6:30 am–10:30 pm", mon: "6:30 am–10:30 pm", tue: "6:30 am–10:30 pm" },
  "Holland Drive Blk 44 (Holland Drive Market and Food Centre)": { wed: "6:00 am–12:00 am", thu: "6:00 am–12:00 am", fri: "6:00 am–12:00 am", sat: "6:00 am–12:00 am", sun: "6:00 am–12:00 am", mon: "6:00 am–12:00 am", tue: "6:00 am–12:00 am" },
  "Hougang Street 21 Blk 209 (Kovan Hougang Market and Food Centre)": { wed: "11:00 am–11:30 pm", thu: "11:00 am–11:30 pm", fri: "11:00 am–11:30 pm", sat: "11:00 am–11:30 pm", sun: "11:00 am–11:30 pm", mon: "11:00 am–11:30 pm", tue: "11:00 am–11:30 pm" },
  "Jalan Batu Blk 4A (Blk 4A Jalan Batu Hawker Centre/Market)": { wed: "7:00 am–9:30 pm", thu: "7:00 am–9:30 pm", fri: "7:00 am–9:30 pm", sat: "7:00 am–9:30 pm", sun: "7:00 am–9:30 pm", mon: "7:00 am–9:30 pm", tue: "7:00 am–9:30 pm" },
  "Jalan Bukit Merah Blk 112 (Blk 112 Jalan Bukit Merah Market and Food Centre)": { wed: "5:00 am–10:00 pm", thu: "5:00 am–10:00 pm", fri: "5:00 am–10:00 pm", sat: "5:00 am–10:00 pm", sun: "5:00 am–10:00 pm", mon: "5:00 am–10:00 pm", tue: "5:00 am–10:00 pm" },
  "Jalan Bukit Merah Blk 6 (ABC Brickworks Market/Food Centre)": { wed: "8:00 am–11:00 pm", thu: "8:00 am–11:00 pm", fri: "8:00 am–11:00 pm", sat: "8:00 am–11:00 pm", sun: "8:00 am–12:00 am", mon: "8:00 am–11:00 pm", tue: "8:00 am–11:00 pm" },
  "Jalan Kukoh Blk 1 (Kukoh 21 Food Centre)": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Jurong East Ave 1 Blk 347 (Yuhua Market and Hawker Centre)": { wed: "6:00 am–8:30 pm", thu: "6:00 am–8:30 pm", fri: "6:00 am–8:30 pm", sat: "6:00 am–8:30 pm", sun: "6:00 am–8:30 pm", mon: "6:00 am–8:30 pm", tue: "6:00 am–8:30 pm" },
  "Jurong East Street 24 Blk 254 (Yuhua Village Market and Food Centre)": { wed: "7:00 am–11:00 pm", thu: "7:00 am–11:00 pm", fri: "7:00 am–11:00 pm", sat: "7:00 am–11:00 pm", sun: "7:00 am–11:00 pm", mon: "7:00 am–11:00 pm", tue: "7:00 am–11:00 pm" },
  "Jurong West Hawker Centre": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Jurong West Street 52 Blk 505": { wed: "6:00 am–9:00 pm", thu: "6:00 am–9:00 pm", fri: "6:00 am–9:00 pm", sat: "6:00 am–9:00 pm", sun: "6:00 am–9:00 pm", mon: "6:00 am–9:00 pm", tue: "6:00 am–9:00 pm" },
  "Kallang Estate Fresh Market and Food Centre": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Kampung Admiralty Hawker Centre": { wed: "7:00 am–10:00 pm", thu: "7:00 am–10:00 pm", fri: "7:00 am–10:00 pm", sat: "7:00 am–10:00 pm", sun: "7:00 am–10:00 pm", mon: "7:00 am–10:00 pm", tue: "7:00 am–10:00 pm" },
  "Marine Parade Central Blk 84 (84 Marine Parade Central Market and Food Centre)": { wed: "7:00 am–10:00 pm", thu: "7:00 am–10:00 pm", fri: "7:00 am–10:00 pm", sat: "7:00 am–10:00 pm", sun: "7:00 am–10:00 pm", mon: "7:00 am–10:00 pm", tue: "7:00 am–10:00 pm" },
  "Marine Terrace Blk 50A (50A Marine Terrace)": { wed: "12:00 pm–8:00 pm", thu: "12:00 pm–8:00 pm", fri: "12:00 pm–8:00 pm", sat: "12:00 pm–8:00 pm", sun: "12:00 pm–8:00 pm", mon: "Closed", tue: "11:15 am–8:00 pm" },
  "Market Street Hawker Centre": { wed: "Open 24 hours", thu: "Open 24 hours", fri: "Open 24 hours", sat: "Open 24 hours", sun: "Open 24 hours", mon: "Open 24 hours", tue: "Open 24 hours" },
  "Marsiling Lane Blk 20/21": { wed: "Open 24 hours", thu: "Open 24 hours", fri: "Open 24 hours", sat: "Open 24 hours", sun: "5:00 am–1:30 pm", mon: "Open 24 hours", tue: "Open 24 hours" },
  "Marsiling Mall Hawker Centre": { wed: "Closed", thu: "7:00 am–10:00 pm", fri: "7:00 am–10:00 pm", sat: "7:00 am–10:00 pm", sun: "7:00 am–10:00 pm", mon: "Closed", tue: "7:00 am–10:00 pm" },
  "Maxwell Food Centre (Kim Hua Market)": { wed: "8:00 am–10:00 pm", thu: "8:00 am–10:00 pm", fri: "8:00 am–10:00 pm", sat: "8:00 am–10:00 pm", sun: "8:00 am–10:00 pm", mon: "8:00 am–10:00 pm", tue: "8:00 am–10:00 pm" },
  "Mei Chin Road Blk 159 (Mei Chin Road Market)": { wed: "6:00 am–9:00 pm", thu: "6:00 am–9:00 pm", fri: "6:00 am–9:00 pm", sat: "6:00 am–9:00 pm", sun: "6:00 am–9:00 pm", mon: "6:00 am–9:00 pm", tue: "6:00 am–9:00 pm" },
  "New Market Road Blk 32 (People's Park Food Centre)": { wed: "7:30 am–10:30 pm", thu: "7:30 am–10:30 pm", fri: "7:30 am–10:30 pm", sat: "7:30 am–10:30 pm", sun: "7:30 am–10:30 pm", mon: "Closed", tue: "7:30 am–10:30 pm" },
  "New Upper Changi Road Blk 208B (Bedok Interchange Hawker Centre)": { wed: "7:00 am–10:00 pm", thu: "7:00 am–10:00 pm", fri: "7:00 am–10:00 pm", sat: "7:00 am–10:00 pm", sun: "9:00 am–10:00 pm", mon: "7:00 am–10:00 pm", tue: "7:00 am–10:00 pm" },
  "North Bridge Road Market": { wed: "Open 24 hours", thu: "Open 24 hours", fri: "Open 24 hours", sat: "Open 24 hours", sun: "Open 24 hours", mon: "Open 24 hours", tue: "Open 24 hours" },
  "Old Airport Road Blk 51 (51 Old Airport Road Food Centre and Shopping Mall)": { wed: "6:00 am–10:30 pm", thu: "6:00 am–10:30 pm", fri: "6:00 am–10:30 pm", sat: "6:00 am–10:30 pm", sun: "6:00 am–10:30 pm", mon: "6:00 am–10:30 pm", tue: "6:00 am–10:30 pm" },
  "One Punggol Hawker Centre": { wed: "7:00 am–10:00 pm", thu: "7:00 am–10:00 pm", fri: "7:00 am–10:00 pm", sat: "7:00 am–10:00 pm", sun: "7:00 am–10:00 pm", mon: "7:00 am–10:00 pm", tue: "7:00 am–10:00 pm" },
  "Pasir Panjang Food Centre": { wed: "6:30 am–8:30 pm", thu: "6:30 am–8:30 pm", fri: "6:30 am–8:30 pm", sat: "6:30 am–8:30 pm", sun: "6:30 am–8:30 pm", mon: "6:30 am–8:30 pm", tue: "6:30 am–8:30 pm" },
  "Pasir Ris Central Hawker Centre": { wed: "7:00 am–8:30 pm", thu: "7:00 am–8:30 pm", fri: "7:00 am–8:30 pm", sat: "7:00 am–8:30 pm", sun: "7:00 am–8:30 pm", mon: "7:00 am–8:30 pm", tue: "7:00 am–8:30 pm" },
  "Punggol Coast Hawker Centre": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Queen Street Blk 270 (Albert Centre)": { wed: "11:00 am–7:30 pm", thu: "Closed", fri: "11:00 am–7:30 pm", sat: "11:00 am–7:30 pm", sun: "11:00 am–7:30 pm", mon: "11:00 am–7:30 pm", tue: "11:00 am–7:30 pm" },
  "Redhill Lane Blk 79 (Redhill Market)": { wed: "Open 24 hours", thu: "Open 24 hours", fri: "Open 24 hours", sat: "Open 24 hours", sun: "Open 24 hours", mon: "Open 24 hours", tue: "Open 24 hours" },
  "Redhill Lane Blk 85 (Redhill Food Centre)": { wed: "8:00 am–9:00 pm", thu: "8:00 am–9:00 pm", fri: "8:00 am–9:00 pm", sat: "8:00 am–9:00 pm", sun: "8:00 am–9:00 pm", mon: "8:00 am–9:00 pm", tue: "7:30 am–9:00 pm" },
  "Sembawang Hills Food Centre (Jalan Leban Food Centre)": { wed: "6:00 am–9:00 pm", thu: "6:00 am–9:00 pm", fri: "6:00 am–9:00 pm", sat: "6:00 am–9:00 pm", sun: "6:00 am–9:00 pm", mon: "6:00 am–9:00 pm", tue: "6:00 am–9:00 pm" },
  "Senja Hawker Centre": { wed: "6:30 am–9:00 pm", thu: "6:30 am–9:00 pm", fri: "6:30 am–9:00 pm", sat: "6:30 am–9:00 pm", sun: "6:30 am–9:00 pm", mon: "6:30 am–9:00 pm", tue: "6:30 am–9:00 pm" },
  "Serangoon Garden Market": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Shunfu Road Blk 320 (Shunfu Mart)": { wed: "6:00 am–8:00 pm", thu: "6:00 am–8:00 pm", fri: "6:00 am–8:00 pm", sat: "6:00 am–8:00 pm", sun: "6:00 am–8:00 pm", mon: "6:00 am–8:00 pm", tue: "6:00 am–8:00 pm" },
  "Sims Place Blk 49 (Sims Vista Market and Food Centre)": { wed: "6:00 am–4:00 pm", thu: "Closed", fri: "6:00 am–4:00 pm", sat: "6:00 am–4:00 pm", sun: "6:00 am–4:00 pm", mon: "6:00 am–4:00 pm", tue: "6:00 am–4:00 pm" },
  "Smith Street Blk 335 (Chinatown Complex Market)": { wed: "7:00 am–10:00 pm", thu: "7:00 am–10:00 pm", fri: "7:00 am–10:00 pm", sat: "7:00 am–10:00 pm", sun: "7:00 am–10:00 pm", mon: "7:00 am–10:00 pm", tue: "7:00 am–10:00 pm" },
  "Taman Jurong Market and Food Centre": { wed: "11:00 am–9:00 pm", thu: "11:00 am–9:00 pm", fri: "11:00 am–9:00 pm", sat: "11:00 am–9:00 pm", sun: "11:00 am–9:00 pm", mon: "11:00 am–9:00 pm", tue: "11:00 am–9:00 pm" },
  "Tampines Street 11 Blk 137 (Tampines Round Market and Food Centre)": { wed: "6:30 am–3:00 pm", thu: "6:30 am–3:00 pm", fri: "6:30 am–3:00 pm", sat: "6:30 am–3:00 pm", sun: "6:30 am–3:00 pm", mon: "6:30 am–3:00 pm", tue: "6:30 am–3:00 pm" },
  "Tanglin Halt Market": { wed: "6:30 am–8:30 pm", thu: "6:30 am–8:30 pm", fri: "6:30 am–8:30 pm", sat: "6:30 am–8:30 pm", sun: "6:30 am–3:30 pm", mon: "6:30 am–8:30 pm", tue: "6:30 am–8:30 pm" },
  "Tanjong Pagar Plaza Blk 6 (Blk 6 Tanjong Pagar Plaza Market and Food Centre)": { wed: "8:00 am–8:00 pm", thu: "8:00 am–8:00 pm", fri: "8:00 am–8:00 pm", sat: "8:00 am–8:00 pm", sun: "6:00 am–8:00 pm", mon: "8:00 am–8:00 pm", tue: "8:00 am–8:00 pm" },
  "Teban Gardens Road Blk 37A (Teban Gardens Market and Food Centre)": { wed: "6:00 am–9:00 pm", thu: "6:00 am–9:00 pm", fri: "6:00 am–9:00 pm", sat: "6:00 am–9:00 pm", sun: "6:00 am–9:00 pm", mon: "6:00 am–9:00 pm", tue: "6:00 am–9:00 pm" },
  "Telok Blangah Crescent Blk 11 (11 Telok Blangah Crescent Market and Food Centre)": { wed: "6:00 am–11:00 pm", thu: "6:00 am–11:00 pm", fri: "6:00 am–11:00 pm", sat: "6:00 am–11:00 pm", sun: "6:00 am–11:00 pm", mon: "6:00 am–11:00 pm", tue: "6:00 am–11:00 pm" },
  "Telok Blangah Drive Blk 79 (Telok Blangah Food Centre)": { wed: "6:00 am–7:00 pm", thu: "Closed", fri: "Closed", sat: "6:00 am–2:00 pm", sun: "6:00 am–2:00 pm", mon: "6:00 am–2:30 pm", tue: "6:00 am–2:00 pm" },
  "Telok Blangah Drive Blk 82 (Telok Blangah Market)": { wed: "7:30 am–12:30 pm", thu: "7:30 am–12:30 pm", fri: "7:30 am–12:30 pm", sat: "7:30 am–12:30 pm", sun: "7:30 am–12:30 pm", mon: "Closed", tue: "7:30 am–12:30 pm" },
  "Telok Blangah Rise Blk 36 (Telok Blangah Rise Market)": { wed: "6:30 am–9:30 pm", thu: "6:30 am–9:30 pm", fri: "6:30 am–9:30 pm", sat: "6:30 am–9:30 pm", sun: "6:30 am–9:30 pm", mon: "6:30 am–9:30 pm", tue: "6:30 am–9:30 pm" },
  "The Hawker Centre @ Our Tampines Hub": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Toa Payoh Lorong 1 Blk 127 (Toa Payoh West Market and Food Court)": { wed: "6:00 am–4:00 pm", thu: "6:00 am–4:00 pm", fri: "6:00 am–4:00 pm", sat: "6:00 am–4:00 pm", sun: "6:00 am–4:00 pm", mon: "6:00 am–4:00 pm", tue: "6:00 am–4:00 pm" },
  "Toa Payoh Lorong 4 Blk 74 (Toa Payoh Vista Market)": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Toa Payoh Lorong 4 Blk 93": { wed: "6:00 am–11:00 pm", thu: "6:00 am–11:00 pm", fri: "6:00 am–11:00 pm", sat: "6:00 am–11:00 pm", sun: "6:00 am–11:00 pm", mon: "Closed", tue: "6:00 am–11:00 pm" },
  "Toa Payoh Lorong 5 Blk 75": { wed: "11:00 am–12:00 am", thu: "11:00 am–12:00 am", fri: "11:00 am–12:00 am", sat: "11:00 am–12:00 am", sun: "11:00 am–12:00 am", mon: "11:00 am–12:00 am", tue: "11:00 am–12:00 am" },
  "Toa Payoh Lorong 7 Blk 22 (Kim Keat Palm Market and Food Centre)": { wed: "6:00 am–11:00 pm", thu: "6:00 am–11:00 pm", fri: "6:00 am–11:00 pm", sat: "6:00 am–11:00 pm", sun: "6:00 am–11:00 pm", mon: "6:00 am–11:00 pm", tue: "6:00 am–11:00 pm" },
  "Toa Payoh Lorong 8 Blk 210": { wed: "12:00 pm–9:00 pm", thu: "12:00 pm–9:00 pm", fri: "12:00 pm–9:00 pm", sat: "12:00 pm–9:00 pm", sun: "12:00 pm–9:00 pm", mon: "12:00 pm–9:00 pm", tue: "Closed" },
  "Upper Boon Keng Road Blk 17 (Blk 17 Upper Boon Keng Market and Food Centre)": { wed: "6:00 am–11:00 pm", thu: "6:00 am–11:00 pm", fri: "6:00 am–11:00 pm", sat: "6:00 am–11:00 pm", sun: "6:00 am–11:00 pm", mon: "6:00 am–11:00 pm", tue: "6:00 am–11:00 pm" },
  "Upper Cross Street Blk 531A (Hong Lim Food Centre and Market)": { wed: "6:00 am–8:00 pm", thu: "6:00 am–8:00 pm", fri: "6:00 am–8:00 pm", sat: "6:00 am–8:00 pm", sun: "6:00 am–8:00 pm", mon: "6:00 am–8:00 pm", tue: "6:00 am–8:00 pm" },
  "West Coast Drive Blk 502 (Ayer Rajah Market)": { wed: "6:00 am–1:00 am", thu: "6:00 am–1:00 am", fri: "6:00 am–1:00 am", sat: "6:00 am–1:00 am", sun: "6:00 am–1:00 am", mon: "6:00 am–1:00 am", tue: "6:00 am–1:00 am" },
  "West Coast Drive Blk 503 (Ayer Rajah Food Centre)": { wed: "6:00 am–1:00 am", thu: "6:00 am–1:00 am", fri: "6:00 am–1:00 am", sat: "6:00 am–1:00 am", sun: "6:00 am–1:00 am", mon: "6:00 am–1:00 am", tue: "6:00 am–1:00 am" },
  "Whampoa Drive Blk 90 (Whampoa Drive Makan Place/Whampoa Food Centre)": { wed: "11:00 am–9:30 pm", thu: "11:00 am–9:30 pm", fri: "11:00 am–9:30 pm", sat: "11:00 am–9:30 pm", sun: "11:00 am–9:30 pm", mon: "11:00 am–9:30 pm", tue: "11:00 am–9:30 pm" },
  "Whampoa Drive Blk 91/92 (Whampoa Drive Makan Place/Whampoa Market)": { wed: "11:00 am–9:30 pm", thu: "11:00 am–9:30 pm", fri: "11:00 am–9:30 pm", sat: "11:00 am–9:30 pm", sun: "11:00 am–9:30 pm", mon: "11:00 am–9:30 pm", tue: "11:00 am–9:30 pm" },
  "Woodleigh Village Hawker Centre": { wed: "7:00 am–10:00 pm", thu: "7:00 am–10:00 pm", fri: "7:00 am–10:00 pm", sat: "7:00 am–10:00 pm", sun: "7:00 am–10:00 pm", mon: "7:00 am–10:00 pm", tue: "7:00 am–10:00 pm" },
  "Yishun Park Hawker Centre": { wed: "6:00 am–10:00 pm", thu: "6:00 am–10:00 pm", fri: "6:00 am–10:00 pm", sat: "6:00 am–10:00 pm", sun: "6:00 am–10:00 pm", mon: "6:00 am–10:00 pm", tue: "6:00 am–10:00 pm" },
  "Yishun Ring Road Blk 104/105 (Chong Pang Market and Food Centre)": { wed: "4:00 am–11:00 pm", thu: "4:00 am–11:00 pm", fri: "4:00 am–11:00 pm", sat: "4:00 am–11:00 pm", sun: "4:00 am–11:00 pm", mon: "4:00 am–11:00 pm", tue: "4:00 am–11:00 pm" },
  "Zion Riverside Food Centre": { wed: "8:00 am–10:00 pm", thu: "8:00 am–10:00 pm", fri: "8:00 am–10:00 pm", sat: "8:00 am–10:00 pm", sun: "8:00 am–10:00 pm", mon: "8:00 am–10:00 pm", tue: "8:00 am–10:00 pm" },
};

export function getMarketHours(name: string): MarketHours | null {
  return HOURS[name] ?? null;
}

export function hasHours(name: string): boolean {
  return name in HOURS;
}

function parseTimeStr(str: string): number | null {
  const m = str.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = m[3].toLowerCase();
  if (mer === 'am') {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return h * 60 + min;
}

export function parseTimeRange(str: string): ParsedRange {
  const trimmed = str.trim();
  if (/open 24 hours/i.test(trimmed)) return '24h';
  if (/^closed$/i.test(trimmed)) return 'closed';

  const parts = trimmed.split(/[–]/);
  if (parts.length !== 2) return null;

  const open = parseTimeStr(parts[0].trim());
  const close = parseTimeStr(parts[1].trim());
  if (open === null || close === null) return null;

  return { open, close };
}

/**
 * Whether the market is open right now, considering overnight ranges and yesterday's
 * extension past midnight. Returns `null` when no hours data exists for the market.
 */
export function isOpenNow(
  hours: MarketHours,
  dayOfWeek: number,
  minutes: number
): boolean | null {
  const todayKey = DAY_KEYS[dayOfWeek];
  const todayHours = hours[todayKey];
  const yesterdayKey = DAY_KEYS[(dayOfWeek + 6) % 7];
  const yesterdayHours = hours[yesterdayKey];

  const todayRange = todayHours ? parseTimeRange(todayHours) : null;
  const yesterdayRange = yesterdayHours ? parseTimeRange(yesterdayHours) : null;

  if (!todayRange && !yesterdayRange) return null;

  if (todayRange === '24h') return true;

  let open = false;

  if (todayRange && typeof todayRange === 'object') {
    const { open: o, close: c } = todayRange;
    if (c > o) {
      if (minutes >= o && minutes < c) open = true;
    } else {
      if (minutes >= o) open = true;
    }
  }

  if (!open && yesterdayRange && typeof yesterdayRange === 'object') {
    const { open: o, close: c } = yesterdayRange;
    if (c <= o && c > 0 && minutes < c) open = true;
  }

  return open;
}

export function getTodayHoursLabel(hours: MarketHours, dayOfWeek: number): string | null {
  const key = DAY_KEYS[dayOfWeek];
  return hours[key] ?? null;
}

function formatTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const mer = h < 12 ? 'am' : 'pm';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, '0')} ${mer}`;
}

/**
 * When the market is closed by hours (not by NEA closure), returns the next opening
 * time and which day it's on. Checks today first (opening later today), then tomorrow.
 * `day` is null when opening later today, or the DayKey when opening tomorrow.
 */
export function getOpensAtInfo(
  hours: MarketHours,
  dayOfWeek: number,
  minutes: number
): { time: string; day: DayKey | null } | null {
  const todayKey = DAY_KEYS[dayOfWeek];
  const todayHours = hours[todayKey];
  if (todayHours) {
    const range = parseTimeRange(todayHours);
    if (range && typeof range === 'object' && minutes < range.open) {
      return { time: formatTime(range.open), day: null };
    }
  }

  const tomorrowKey = DAY_KEYS[(dayOfWeek + 1) % 7];
  const tomorrowHours = hours[tomorrowKey];
  if (tomorrowHours) {
    const range = parseTimeRange(tomorrowHours);
    if (range && typeof range === 'object') {
      return { time: formatTime(range.open), day: tomorrowKey };
    }
  }

  return null;
}

/**
 * Minutes until the market opens. Returns null when no hours data or already open.
 * Only checks today's range (opening later today), not tomorrow's.
 */
export function minutesUntilOpen(
  hours: MarketHours,
  dayOfWeek: number,
  minutes: number
): number | null {
  const todayKey = DAY_KEYS[dayOfWeek];
  const todayHours = hours[todayKey];
  if (!todayHours) return null;

  const range = parseTimeRange(todayHours);
  if (range === '24h' || range === 'closed' || range === null) return null;

  if (minutes < range.open) {
    return range.open - minutes;
  }

  return null;
}

/**
 * When the market is open by hours, returns the closing time as a formatted string.
 * Handles overnight ranges (close < open means closing past midnight).
 */
export function getClosesAtLabel(
  hours: MarketHours,
  dayOfWeek: number,
  minutes: number
): string | null {
  const todayKey = DAY_KEYS[dayOfWeek];
  const todayHours = hours[todayKey];
  if (!todayHours) return null;

  const range = parseTimeRange(todayHours);
  if (range === '24h' || range === 'closed' || range === null) return null;

  const { open: o, close: c } = range;
  if (c > o) {
    if (minutes >= o && minutes < c) return formatTime(c);
  } else {
    if (minutes >= o) return formatTime(c);
  }

  // Check if we're in yesterday's overnight extension
  const yesterdayKey = DAY_KEYS[(dayOfWeek + 6) % 7];
  const yesterdayHours = hours[yesterdayKey];
  if (yesterdayHours) {
    const yRange = parseTimeRange(yesterdayHours);
    if (yRange && typeof yRange === 'object' && yRange.close <= yRange.open && yRange.close > 0) {
      if (minutes < yRange.close) return formatTime(yRange.close);
    }
  }

  return null;
}

/** Minutes since midnight in Singapore time. */
export function sgMinutes(now?: Date): number {
  const sgt = new Date((now || new Date()).getTime() + SGT_OFFSET_MS);
  return sgt.getUTCHours() * 60 + sgt.getUTCMinutes();
}

/**
 * Minutes until the market closes. Returns null when no hours data or not currently open.
 * Handles overnight ranges and yesterday's overnight extension.
 */
export function minutesUntilClose(
  hours: MarketHours,
  dayOfWeek: number,
  minutes: number
): number | null {
  const todayKey = DAY_KEYS[dayOfWeek];
  const todayHours = hours[todayKey];
  if (todayHours) {
    const range = parseTimeRange(todayHours);
    if (range && typeof range === 'object') {
      const { open: o, close: c } = range;
      if (c > o) {
        if (minutes >= o && minutes < c) return c - minutes;
      } else {
        if (minutes >= o) return c - minutes + 1440; // closes past midnight
      }
    }
  }

  const yesterdayKey = DAY_KEYS[(dayOfWeek + 6) % 7];
  const yesterdayHours = hours[yesterdayKey];
  if (yesterdayHours) {
    const yRange = parseTimeRange(yesterdayHours);
    if (yRange && typeof yRange === 'object' && yRange.close <= yRange.open && yRange.close > 0) {
      if (minutes < yRange.close) return yRange.close - minutes;
    }
  }

  return null;
}

/** Day of week in Singapore time: 0=Sun, 1=Mon, … 6=Sat. */
export function sgDayOfWeek(now?: Date): number {
  const sgt = new Date((now || new Date()).getTime() + SGT_OFFSET_MS);
  return sgt.getUTCDay();
}

export type HoursDisplayKind = 'open' | 'open24h' | 'closedByHours' | 'opensSoon' | 'closesSoon' | 'noData';

export interface HoursDisplay {
  kind: HoursDisplayKind;
  /** Today's hours range for display, e.g. "6:00 am–10:00 pm". Null when no data. */
  label: string | null;
  /** Formatted opening time when closed by hours, e.g. "7:00 am". Null otherwise. */
  opensAt: string | null;
  /** Day-of-week key for the opening time ('mon', 'tue', etc). Null when opening today or no data. */
  opensAtDay: DayKey | null;
  /** Formatted closing time when open, e.g. "10:00 pm". Null otherwise. */
  closesAt: string | null;
}

/**
 * Resolves operating-hours status for a market that is *not* closed by NEA (cleaning/R&R)
 * and not on the Monday warning. The caller should check `getMarketStatus` first and only
 * call this when the NEA status is `open`.
 */
export function resolveHoursDisplay(
  marketName: string,
  dayOfWeek: number,
  minutes: number
): HoursDisplay {
  const hours = getMarketHours(marketName);
  if (!hours) return { kind: 'noData', label: null, opensAt: null, opensAtDay: null, closesAt: null };

  const label = getTodayHoursLabel(hours, dayOfWeek);
  if (!label) return { kind: 'noData', label: null, opensAt: null, opensAtDay: null, closesAt: null };

  if (/open 24 hours/i.test(label)) {
    return { kind: 'open24h', label, opensAt: null, opensAtDay: null, closesAt: null };
  }

  if (/^closed$/i.test(label)) {
    return { kind: 'closedByHours', label: null, opensAt: null, opensAtDay: null, closesAt: null };
  }

  const range = parseTimeRange(label);
  if (!range || typeof range !== 'object') {
    return { kind: 'noData', label: null, opensAt: null, opensAtDay: null, closesAt: null };
  }

  const open = isOpenNow(hours, dayOfWeek, minutes);
  if (open === null) return { kind: 'noData', label: null, opensAt: null, opensAtDay: null, closesAt: null };

  if (open) {
    const closesAt = getClosesAtLabel(hours, dayOfWeek, minutes);
    if (closesAt) {
      const minsUntil = minutesUntilClose(hours, dayOfWeek, minutes);
      if (minsUntil !== null && minsUntil <= 60) {
        return { kind: 'closesSoon', label, opensAt: null, opensAtDay: null, closesAt };
      }
    }
    return { kind: 'open', label, opensAt: null, opensAtDay: null, closesAt };
  }

  const opensAtInfo = getOpensAtInfo(hours, dayOfWeek, minutes);
  if (opensAtInfo) {
    const minsUntil = minutesUntilOpen(hours, dayOfWeek, minutes);
    if (minsUntil !== null && minsUntil <= 60) {
      return { kind: 'opensSoon', label: null, opensAt: opensAtInfo.time, opensAtDay: opensAtInfo.day, closesAt: null };
    }
  }

  return {
    kind: 'closedByHours',
    label: null,
    opensAt: opensAtInfo?.time ?? null,
    opensAtDay: opensAtInfo?.day ?? null,
    closesAt: null,
  };
}
