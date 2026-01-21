import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, ImageOverlay, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, X, Cat as CatIcon, Utensils, Info } from 'lucide-react';
import { MapMarker, Cat, User } from '../types';
import { ApiService } from '../services/api';

// Fix Leaflet's default icon path issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  user: User;
  focusLocation?: { x: number; y: number; description?: string };
}

// Map Configuration
// Using 16:9 aspect ratio dimensions for the coordinate system
const MAP_WIDTH = 1600;
const MAP_HEIGHT = 900;
const BOUNDS: L.LatLngBoundsExpression = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];

// Helper to convert % to Map Coordinates
// Leaflet Simple CRS: [0,0] is usually bottom-left.
// But we want to map standard image coordinates where (0,0) is top-left.
// So we invert Y.
const toMapCoords = (xPercent: number, yPercent: number): L.LatLngExpression => {
  const x = (xPercent / 100) * MAP_WIDTH;
  const y = (1 - (yPercent / 100)) * MAP_HEIGHT;
  return [y, x]; // [Lat, Lng] means [Y, X] in CRS.Simple
};

// Helper to convert Map Coordinates to %
const toPercentCoords = (lat: number, lng: number) => {
  const x = (lng / MAP_WIDTH) * 100;
  const y = (1 - (lat / MAP_HEIGHT)) * 100;
  return { x, y };
};



