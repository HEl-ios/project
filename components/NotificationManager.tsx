
import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
// Fix: Import icons from the shared Icons.tsx file.
import { BellIcon, BellOffIcon, SendIcon } from './common/Icons.tsx';

const NotificationManager: React.FC = () => {
    const { t } = useTranslation();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) return;
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    const sendTestNotification = () => {
        if (permission !== 'granted' || !navigator.serviceWorker.controller) {
            alert('Please enable notifications first.');
            return;
        }
        navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload: {
                title: t('testNotificationTitle'),
                body: t('testNotificationBody'),
            },
        });
    };

    if (!isSupported) {
        return null; // Don't render if notifications are not supported by the browser
    }

    return (
        <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('notificationsTitle')}</h3>
            <p className="text-gray-600 mb-4">{t('notificationsDescription')}</p>
            {permission === 'default' && (
                <button
                    onClick={requestPermission}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <BellIcon className="w-5 h-5" />
                    {t('enableNotifications')}
                </button>
            )}
            {permission === 'denied' && (
                 <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-lg">
                    <BellOffIcon className="w-5 h-5"/>
                    <span>{t('notificationsDenied')}</span>
                 </div>
            )}
            {permission === 'granted' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-800 bg-green-100 p-3 rounded-lg">
                        <BellIcon className="w-5 h-5"/>
                        <span>{t('notificationsEnabled')}</span>
                    </div>
                    <button
                        onClick={sendTestNotification}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <SendIcon className="w-5 h-5" />
                        {t('sendTestNotification')}
                    </button>
                </div>
            )}
        </Card>
    );
};

export default NotificationManager;
