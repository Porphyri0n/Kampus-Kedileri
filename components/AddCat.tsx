import React, { useState, useRef } from 'react';
import { CampusZone } from '../types';
import { ApiService } from '../services/api';
import { Camera } from 'lucide-react';

interface AddCatProps {
  onSuccess: () => void;
}

export const AddCat: React.FC<AddCatProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [zone, setZone] = useState<CampusZone>(CampusZone.UNKNOWN);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [features, setFeatures] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await ApiService.addCat({
        name: name || 'İsimsiz',
        status: 'ALIVE' as any,
        zone,
        description,
        color,
        features
      }, selectedFile || undefined);

      setSubmitting(false);
      onSuccess();
      setToast({ message: 'Kedi başvurusu alındı! Yönetici onayından sonra yayınlanacaktır.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      console.error(error);
      setToast({ message: error.message || 'Kedi eklenirken bir hata oluştu.', type: 'error' });
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative">
      {toast && (
        <div className={`absolute top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Yeni Kedi Ekle</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors relative overflow-hidden"
          style={{ minHeight: '160px' }}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Önizleme" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={32} className="mb-2" />
              <span className="text-sm">Fotoğraf Yükle</span>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        {previewUrl && <div className="text-center text-xs text-slate-500 cursor-pointer" onClick={() => fileInputRef.current?.click()}>Değiştirmek için tıklayın</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">İsim (Biliyorsanız)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="İsimsiz"
            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Görüldüğü Bölge</label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value as CampusZone)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg"
          >
            {Object.values(CampusZone).map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Renk</label>
            <input type="text" value={color} required onChange={(e) => setColor(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Özellikler</label>
            <input type="text" value={features} required onChange={(e) => setFeatures(e.target.value)} placeholder="Uzun tüylü, tek gözü vb." className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg h-24"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {submitting ? 'Gönderiliyor...' : 'Kaydet ve Onaya Gönder'}
        </button>
      </form>
    </div>
  );
};