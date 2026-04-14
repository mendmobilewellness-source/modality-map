import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapView.css';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const LA_CENTER = [-118.2437, 34.0522];
const LA_ZOOM   = 10;

function createPinEl() {
  const el = document.createElement('div');
  el.className = 'map-pin-marker';
  // Inner wrapper gets the hover scale — outer element must NOT have transform transition
  // because Mapbox uses transform to position markers and a transition causes drift on pan
  el.innerHTML = `
    <div class="map-pin-inner">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 10.627 14.184 22.65 15.136 23.47a1.25 1.25 0 0 0 1.728 0C17.816 38.65 32 26.627 32 16 32 7.163 24.837 0 16 0z" fill="#FF6B4A"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    </div>
  `;
  return el;
}

export default function MapView({ businesses = [], onBusinessClick, isVisible, hoveredCardId, onPinHover, onPinLeave, onRegisterCenter }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);
  const popupRef     = useRef(null);
  const elMapRef     = useRef(new Map()); // id → DOM element

  // Initialize map once
  useEffect(() => {
    if (!TOKEN) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: LA_CENTER,
      zoom: LA_ZOOM,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    popupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: [0, -38],
      className: 'map-name-popup',
    });

    mapRef.current = map;

    // Register center callback so Home.jsx can fly to user location
    onRegisterCenter?.((loc) => {
      mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 12 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Resize when becoming visible
  useEffect(() => {
    if (isVisible && mapRef.current) {
      setTimeout(() => mapRef.current?.resize(), 50);
    }
  }, [isVisible]);

  // Sync markers when businesses change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];
    elMapRef.current.clear();

    businesses.forEach((b) => {
      if (!b.latitude || !b.longitude) return;

      const el = createPinEl();
      elMapRef.current.set(b.id, el);

      el.addEventListener('mouseenter', () => {
        popupRef.current
          .setLngLat([b.longitude, b.latitude])
          .setHTML(`<span class="popup-name">${b.name}</span>`)
          .addTo(mapRef.current);
        onPinHover?.(b.id);
      });

      el.addEventListener('mouseleave', () => {
        popupRef.current.remove();
        onPinLeave?.();
      });

      el.addEventListener('click', () => {
        onBusinessClick?.(b);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([b.longitude, b.latitude])
        .addTo(mapRef.current);

      markersRef.current.push({ marker, business: b });
    });
  }, [businesses, onBusinessClick, onPinHover, onPinLeave]);

  // Highlight the pin matching the hovered card
  useEffect(() => {
    elMapRef.current.forEach((el, id) => {
      el.classList.toggle('highlighted', id === hoveredCardId);
    });
  }, [hoveredCardId]);

  if (!TOKEN) {
    return (
      <div className="map-no-token">
        <p>Add <code>VITE_MAPBOX_TOKEN</code> to <code>.env.local</code> to enable the map.</p>
      </div>
    );
  }

  return <div ref={containerRef} className="mapbox-container" />;
}
