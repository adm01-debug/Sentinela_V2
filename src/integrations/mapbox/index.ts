interface MapboxConfig {
  accessToken: string;
  style?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodingResult {
  placeName: string;
  coordinates: Coordinates;
  context: Record<string, string>;
}

class MapboxClient {
  private accessToken: string;
  private baseUrl = 'https://api.mapbox.com';

  constructor(config?: MapboxConfig) {
    this.accessToken = config?.accessToken || process.env.MAPBOX_ACCESS_TOKEN || '';
  }

  async geocode(address: string): Promise<GeocodingResult[]> {
    const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.accessToken}`;
    
    const response = await fetch(url);
    const data = await response.json();

    return data.features.map((feature: any) => ({
      placeName: feature.place_name,
      coordinates: {
        lng: feature.center[0],
        lat: feature.center[1],
      },
      context: feature.context?.reduce((acc: Record<string, string>, ctx: any) => {
        acc[ctx.id.split('.')[0]] = ctx.text;
        return acc;
      }, {}) || {},
    }));
  }

  async reverseGeocode(coords: Coordinates): Promise<GeocodingResult | null> {
    const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?access_token=${this.accessToken}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.features.length === 0) return null;

    const feature = data.features[0];
    return {
      placeName: feature.place_name,
      coordinates: coords,
      context: {},
    };
  }

  async getDirections(from: Coordinates, to: Coordinates): Promise<any> {
    const url = `${this.baseUrl}/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?access_token=${this.accessToken}&geometries=geojson`;
    
    const response = await fetch(url);
    return response.json();
  }

  getStaticMapUrl(coords: Coordinates, zoom = 14, size = '400x300'): string {
    return `${this.baseUrl}/styles/v1/mapbox/streets-v11/static/${coords.lng},${coords.lat},${zoom}/${size}?access_token=${this.accessToken}`;
  }
}

export const mapbox = new MapboxClient();
