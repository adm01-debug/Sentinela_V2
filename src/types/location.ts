export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface LocationHistory {
  coordinates: Coordinates;
  timestamp: string;
  address?: Address;
}