import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { Cat, CatStatus, NewsItem } from '../types';
import { Heart, MapPin, Activity, Bell } from 'lucide-react';

interface DashboardProps {
  onCatSelect: (cat: Cat) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCatSelect }) => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ALIVE' | 'ADOPTED' | 'DECEASED'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedCats, fetchedNews] = await Promise.all([
        ApiService.getCats(),
        ApiService.getNews()
      ]);
      // Only show approved cats on dashboard
      setCats(fetchedCats.filter(c => c.isApproved));
      setNews(fetchedNews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCats = cats.filter(cat => {
    if (filter === 'ALL') return true;
    return cat.status === filter;
  });

  const getStatusBadge = (status: CatStatus) => {
    switch (status) {
      case CatStatus.ALIVE:
        return <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">Kampüste</span>;
      case CatStatus.ADOPTED:
        return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">Sahiplenildi</span>;
      case CatStatus.DECEASED:
        return <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full font-medium">Melek Oldu</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8">
      {/* News Section */}
      {news.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-yellow-100 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10">
          <div className="flex items-center space-x-2 mb-4">
             <Bell className="text-amber-500" size={20} />
             <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Duyurular</h2>
          </div>
          <div className="space-y-4">
            {news.map(item => (
              <div key={item.id} className="border-b border-yellow-100 dark:border-yellow-900/30 pb-3 last:border-0 last:pb-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-200">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.content}</p>
                <div className="text-xs text-slate-400 mt-2">{new Date(item.date).toLocaleDateString('tr-TR')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'ALL', label: 'Tümü' },
          { key: 'ALIVE', label: 'Yaşayan' },
          { key: 'ADOPTED', label: 'Sahiplenildi' },
          { key: 'DECEASED', label: 'Melek' }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCats.map(cat => (
          <div 
            key={cat.id}
            onClick={() => onCatSelect(cat)}
            className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group ${cat.status === CatStatus.DECEASED ? 'grayscale' : ''}`}
          >
            <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img 
                src={cat.imageUrl} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                 {getStatusBadge(cat.status)}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{cat.name}</h3>
                <div className="flex items-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded">
                   <Activity size={12} className="mr-1" />
                   {cat.feedingLogs?.length || 0} Kayıt
                </div>
              </div>
              
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-3">
                <MapPin size={16} className="mr-1 text-slate-400 dark:text-slate-500" />
                {cat.zone}
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {cat.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCats.length === 0 && (
         <div className="text-center py-12 text-slate-400">
            Bu kategoride kayıtlı kedi bulunamadı.
         </div>
      )}
    </div>
  );
};