
import React from 'react';
import { View } from '../types.ts';
import { HomeIcon, ScanLineIcon, AlertTriangleIcon, UserIcon, UsersIcon } from './common/Icons.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';

interface BottomNavBarProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactElement<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-green-600';
  const inactiveClasses = 'text-gray-500 hover:text-green-500';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-full transition-colors duration-200 icon-bounce spring ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setView }) => {
  const { t } = useTranslation();
  
  const items = [
    { view: View.DASHBOARD, label: t('navHome'), icon: <HomeIcon /> },
    { view: View.CLASSIFIER, label: t('navClassify'), icon: <ScanLineIcon /> },
    { view: View.COMMUNITY, label: t('navCommunity'), icon: <UsersIcon /> },
    { view: View.REPORT, label: t('navReport'), icon: <AlertTriangleIcon /> },
    { view: View.PROFILE, label: t('navProfile'), icon: <UserIcon /> },
  ];


  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-20">
      <div className="flex justify-around items-center bg-white/70 backdrop-blur-lg shadow-2xl shadow-gray-400/30 rounded-full h-20 px-2">
        {items.map((item) => (
          <NavItem
            key={item.view}
            label={item.label}
            icon={item.icon}
            isActive={currentView === item.view}
            onClick={() => setView(item.view)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;