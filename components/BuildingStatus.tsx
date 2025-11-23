import React from 'react';
// Fix: Import Warning and Penalty types for use in compliance history.
import { Building, BuildingStatus as BuildingStatusType, Warning, Penalty } from '../types.ts';
import Card from './common/Card.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import { ShieldCheckIcon, AlertTriangleIcon, DollarSignIcon, ClockIcon } from './common/Icons.tsx';

interface BuildingStatusProps {
  buildingId: string;
  buildings: Building[];
}

// Fix: Specified a more specific type for the 'icon' prop to allow cloning with a className.
const getStatusInfo = (status: BuildingStatusType): { icon: React.ReactElement<{ className?: string }>; color: string; textKey: any } => {
  switch (status) {
    case 'Compliant':
      return { icon: <ShieldCheckIcon />, color: 'text-green-600', textKey: 'statusCompliant' };
    case 'UnderReview':
      return { icon: <ClockIcon />, color: 'text-blue-600', textKey: 'statusUnderReview' };
    case 'WarningIssued':
      return { icon: <AlertTriangleIcon />, color: 'text-yellow-600', textKey: 'statusWarningIssued' };
    case 'PenaltyActive':
      return { icon: <DollarSignIcon />, color: 'text-red-600', textKey: 'statusPenaltyActive' };
    default:
      return { icon: <ShieldCheckIcon />, color: 'text-gray-600', textKey: 'statusCompliant' };
  }
};

const BuildingStatus: React.FC<BuildingStatusProps> = ({ buildingId, buildings }) => {
  const { t } = useTranslation();
  const building = buildings.find(b => b.id === buildingId);

  if (!buildingId) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8">
          <h2 className="text-xl font-bold text-gray-800">{t('buildingStatusTitle')}</h2>
          <p className="mt-4 text-gray-600">{t('noBuildingId')}</p>
        </Card>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8">
          <h2 className="text-xl font-bold text-gray-800">{t('buildingStatusTitle')}</h2>
          <p className="mt-4 text-red-600">{t('buildingNotFound')}</p>
        </Card>
      </div>
    );
  }

  const { icon, color, textKey } = getStatusInfo(building.status);
  
  // Fix: Used 'kind' as a discriminator property to avoid overwriting the 'type' property on Penalty objects.
  // This allows TypeScript to correctly narrow the union type.
  type ComplianceHistoryItem = (Warning & { kind: 'warning' }) | (Penalty & { kind: 'penalty' });

  const complianceHistory: ComplianceHistoryItem[] = [
    ...building.warnings.map(w => ({ ...w, kind: 'warning' as const })),
    ...building.penalties.map(p => ({ ...p, kind: 'penalty' as const }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-800">{building.name}</h2>
        <p className="text-center text-gray-500">{t('buildingStatusTitle')}</p>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-500 text-center">{t('currentStatus')}</h3>
        <div className={`flex items-center justify-center gap-3 mt-2 ${color}`}>
          {React.cloneElement(icon, { className: 'w-10 h-10' })}
          <p className="text-3xl font-bold">{t(textKey)}</p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('complianceHistory')}</h3>
        {complianceHistory.length === 0 ? (
          <p className="text-center text-gray-500 py-4">{t('noHistory')}</p>
        ) : (
          <div className="space-y-4">
            {complianceHistory.map(item => (
              <div key={item.id} className="p-4 rounded-lg border flex gap-4" style={{ borderColor: item.kind === 'warning' ? '#FBBF24' : '#F87171' }}>
                 <div className="flex-shrink-0 pt-1">
                    {item.kind === 'warning' ? <AlertTriangleIcon className="w-5 h-5 text-yellow-500" /> : <DollarSignIcon className="w-5 h-5 text-red-500" />}
                 </div>
                 <div>
                    <p className="font-semibold">{item.kind === 'warning' ? t('warningIssued') : t('penaltyIssued')}</p>
                    <p className="text-sm text-gray-600">
                        {item.kind === 'penalty' ? item.details : item.reason}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BuildingStatus;
