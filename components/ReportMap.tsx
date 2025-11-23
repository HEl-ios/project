import React, { useState, useMemo } from 'react';
import { ReportHistoryItem } from '../types.ts';
import Card from './common/Card.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';

interface ReportMapProps {
    reports: ReportHistoryItem[];
}

// Bounding box for a hypothetical area (e.g., a city)
// This is used to map lat/lng coordinates to pixels on our fake map.
const MAP_BOUNDS = {
    minLat: -90, maxLat: 90,
    minLng: -180, maxLng: 180,
};

const ReportMap: React.FC<ReportMapProps> = ({ reports }) => {
    const { t } = useTranslation();
    const [activeReport, setActiveReport] = useState<ReportHistoryItem | null>(null);

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

    if (locatedReports.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">{t('noLocatedReports')}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
            {/* Satellite map background */}
            <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542901389-e1b19c158959?q=80&w=2070&auto=format&fit=crop')` }}
                aria-hidden="true"
            >
                {/* Add a subtle overlay to make markers stand out */}
                <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            {locatedReports.map(report => (
                <div
                    key={report.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={getPosition(report.data.location!)}
                    onMouseEnter={() => setActiveReport(report)}
                    onMouseLeave={() => setActiveReport(null)}
                    onClick={() => setActiveReport(report)}
                    role="button"
                    aria-label={`Report at ${report.data.location?.latitude}, ${report.data.location?.longitude}`}
                >
                    <div className="w-4 h-4 bg-red-500 rounded-full cursor-pointer ring-2 ring-white shadow-md transition-transform hover:scale-125"></div>
                </div>
            ))}

            {activeReport && activeReport.data.location && (
                <div
                    className="absolute z-20"
                    style={{ ...getPosition(activeReport.data.location), transform: 'translate(-50%, -115%)' }}
                >
                    <Card className="w-48 shadow-xl animate-fade-in-fast">
                        <img src={activeReport.data.image} alt="Reported waste" className="w-full h-24 object-cover" />
                        <div className="p-2">
                            <p className="text-xs text-gray-700 truncate">{activeReport.data.description}</p>
                        </div>
                    </Card>
                    {/* Popover arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" style={{ bottom: '-8px' }}></div>
                </div>
            )}
        </div>
    );
};

export default ReportMap;

// Add a simple fade-in animation for the popover
const style = document.createElement('style');
style.textContent = `
@keyframes fade-in-fast {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-fast {
    animation: fade-in-fast 0.2s ease-out;
}
`;
document.head.append(style);