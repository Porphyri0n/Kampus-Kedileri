import React, { useEffect, useState } from 'react';
import { Cat, CatStatus, UserRole, User } from '../types';
import { ApiService } from '../services/api';
import { Check, X, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  user: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allCats = await ApiService.getCats();
    setCats(allCats);
  };

  const handleApprove = async (catId: string) => {
    await ApiService.updateCat(catId, { isApproved: true });
    loadData();
  };

  const handleDelete = async (catId: string) => {
    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      await ApiService.deleteCat(catId);
      loadData();
    }
  };

  const handleStatusChange = async (catId: string, status: CatStatus) => {
    await ApiService.updateCat(catId, { status });
    loadData();
  };

  const handlePostNews = async () => {
    if (!newsTitle || !newsContent) return;
    await ApiService.addNews({
      title: newsTitle,
      content: newsContent
    });
    setNewsTitle('');
    setNewsContent('');
    alert('Haber yayınlandı!');
  };



  if (user.role !== UserRole.ADMIN) {
    return <div className="text-red-500 text-center p-8">Yetkisiz Erişim</div>;
  }

  const pendingCats = cats.filter(c => !c.isApproved);
  const activeCats = cats.filter(c => c.isApproved);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Yönetim Paneli</h2>

      {/* Pending Approvals */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center text-slate-800 dark:text-slate-100">
          Onay Bekleyenler
          {pendingCats.length > 0 && <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{pendingCats.length}</span>}
        </h3>

        {pendingCats.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">Bekleyen işlem yok.</p>
        ) : (
          <div className="space-y-4">
            {pendingCats.map(cat => (
              <div key={cat.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <img src={cat.imageUrl} className="w-12 h-12 rounded object-cover bg-slate-100 dark:bg-slate-700" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{cat.name || 'İsimsiz'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{cat.description.substring(0, 50)}...</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleApprove(cat.id)} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={16} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Cat Management */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Kedi Listesi ve Durum</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
              <tr>
                <th className="p-2">İsim</th>
                <th className="p-2">Bölge</th>
                <th className="p-2">Durum</th>
                <th className="p-2 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {activeCats.map(cat => (
                <tr key={cat.id}>
                  <td className="p-2 font-medium text-slate-900 dark:text-slate-200">{cat.name}</td>
                  <td className="p-2 text-slate-500 dark:text-slate-400">{cat.zone}</td>
                  <td className="p-2">
                    <select
                      value={cat.status}
                      onChange={(e) => handleStatusChange(cat.id, e.target.value as CatStatus)}
                      className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs p-1 text-slate-900 dark:text-slate-200"
                    >
                      <option value="ALIVE">Kampüste</option>
                      <option value="ADOPTED">Sahiplenildi</option>
                      <option value="DECEASED">Melek</option>
                    </select>
                  </td>
                  <td className="p-2 text-right">
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* News Posting */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Haber / Duyuru Paylaş</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Başlık"
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded p-2"
            value={newsTitle}
            onChange={e => setNewsTitle(e.target.value)}
          />
          <textarea
            placeholder="İçerik..."
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded p-2 h-24"
            value={newsContent}
            onChange={e => setNewsContent(e.target.value)}
          />
          <button onClick={handlePostNews} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">
            Yayınla
          </button>
        </div>
      </div>
      {/* System Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Sistem Ayarları</h3>
        <SettingsForm />
      </div>
    </div>
  );
};

const SettingsForm = () => {
  const [foodDuration, setFoodDuration] = useState(24);
  const [catDuration, setCatDuration] = useState(12);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ApiService.getSettings().then(s => {
      setFoodDuration(s.foodMarkerDurationHours);
      setCatDuration(s.catMarkerDurationHours || 12);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await ApiService.updateSettings({
      foodMarkerDurationHours: foodDuration,
      catMarkerDurationHours: catDuration
    });
    setLoading(false);
    alert('Ayarlar kaydedildi.');
  };

  return (
    <div className="flex items-end space-x-4">
      <div className="flex-1 max-w-xs">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Mama Bildirimi Süresi (Saat)
        </label>
        <input
          type="number"
          min="1"
          value={foodDuration}
          onChange={(e) => setFoodDuration(parseInt(e.target.value))}
          className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded p-2"
        />
        <p className="text-xs text-slate-500 mt-1">
          Eski mama bildirimlerinin süresi.
        </p>
      </div>

      <div className="flex-1 max-w-xs">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Kedi Bildirimi Süresi (Saat)
        </label>
        <input
          type="number"
          min="1"
          value={catDuration}
          onChange={(e) => setCatDuration(parseInt(e.target.value))}
          className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded p-2"
        />
        <p className="text-xs text-slate-500 mt-1">
          Eski kedi görüldü bildirimlerinin süresi.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50 h-[42px]"
      >
        {loading ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  );
};