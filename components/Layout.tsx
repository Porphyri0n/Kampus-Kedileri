import React from 'react';
import { User, UserRole } from '../types';
import { Home, Map as MapIcon, PlusCircle, User as UserIcon, LogOut, Settings, Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, activeTab, onTabChange, onLogout, darkMode, toggleTheme }) => {
  if (!user) return <>{children}</>;

  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => onTabChange(id)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
          isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <Icon size={24} className={isActive ? 'fill-current' : ''} />
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-200">
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 px-4 py-3 shadow-sm flex justify-between items-center transition-colors duration-200">
        <div className="flex items-center space-x-2">
           {/* Logo Placeholder */}
           <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">T</div>
           <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">THKÜ Kedileri</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme} 
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">Merhaba, {user.name}</span>
          
          {user.role === UserRole.ADMIN && (
            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded">YÖNETİCİ</span>
          )}
          
          <button onClick={onLogout} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 sm:pb-4">
        <div className="max-w-4xl mx-auto p-4">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 h-16 flex justify-around items-center px-2 z-30 shadow-lg lg:hidden transition-colors duration-200">
        <NavItem id="dashboard" icon={Home} label="Pano" />
        <NavItem id="map" icon={MapIcon} label="Harita" />
        <NavItem id="add" icon={PlusCircle} label="Ekle" />
        <NavItem id="profile" icon={UserIcon} label="Profil" />
        {user.role === UserRole.ADMIN && (
          <NavItem id="admin" icon={Settings} label="Yönetim" />
        )}
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed top-16 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col p-4 space-y-2 transition-colors duration-200">
         <button onClick={() => onTabChange('dashboard')} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <Home size={20} /> <span>Kedi Panosu</span>
         </button>
         <button onClick={() => onTabChange('map')} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'map' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <MapIcon size={20} /> <span>Harita</span>
         </button>
         <button onClick={() => onTabChange('add')} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'add' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <PlusCircle size={20} /> <span>Kedi Ekle</span>
         </button>
         <button onClick={() => onTabChange('profile')} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <UserIcon size={20} /> <span>Profilim</span>
         </button>
         {user.role === UserRole.ADMIN && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2 px-3">Yönetici</div>
                <button onClick={() => onTabChange('admin')} className={`flex items-center space-x-3 p-3 rounded-lg w-full transition-colors ${activeTab === 'admin' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    <Settings size={20} /> <span>Panel</span>
                </button>
            </div>
         )}
      </div>
    </div>
  );
};