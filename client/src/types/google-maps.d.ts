declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      getZoom(): number;
      panTo(latLng: LatLng | LatLngLiteral): void;
      getBounds(): LatLngBounds | null;
      getProjection(): Projection | null;
      setOptions(options: MapOptions): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      getMap(): Map | null;
      setPosition(latlng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng;
      setTitle(title: string): void;
      getTitle(): string;
      setIcon(icon: string | Icon | Symbol): void;
      getIcon(): string | Icon | Symbol;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
    }

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class OverlayView {
      constructor();
      setMap(map: Map | null): void;
      getMap(): Map | null;
      getPanes(): MapPanes;
      getProjection(): MapCanvasProjection;
      onAdd(): void;
      draw(): void;
      onRemove(): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      scaleControl?: boolean;
      streetViewControl?: boolean;
      rotateControl?: boolean;
      fullscreenControl?: boolean;
      clickableIcons?: boolean;
      gestureHandling?: string;
      backgroundColor?: string;
      styles?: MapTypeStyle[];
      restriction?: MapRestriction;
      minZoom?: number;
      maxZoom?: number;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      zIndex?: number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
      anchor?: Point;
    }

    interface Symbol {
      path: SymbolPath | string;
      scale?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    interface MapPanes {
      floatPane: Element;
      mapPane: Element;
      markerLayer: Element;
      overlayLayer: Element;
      overlayMouseTarget: Element;
    }

    interface MapCanvasProjection {
      fromLatLngToDivPixel(latLng: LatLng | LatLngLiteral): Point;
      fromDivPixelToLatLng(pixel: Point): LatLng;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface MapRestriction {
      latLngBounds: LatLngBounds | LatLngBoundsLiteral;
      strictBounds?: boolean;
    }

    interface LatLngBoundsLiteral {
      north: number;
      south: number;
      east: number;
      west: number;
    }

    interface MapTypeStyle {
      elementType?: string;
      featureType?: string;
      stylers: object[];
    }

    interface Projection {
      fromLatLngToPoint(latLng: LatLng, point?: Point): Point;
      fromPointToLatLng(pixel: Point): LatLng;
    }

    enum MapTypeId {
      HYBRID = 'hybrid',
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      TERRAIN = 'terrain',
    }

    enum SymbolPath {
      BACKWARD_CLOSED_ARROW,
      BACKWARD_OPEN_ARROW,
      CIRCLE,
      FORWARD_CLOSED_ARROW,
      FORWARD_OPEN_ARROW,
    }
  }
}