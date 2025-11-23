import React, { useMemo } from 'react';
import { ReportHistoryItem } from '../types.ts';
import Card from './common/Card.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import { BarChartIcon } from './common/Icons.tsx';

interface TransparencyDashboardProps {
  reports: ReportHistoryItem[];
}

const TransparencyDashboard: React.FC<TransparencyDashboardProps> = ({ reports }) => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const total = reports.length;
    if (total === 0) {
      return { total: 0, resolved: 0, pending: 0, resolutionRate: 0, communityScore: 0 };
    }
    const resolved = reports.filter(r => r.data.status === 'Resolved').length;
    const pending = reports.filter(r => r.data.status === 'Pending').length;
    const resolutionRate = Math.round((resolved / total) * 100);
    
    // Community Score Formula: 80% weight on resolution rate, 20% on keeping pending queue low.
    const score = Math.round((resolved / total) * 80 + Math.max(0, 1 - (pending / total)) * 20);

    return { total, resolved, pending, resolutionRate, communityScore: score };
  }, [reports]);
  
  const scoreColor = useMemo(() => {
    if (stats.communityScore >= 80) return 'text-green-500';
    if (stats.communityScore >= 50) return 'text-yellow-500';
    return 'text-red-500';
  }, [stats.communityScore]);


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-800">{t('transparencyDashboardTitle')}</h2>
        <p className="text-gray-500 mt-1 text-center">{t('transparencyDashboardDescription')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-500">{t('reportsSubmitted')}</h3>
          <p className="text-5xl font-bold text-gray-800 mt-2">{stats.total}</p>
        </Card>
        <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-500">{t('resolutionRate')}</h3>
            <div className="relative mt-2">
                <svg className="w-24 h-24 mx-auto" viewBox="0 0 36 36">
                    <path className="text-gray-200" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-blue-500" strokeWidth="3" fill="none" strokeDasharray={`${stats.resolutionRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">{stats.resolutionRate}%</span>
                </div>
            </div>
        </Card>
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-500">{t('communityScore')}</h3>
           <p className={`text-5xl font-bold ${scoreColor} mt-2`}>{stats.communityScore}<span className="text-3xl text-gray-400">/100</span></p>
           <p className="text-xs text-gray-500 mt-2">{t('dataExplanation')}</p>
        </Card>
      </div>

      <Card>
        <div className="p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                    <BarChartIcon className="w-8 h-8 text-green-600"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{t('commitmentTitle')}</h3>
                </div>
            </div>
            <p className="text-gray-600 mt-4 text-sm">
                {t('commitmentBody')}
            </p>
        </div>
      </Card>

    </div>
  );
};

export default TransparencyDashboard;
