import React, { useState, useEffect, useRef } from 'react';
import { MapMarker, Cat, User, UserRole } from '../types';
import { ApiService } from '../services/api';
import { MapPin, Plus, AlertCircle, X } from 'lucide-react';

interface MapProps {
  user: User;
}

export const Map: React.FC<MapProps> = ({ user }) => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<{ x: number, y: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>('https://www.thk.edu.tr/storage/public/images/tiny/5/Ekran%20Resmi%202020-12-08%2013.12.01.png');
  const mapRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [newMarkerType, setNewMarkerType] = useState<'CAT' | 'FOOD'>('CAT');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [markerDescription, setMarkerDescription] = useState('');
  // Food Details
  const [foodAmount, setFoodAmount] = useState<string>('');
  const [foodType, setFoodType] = useState<'DRY' | 'WET'>('DRY');

  // Marker Detail Popup
  const [viewingMarker, setViewingMarker] = useState<MapMarker | null>(null);

  useEffect(() => {
    loadData();
    // Simulate live updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const settings = await ApiService.getSettings().catch(err => {
        console.error("Ayarlar yüklenemedi (Settings load failed):", err);
        return { foodMarkerDurationHours: 24 };
      });

      const allMarkers = await ApiService.getMarkers().catch(err => {
        console.error("İşaretler yüklenemedi (Markers load failed):", err);
        return [];
      });

      const c = await ApiService.getCats().catch(err => {
        console.error("Kediler yüklenemedi (Cats load failed):", err);
        return [];
      });

      // Filter markers based on TTL
      const now = Date.now();
      const maxAgeMs = (settings.foodMarkerDurationHours || 24) * 60 * 60 * 1000;

      const activeMarkers = allMarkers.filter(m => {
        if (m.type === 'CAT') return true;
        return (now - m.timestamp) < maxAgeMs;
      });

      setMarkers(activeMarkers);
      setCats(c.filter(cat => cat.isApproved));
    } catch (error) {
      console.error("Harita verileri yüklenirken genel hata:", error);
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSelectedPoint({ x, y });
    setViewingMarker(null); // Close viewing if opening new
    setShowModal(true);
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

    setShowModal(false);
    setSelectedPoint(null);
    setMarkerDescription('');
    setSelectedCatId('');
    setFoodAmount('');
    loadData();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Kampüs Haritası</h2>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
            <InfoIcon className="w-4 h-4 mr-1" />
            İşaretlemek için haritaya tıklayın
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapRef}
          className="relative w-full aspect-[16/9] bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden cursor-crosshair group"
          onClick={handleMapClick}
        >
          {/* Map Image */}
          {mapUrl ? (
            <img src={mapUrl} alt="Campus Map" className="absolute inset-0 w-full h-full object-contain bg-slate-100 dark:bg-slate-800" />
          ) : (
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 select-none pointer-events-none">
              {/* Simulating a map placeholder */}
              <div className="grid grid-cols-4 gap-4 w-full h-full p-8 opacity-20">
                <div className="bg-slate-400 dark:bg-slate-600 col-span-2 row-span-2 rounded">Rektörlük</div>
                <div className="bg-slate-400 dark:bg-slate-600 rounded">Kütüphane</div>
                <div className="bg-slate-400 dark:bg-slate-600 rounded">Yemekhane</div>
                <div className="bg-slate-400 dark:bg-slate-600 col-span-4 rounded h-12 mt-auto">Otopark</div>
              </div>
              <span className="absolute font-bold text-2xl opacity-50">KAMPÜS HARİTASI (Yüklenmedi)</span>
            </div>
          )}

          {/* Markers */}
          {markers.map(marker => {
            const isCat = marker.type === 'CAT';
            const catInfo = isCat ? cats.find(c => c.id === marker.relatedId) : null;

            return (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker hover:z-10 cursor-pointer"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingMarker(marker);
                  setShowModal(false); // Close add modal if open
                }}
              >
                <div className={`
                   relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-md transition-transform hover:scale-125
                   ${isCat ? 'bg-amber-500 animate-bounce' : 'bg-yellow-400'}
                `}>
                  {isCat ? (
                    catInfo ? <img src={catInfo.imageUrl} className="w-full h-full object-cover rounded-full" /> : <div className="w-2 h-2 bg-white rounded-full" />
                  ) : (
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  )}
                </div>
              </div>
            );
          })}

          {selectedPoint && (
            <div
              className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-ping"
              style={{ left: `${selectedPoint.x}%`, top: `${selectedPoint.y}%`, transform: 'translate(-50%, -50%)' }}
            />
          )}

          {/* Marker Detail Popup */}
          {viewingMarker && (
            <div
              className="absolute z-20 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl w-64 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200"
              style={{
                left: `${Math.min(Math.max(viewingMarker.x, 10), 90)}%`,
                top: `${Math.min(Math.max(viewingMarker.y, 20), 80)}%`, // Prevent going off screen
                transform: 'translate(-50%, -100%) translateY(-12px)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={(e) => { e.stopPropagation(); setViewingMarker(null); }} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"><X size={14} /></button>

              {viewingMarker.type === 'CAT' ? (
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                    {cats.find(c => c.id === viewingMarker.relatedId)?.name || 'Bilinmeyen Kedi'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {cats.find(c => c.id === viewingMarker.relatedId)?.description || 'Kedi görüldü.'}
                  </p>
                  <div className="text-xs text-slate-400 mt-2">
                    {new Date(viewingMarker.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-yellow-100 text-yellow-700 p-1 rounded-full"><MapPin size={14} /></div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Mama Bırakıldı</h3>
                  </div>
                  {viewingMarker.amount && (
                    <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      {viewingMarker.amount}g • {viewingMarker.foodType === 'WET' ? 'Yaş Mama' : 'Kuru Mama'}
                    </div>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    "{viewingMarker.description || 'Açıklama yok'}"
                  </p>
                  <div className="text-xs text-slate-400 border-t pt-2 dark:border-slate-700">
                    Bırakılma Zamanı: {new Date(viewingMarker.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Marker Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Konum Bildir</h3>
              <button onClick={() => setShowModal(false)}><X className="text-slate-400" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewMarkerType('CAT')}
                  className={`p-3 rounded-lg border text-center ${newMarkerType === 'CAT' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'border-slate-200 dark:border-slate-600 dark:text-slate-300'}`}
                >
                  🐱 Kedi Gördüm
                </button>
                <button
                  type="button"
                  onClick={() => setNewMarkerType('FOOD')}
                  className={`p-3 rounded-lg border text-center ${newMarkerType === 'FOOD' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'border-slate-200 dark:border-slate-600 dark:text-slate-300'}`}
                >
                  🥣 Mama Bıraktım
                </button>
              </div>

              {newMarkerType === 'CAT' ? (
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hangi Kedi?</label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg"
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
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Türü</label>
                      <select
                        value={foodType}
                        onChange={(e) => setFoodType(e.target.value as any)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg"
                      >
                        <option value="DRY">Kuru Mama</option>
                        <option value="WET">Yaş Mama</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Açıklama (Max 50)</label>
                    <input
                      type="text"
                      maxLength={50}
                      value={markerDescription}
                      onChange={(e) => setMarkerDescription(e.target.value)}
                      placeholder="Örn: Kapınin yanına bıraktım"
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg"
                    />
                    <div className="text-right text-xs text-slate-400 mt-1">{markerDescription.length}/50</div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitMarker}
                className="w-full bg-slate-900 dark:bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-amber-700"
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

function InfoIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
}