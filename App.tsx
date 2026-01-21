import React, { useState, useEffect } from 'react';
import { User, Cat, UserRole } from './types';
import { ApiService } from './services/api';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CatDetail } from './components/CatDetail';
import { Map } from './components/Map';
import { AddCat } from './components/AddCat';
import { AdminPanel } from './components/AdminPanel';
import { Save, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [tempLocation, setTempLocation] = useState<{ x: number, y: number } | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Profile Edit State
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<Partial<User>>({});

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Check for existing session
  useEffect(() => {
    const unsubscribe = ApiService.subscribeToAuth((u) => {
      setUser(u);
      if (u) {
        setProfileData({
          name: u.name,
          department: u.department,
          grade: u.grade,
          studentId: u.studentId
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    ApiService.logout();
    setSelectedCat(null);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await ApiService.updateUserProfile(user.id, profileData);
      setEditingProfile(false);
      alert('Profil güncellendi!');
    } catch (e) {
      console.error(e);
      alert('Profil güncellenirken hata oluştu.');
    }
  };

  const renderContent = () => {
    if (selectedCat) {
      return (
        <CatDetail
          cat={selectedCat}
          user={user!}
          onBack={() => setSelectedCat(null)}
          onUpdate={() => setSelectedCat(null)}
          onLocationClick={(log) => {
            setTempLocation({ x: log.x, y: log.y });
            setSelectedCat(null);
            setActiveTab('map');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onCatSelect={setSelectedCat} />;
      case 'map':
        return <Map user={user!} focusLocation={tempLocation} />;
      case 'add':
        return <AddCat onSuccess={() => setActiveTab('dashboard')} />;
      case 'profile':
        return (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profilim</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="text-amber-600 dark:text-amber-400 text-sm hover:underline"
                >
                  Düzenle
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">İsim Soyisim</label>
                <input
                  type="text"
                  disabled={!editingProfile}
                  value={editingProfile ? profileData.name : user?.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email - Not Editable */}
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Giriş E-postası</label>
                <div className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {user?.email}
                </div>
              </div>

              {/* School Email - Not Editable */}
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Okul E-postası</label>
                <div className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {user?.schoolEmail || '-'}
                </div>
              </div>

              {/* Role Specific */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Bölüm</label>
                  <input
                    type="text"
                    disabled={!editingProfile}
                    value={editingProfile ? profileData.department : user?.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                {user?.role === UserRole.STUDENT && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Öğrenci No</label>
                      <input
                        type="text"
                        disabled={!editingProfile}
                        value={editingProfile ? profileData.studentId : user?.studentId}
                        onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Sınıf</label>
                      <select
                        disabled={!editingProfile}
                        value={editingProfile ? profileData.grade : user?.grade}
                        onChange={(e) => setProfileData({ ...profileData, grade: e.target.value })}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <option value="Hazırlık">Hazırlık</option>
                        <option value="1. Sınıf">1. Sınıf</option>
                        <option value="2. Sınıf">2. Sınıf</option>
                        <option value="3. Sınıf">3. Sınıf</option>
                        <option value="4. Sınıf">4. Sınıf</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {editingProfile && (
                <div className="flex space-x-2 mt-6">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 flex items-center justify-center"
                  >
                    <Save size={18} className="mr-2" /> Kaydet
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      // Reset data
                      setProfileData({
                        name: user?.name,
                        department: user?.department,
                        grade: user?.grade,
                        studentId: user?.studentId
                      });
                    }}
                    className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">Diğer İşlemler</h3>
              <button className="text-amber-600 dark:text-amber-400 text-sm hover:underline block mb-2">Şifre Değiştir</button>
              <div className="text-xs text-slate-400 mt-4">
                Kayıtlı Rol: <span className="font-semibold">{user?.role}</span>
              </div>
            </div>
          </div>
        );
      case 'admin':
        return <AdminPanel user={user!} />;
      default:
        return <Dashboard onCatSelect={setSelectedCat} />;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">Yükleniyor...</div>;

  if (!user) {
    return <Auth />;
  }

  // Verification Check
  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md text-center border border-slate-200 dark:border-slate-700">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">E-posta Doğrulaması Bekleniyor</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Hesabınıza erişebilmek için lütfen <strong>{user.email}</strong> adresine gönderilen doğrulama bağlantısına tıklayın.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 flex items-center justify-center"
            >
              <RefreshCw size={18} className="mr-2" /> Onayladım, Sayfayı Yenile
            </button>
            <button
              onClick={() => ApiService.resendVerification().then(() => alert('Doğrulama e-postası tekrar gönderildi.'))}
              className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Tekrar Gönder
            </button>
            <button
              onClick={() => ApiService.logout()}
              className="w-full text-red-500 hover:text-red-700 text-sm flex items-center justify-center mt-4"
            >
              <LogOut size={16} className="mr-1" /> Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout
      user={user}
      activeTab={selectedCat ? 'dashboard' : activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedCat(null);
        setTempLocation(undefined);
      }}
      onLogout={handleLogout}
      darkMode={darkMode}
      toggleTheme={() => setDarkMode(!darkMode)}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;