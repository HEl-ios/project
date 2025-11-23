import React, { useMemo } from 'react';
import { ReportHistoryItem } from '../types.ts';
import { useTranslation } from '../i18n/useTranslation.ts';

interface CommunityActivityMapProps {
    reports: ReportHistoryItem[];
}

const MAP_BOUNDS = {
    minLat: -90, maxLat: 90,
    minLng: -180, maxLng: 180,
};

const CommunityActivityMap: React.FC<CommunityActivityMapProps> = ({ reports }) => {
    const { t } = useTranslation();

    const locatedReports = useMemo(() => {
        return reports.filter(report =>
            report.data.location &&
            report.data.location.latitude >= MAP_BOUNDS.minLat &&
            report.data.location.latitude <= MAP_BOUNDS.maxLat &&
            report.data.location.longitude >= MAP_BOUNDS.minLng &&
            report.data.location.longitude <= MAP_BOUNDS.maxLng
        );
    }, [reports]);

    const getPosition = (location: { latitude: number; longitude: number; }) => {
        const top = 100 - ((location.latitude - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
        const left = ((location.longitude - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
        return { top: `${top}%`, left: `${left}%` };
    };

    return (
        <div>
            <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                {/* Satellite map background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542901389-e1b19c158959?q=80&w=2070&auto=format&fit=crop')` }}
                    aria-hidden="true"
                >
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>
                
                {/* Heatmap points */}
                {locatedReports.map(report => (
                    <div
                        key={report.id}
                        className="absolute w-16 h-16 bg-orange-400/30 rounded-full blur-lg transform -translate-x-1/2 -translate-y-1/2"
                        style={getPosition(report.data.location!)}
                    />
                ))}
                
                {locatedReports.length === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white bg-black/50 px-4 py-2 rounded-lg">{t('noLocatedReports')}</p>
                    </div>
                )}
            </div>
            <p className="text-xs text-center text-gray-500 mt-2 px-4">{t('communityActivityMapDescription')}</p>
        </div>
    );
};

export default CommunityActivityMap;
