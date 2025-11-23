import React from 'react';
import { ReportHistoryItem, Vehicle, VehicleStatus } from '../types.ts';
import Card from './common/Card.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import { TruckIcon } from './common/Icons.tsx';

interface LiveDispatchMapProps {
    reports: ReportHistoryItem[];
    vehicles: Vehicle[];
}

const MAP_BOUNDS = {
    minLat: -90, maxLat: 90,
    minLng: -180, maxLng: 180,
};

const getPosition = (location: { latitude: number; longitude: number; }) => {
    const top = 100 - ((location.latitude - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
    const left = ((location.longitude - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
    return { top: `${top}%`, left: `${left}%` };
};

// Calculate rotation and length for the line div
const getLineStyle = (startPos: any, endPos: any) => {
    const startX = parseFloat(startPos.left);
    const startY = parseFloat(startPos.top);
    const endX = parseFloat(endPos.left);
    const endY = parseFloat(endPos.top);
    
    const dx = endX - startX;
    const dy = endY - startY;
    
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return {
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${length}%`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0',
    };
};

const LiveDispatchMap: React.FC<LiveDispatchMapProps> = ({ reports, vehicles }) => {
    const { t } = useTranslation();

    const locatedReports = reports.filter(r => r.data.location && (r.data.status === 'Pending' || r.data.status === 'In Progress'));

    return (
        <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
            {/* Satellite map background */}
            <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542901389-e1b19c158959?q=80&w=2070&auto=format&fit=crop')` }}
                aria-hidden="true"
            >
                {/* Add a subtle overlay to make markers stand out */}
                <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            {/* Dispatch Lines */}
            {vehicles.map(vehicle => {
                if (vehicle.status !== VehicleStatus.EN_ROUTE || !vehicle.assignedReportId) return null;
                const report = locatedReports.find(r => r.id === vehicle.assignedReportId);
                if (!report || !report.data.location) return null;

                const vehiclePos = getPosition(vehicle.currentLocation);
                const reportPos = getPosition(report.data.location);
                const lineStyle = getLineStyle(vehiclePos, reportPos);
                
                return <div key={`line-${vehicle.id}`} className="absolute h-[2px] bg-cyan-300/90 shadow-lg" style={lineStyle}></div>
            })}
            
            {/* Report Markers */}
            {locatedReports.map(report => (
                <div
                    key={report.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={getPosition(report.data.location!)}
                >
                    <div className={`w-3 h-3 rounded-full ring-2 ring-white shadow-md ${report.data.status === 'Pending' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                </div>
            ))}

            {/* Vehicle Markers */}
            {vehicles.map(vehicle => {
                let colorClass = 'text-gray-600';
                if (vehicle.status === VehicleStatus.IDLE) colorClass = 'text-green-400';
                if (vehicle.status === VehicleStatus.EN_ROUTE) colorClass = 'text-blue-400';
                if (vehicle.status === VehicleStatus.COLLECTING) colorClass = 'text-yellow-400';
                
                return (
                     <div
                        key={vehicle.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-1000 linear group"
                        style={getPosition(vehicle.currentLocation)}
                        title={`${vehicle.id} - ${vehicle.status}`}
                    >
                        <TruckIcon className={`w-6 h-6 ${colorClass} transition-transform group-hover:scale-125 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]`} />
                         <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-0.5 text-xs text-white bg-gray-800 rounded-md">
                            {vehicle.id}
                        </span>
                    </div>
                )
            })}
        </div>
    );
};

export default LiveDispatchMap;