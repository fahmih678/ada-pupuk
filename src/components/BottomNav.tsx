import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  History, 
  Users, 
  Boxes, 
  FileSpreadsheet, 
  Settings 
} from 'lucide-react';

export type TabType = 'dashboard' | 'penebusan' | 'riwayat' | 'petani' | 'stok' | 'laporan' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, pendingCount = 0 }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Beranda', icon: LayoutDashboard },
    { id: 'petani' as TabType, label: 'Petani', icon: Users },
    { id: 'penebusan' as TabType, label: 'Tebus', icon: ShoppingBag, isPrimary: true },
    { id: 'stok' as TabType, label: 'Stok', icon: Boxes },
    { id: 'laporan' as TabType, label: 'Laporan', icon: FileSpreadsheet },
    { id: 'settings' as TabType, label: 'Setelan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg safe-area-bottom pb-1">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="relative -top-3 flex flex-col items-center justify-center focus:outline-none group"
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                    isActive
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-emerald-500/30'
                      : 'bg-emerald-600 text-white shadow-emerald-600/40 hover:bg-emerald-700'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 focus:outline-none transition-colors active:scale-95 ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.id === 'riwayat' && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    !
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