// Custom Icon Generator
const createCustomIcon = (type: 'CAT' | 'FOOD', catInfo?: Cat) => {
  const isCat = type === 'CAT';

  const html = renderToStaticMarkup(
    <div className={`
      relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md transform hover:scale-110 transition-transform duration-200 cursor-pointer
      ${isCat ? 'bg-amber-500' : 'bg-yellow-400'}
    `}>
      {isCat ? (
        catInfo?.imageUrl ? (
          <img src={catInfo.imageUrl} className="w-full h-full object-cover rounded-full" alt={catInfo.name} />
        ) : (
          <CatIcon size={20} className="text-white" />
        )
      ) : (
        <Utensils size={20} className="text-white p-1" />
      )}
    </div>
  );

  return L.divIcon({
    html: html,
    className: '', // Empty class to avoid default styles interfering
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Custom Popup Component (replaces Leaflet's Popup to avoid autoPan)
interface CustomPopupProps {
  marker: MapMarker;
  catInfo?: Cat;
  position: { x: number; y: number };
  onClose: () => void;
}

const CustomPopup: React.FC<CustomPopupProps> = ({ marker, catInfo, position, onClose }) => {
  return (
    <div
      className="absolute z-[1000] transform -translate-x-1/2 -translate-y-full pointer-events-auto"
      style={{
        left: position.x,
        top: position.y - 25, // Offset above the marker
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 min-w-[250px] max-w-[300px] animate-in fade-in zoom-in duration-150">
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-700 rounded-full shadow-md flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors z-10"
        >
          <X size={14} className="text-slate-500 hover:text-red-500" />
        </button>

        <div className="p-3">
          {marker.type === 'CAT' ? (
            <div className="flex flex-col gap-2">
              <div className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-white">
                {catInfo ? catInfo.name : 'Bilinmeyen Kedi'}
                <span className="text-xs font-normal px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full">Kedi</span>
              </div>
              {catInfo?.imageUrl && (
                <img src={catInfo.imageUrl} alt={catInfo.name} className="w-full h-32 object-cover rounded-md" />
              )}
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {marker.description || 'Kedi görüldü.'}
              </p>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {new Date(marker.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-white">
                Mama Bırakıldı
                <span className="text-xs font-normal px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">Yemek</span>
              </div>
              {marker.amount && (
                <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {marker.amount}g • {marker.foodType === 'WET' ? 'Yaş Mama' : 'Kuru Mama'}
                </div>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-300">
                "{marker.description || 'Açıklama yok'}"
              </p>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Bırakılma Zamanı: {new Date(marker.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
        </div>

        {/* Arrow pointing down */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-slate-800"></div>
      </div>
    </div>
  );
};

export const Map: React.FC<MapProps> = ({ user, focusLocation }) => {
  // State
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<{ x: number, y: number } | null>(null);

  // Custom popup state
  const [activePopup, setActivePopup] = useState<{ marker: MapMarker; screenPos: { x: number; y: number } } | null>(null);

  // Map ref for coordinate conversion
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Use the existing map image or a placeholder
  const mapUrl = 'https://www.thk.edu.tr/storage/public/images/tiny/5/Ekran%20Resmi%202020-12-08%2013.12.01.png';

  // Modal State
  const [newMarkerType, setNewMarkerType] = useState<'CAT' | 'FOOD'>('CAT');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [markerDescription, setMarkerDescription] = useState('');
  const [foodAmount, setFoodAmount] = useState<string>('');
  const [foodType, setFoodType] = useState<'DRY' | 'WET'>('DRY');

  // Ref to track marker clicks
  const markerClickedRef = useRef(false);

  // Update popup position when map moves
  const updatePopupPosition = () => {
    if (activePopup && mapRef.current && mapContainerRef.current) {
      const coords = toMapCoords(activePopup.marker.x, activePopup.marker.y) as [number, number];
      const point = mapRef.current.latLngToContainerPoint(coords);
      setActivePopup(prev => prev ? { ...prev, screenPos: { x: point.x, y: point.y } } : null);
    }
  };

  // Map Events Component
  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        // If a marker was just clicked, don't process map click
        if (markerClickedRef.current) {
          markerClickedRef.current = false;
          return;
        }

        // Close popup if clicking on map (not on a marker)
        setActivePopup(null);
        handleMapClick(e.latlng.lat, e.latlng.lng);
      },
      move() {
        updatePopupPosition();
      },
      zoom() {
        updatePopupPosition();
      },
    });

    // Store map reference
    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    return null;
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle focus location
  useEffect(() => {
    if (focusLocation && mapRef.current) {
      const coords = toMapCoords(focusLocation.x, focusLocation.y) as [number, number];
      mapRef.current.flyTo(coords, 0, { animate: true, duration: 1.5 });
      // Also open popup or just show marker? The red pulsating marker is enough as per plan.
    }
  }, [focusLocation]);

  const loadData = async () => {
    try {
      const settings = await ApiService.getSettings().catch(() => ({ foodMarkerDurationHours: 24, catMarkerDurationHours: 12 }));
      const allMarkers = await ApiService.getMarkers().catch(() => []);
      const c = await ApiService.getCats().catch(() => []);

      const now = Date.now();
      const maxFoodAgeMs = (settings.foodMarkerDurationHours || 24) * 60 * 60 * 1000;
      const maxCatAgeMs = (settings.catMarkerDurationHours || 12) * 60 * 60 * 1000;

      const activeMarkers = allMarkers.filter(m => {
        if (m.type === 'CAT') {
          return (now - m.timestamp) < maxCatAgeMs;
        }
        return (now - m.timestamp) < maxFoodAgeMs;
      });

      setMarkers(activeMarkers);
      setCats(c.filter(cat => cat.isApproved));
    } catch (error) {
      console.error("Harita verileri yüklenemedi:", error);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    const coords = toPercentCoords(lat, lng);

    // Bounds check
    if (coords.x < 0 || coords.x > 100 || coords.y < 0 || coords.y > 100) return;

    setSelectedPoint(coords);
    setShowModal(true);
  };

  const handleMarkerClick = (marker: MapMarker, e: L.LeafletMouseEvent) => {
    // Set flag to prevent map click
    markerClickedRef.current = true;

    // Stop event propagation
    L.DomEvent.stopPropagation(e.originalEvent);

    if (!mapRef.current || !mapContainerRef.current) return;

    // Get screen position of the marker
    const coords = toMapCoords(marker.x, marker.y) as [number, number];
    const point = mapRef.current.latLngToContainerPoint(coords);

    // Toggle popup - close if same marker clicked again
    if (activePopup?.marker.id === marker.id) {
      setActivePopup(null);
    } else {
      setActivePopup({
        marker,
        screenPos: { x: point.x, y: point.y }
      });
    }
  };

  const handleSubmitMarker = async () => {
    if (!selectedPoint) return;

    await ApiService.addMarker({
      type: newMarkerType,
      x: selectedPoint.x,
      y: selectedPoint.y,
      ...(newMarkerType === 'CAT' ? { relatedId: selectedCatId } : {}),
      description: markerDescription,
      status: 'FULL',
      ...(newMarkerType === 'FOOD' ? {
        amount: parseInt(foodAmount) || 0,
        foodType: foodType
      } : {})
    });

    closeModal();
    loadData();
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPoint(null);
    setMarkerDescription('');
    setSelectedCatId('');
    setFoodAmount('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Kampüs Haritası</h2>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            İşaretlemek için haritaya tıklayın
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 z-0"
        >
          <MapContainer
            center={[MAP_HEIGHT / 2, MAP_WIDTH / 2]}
            zoom={0}
            minZoom={-2}
            scrollWheelZoom={true}
            crs={L.CRS.Simple}
            maxBounds={[[-200, -200], [MAP_HEIGHT + 200, MAP_WIDTH + 200]]}
            style={{ height: '100%', width: '100%', background: 'transparent' }}
          >
            <ImageOverlay
              url={mapUrl}
              bounds={BOUNDS}
            />

            <MapEvents />

            {/* Existing Markers */}
            {markers.map(marker => {
              const catInfo = marker.type === 'CAT' ? cats.find(c => c.id === marker.relatedId) : undefined;

              return (
                <Marker
                  key={marker.id}
                  position={toMapCoords(marker.x, marker.y)}
                  icon={createCustomIcon(marker.type, catInfo)}
                  keyboard={false}
                  bubblingMouseEvents={false}
                  eventHandlers={{
                    click: (e) => {
                      // Tüm event propagation'ı durdur
                      L.DomEvent.stop(e.originalEvent);
                      handleMarkerClick(marker, e);
                    },
                  }}
                />
              );
            })}

            {focusLocation && (
              <Marker
                position={toMapCoords(focusLocation.x, focusLocation.y)}
                icon={L.divIcon({
                  html: `<div class="w-8 h-8 bg-purple-600 rounded-full border-2 border-white shadow-lg animate-bounce flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
                  className: '',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
                })}
              />
            )}

            {/* Selected Point Indicator (Preview) */}
            {selectedPoint && (
              <Marker
                position={toMapCoords(selectedPoint.x, selectedPoint.y)}
                icon={L.divIcon({
                  html: '<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>',
                  className: '',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })}
              />
            )}

          </MapContainer>

          {/* Custom Popup Overlay (outside of Leaflet) */}
          {activePopup && (
            <CustomPopup
              marker={activePopup.marker}
              catInfo={activePopup.marker.type === 'CAT' ? cats.find(c => c.id === activePopup.marker.relatedId) : undefined}
              position={activePopup.screenPos}
              onClose={() => setActivePopup(null)}
            />
          )}
        </div>
      </div>

      {/* Add Marker Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Konum Bildir</h3>
              <button onClick={closeModal}><X className="text-slate-400 hover:text-red-500 transition-colors" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewMarkerType('CAT')}
                  className={`p-3 rounded-lg border text-center transition-all ${newMarkerType === 'CAT' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-2 ring-amber-200 dark:ring-amber-900' : 'border-slate-200 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <CatIcon size={20} />
                    <span className="font-medium">Kedi Gördüm</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNewMarkerType('FOOD')}
                  className={`p-3 rounded-lg border text-center transition-all ${newMarkerType === 'FOOD' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 ring-2 ring-yellow-200 dark:ring-yellow-900' : 'border-slate-200 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Utensils size={20} />
                    <span className="font-medium">Mama Bıraktım</span>
                  </div>
                </button>
              </div>

              {newMarkerType === 'CAT' ? (
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hangi Kedi?</label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="">-- Seçiniz --</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    <option value="unknown">Tanımıyorum / Yeni Kedi</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Miktar (gr)</label>
                      <input
                        type="number"
                        value={foodAmount}
                        onChange={(e) => setFoodAmount(e.target.value)}
                        placeholder="100"
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Türü</label>
                      <select
                        value={foodType}
                        onChange={(e) => setFoodType(e.target.value as any)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      >
                        <option value="DRY">Kuru Mama</option>
                        <option value="WET">Yaş Mama</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Açıklama (Max 50)</label>
                <input
                  type="text"
                  maxLength={50}
                  value={markerDescription}
                  onChange={(e) => setMarkerDescription(e.target.value)}
                  placeholder="Örn: Kapının yanına bıraktım"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="text-right text-xs text-slate-400 mt-1">{markerDescription.length}/50</div>
              </div>

              <button
                type="button"
                onClick={handleSubmitMarker}
                className="w-full bg-slate-900 dark:bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-amber-700 transition-colors shadow-lg active:scale-95 transform"
              >
                Bildirimi Paylaş
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};