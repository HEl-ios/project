

import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import ToggleSwitch from './common/ToggleSwitch.tsx';
import { BellIcon } from './common/Icons.tsx';

interface UserProfileProps {
    userName: string;
    setUserName: (name: string) => void;
    buildingId: string;
    setBuildingId: (id: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName, setUserName, buildingId, setBuildingId }) => {
    const { t, language, setLanguage } = useTranslation();
    const [currentName, setCurrentName] = useState(userName);
    const [currentBuildingId, setCurrentBuildingId] = useState(buildingId);
    const [saved, setSaved] = useState(false);
    const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>('default');
    const [notificationPrefs, setNotificationPrefs] = useState({
        weeklyTips: false,
        communityAlerts: false,
    });

    useEffect(() => {
        const storedPrefs = localStorage.getItem('notificationPrefs');
        if (storedPrefs) {
            try {
                setNotificationPrefs(JSON.parse(storedPrefs));
            } catch (e) {
                console.error("Failed to parse notification prefs from localStorage", e);
            }
        }
        if ('Notification' in window) {
            setNotificationPerm(Notification.permission);
        }
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUserName(currentName);
        setBuildingId(currentBuildingId);
        localStorage.setItem('notificationPrefs', JSON.stringify(notificationPrefs));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handlePrefChange = (pref: keyof typeof notificationPrefs, value: boolean) => {
        setNotificationPrefs(prev => ({ ...prev, [pref]: value }));
    };
    
    const areNotificationsEnabled = notificationPerm === 'granted';

    return (
        <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('profileTitle')}</h2>
            <p className="text-center text-gray-500 mb-6">{t('profileDescription')}</p>
            <Card className="p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* General Settings */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            {t('profileNameLabel')}
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={currentName === 'Eco-Warrior' ? '' : currentName}
                            onChange={(e) => setCurrentName(e.target.value)}
                            placeholder={t('profileNamePlaceholder')}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200"
                        />
                    </div>
                     <div>
                        <label htmlFor="buildingId" className="block text-sm font-medium text-gray-700">
                            {t('profileBuildingLabel')}
                        </label>
                        <input
                            type="text"
                            id="buildingId"
                            value={currentBuildingId}
                            onChange={(e) => setCurrentBuildingId(e.target.value)}
                            placeholder={t('profileBuildingPlaceholder')}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                            {t('profileLanguageLabel')}
                        </label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-base text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200"
                        >
                            <option value="en">{t('english')}</option>
                            <option value="hi">{t('hindi')}</option>
                        </select>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200" />

                    {/* Notification Preferences */}
                    <div className="relative">
                        <h3 className="text-lg font-semibold text-gray-800">{t('profileNotificationsTitle')}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t('profileNotificationsDescription')}</p>
                        
                        {!areNotificationsEnabled && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                                <div className="text-center p-4 border border-dashed rounded-lg">
                                    <BellIcon className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                                    <p className="font-semibold text-gray-600">{t('profileNotificationsDisabled')}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label htmlFor="weeklyTips" className="font-medium text-gray-700">{t('profileNotificationsWeeklyTips')}</label>
                                    <p className="text-xs text-gray-500">{t('profileNotificationsWeeklyTipsDesc')}</p>
                                </div>
                                <ToggleSwitch 
                                    id="weeklyTips"
                                    checked={notificationPrefs.weeklyTips} 
                                    onChange={(value) => handlePrefChange('weeklyTips', value)} 
                                    disabled={!areNotificationsEnabled}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <label htmlFor="communityAlerts" className="font-medium text-gray-700">{t('profileNotificationsCommunityAlerts')}</label>
                                    <p className="text-xs text-gray-500">{t('profileNotificationsCommunityAlertsDesc')}</p>
                                </div>
                                <ToggleSwitch 
                                    id="communityAlerts"
                                    checked={notificationPrefs.communityAlerts} 
                                    onChange={(value) => handlePrefChange('communityAlerts', value)} 
                                    disabled={!areNotificationsEnabled}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Save Button */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors w-full"
                        >
                            {t('profileSaveButton')}
                        </button>
                    </div>
                    {saved && (
                        <p className="text-sm text-center text-green-600 animate-pulse">
                            {t('profileSavedMessage')}
                        </p>
                    )}
                </form>
            </Card>
        </div>
    );
};

export default UserProfile;