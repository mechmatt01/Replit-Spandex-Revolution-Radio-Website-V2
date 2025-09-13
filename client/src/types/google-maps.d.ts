/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google: typeof google;
    initMapCallback?: () => void;
  }

  namespace google {
    namespace maps {
      interface Map {
        setOptions(options: google.maps.MapOptions): void;
        invalidateSize(): void;
        flyTo(center: google.maps.LatLng | google.maps.LatLngLiteral, zoom: number, options?: {
          duration?: number;
          easeLinearity?: number;
        }): void;
      }
      
      namespace marker {
        class AdvancedMarkerElement {
          constructor(options?: google.maps.marker.AdvancedMarkerElementOptions);
          position: google.maps.LatLng | google.maps.LatLngLiteral | null;
          map: google.maps.Map | null;
          title: string;
          content: Element | null;
          gmpClickable: boolean;
          addListener(eventName: string, handler: Function): google.maps.MapsEventListener;
        }
        
        interface AdvancedMarkerElementOptions {
          position?: google.maps.LatLng | google.maps.LatLngLiteral;
          map?: google.maps.Map;
          title?: string;
          content?: Element;
          gmpClickable?: boolean;
        }
      }
    }
  }
}

export {};