export interface OnemapCoords {
  lat: number;
  lng: number;
}

export function onemapAmmUrl(coords: OnemapCoords, dark: boolean): string {
  const style = dark ? 'Night' : 'Default';
  return `https://www.onemap.gov.sg/amm/amm.html?mapStyle=${style}&zoomLevel=17&marker=latLng:${coords.lat},${coords.lng}!colour:red&PopupWidth=200`;
}

export function onemapUrl(coords: OnemapCoords): string {
  return `https://www.onemap.gov.sg/?lat=${coords.lat}&lng=${coords.lng}`;
}
