import React, { useState } from 'react';
import { HistoryItem, ReportStatus } from '../types.ts';
import Card from './common/Card.tsx';
import ResultCard from './common/ResultCard.tsx';
import { ScanLineIcon, AlertTriangleIcon, ClockIcon, ChevronDownIcon } from './common/Icons.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';

interface HistoryListProps {
    history: HistoryItem[];
}

const getStatusClasses = (status: ReportStatus): string => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
};

const StatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
    const { t } = useTranslation();
    const key = `reportStatus${status.replace(' ', '')}` as any;
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(status)}`}>
            {t(key)}
        </span>
    );
};

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
    const { t } = useTranslation();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">{t('noHistory')}</p>
            </div>
        );
    }
    
    // Sort history from newest to oldest
    const sortedHistory = [...history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return (
        <div className="space-y-3">
            {sortedHistory.map((item) => {
                const isExpanded = expandedId === item.id;
                const itemIcon = item.type === 'classification' 
                    ? <ScanLineIcon className="w-6 h-6 text-blue-500" /> 
                    : <AlertTriangleIcon className="w-6 h-6 text-red-500" />;
                const itemTitle = item.type === 'classification' 
                    ? t('historyClassifiedTitle', { item: item.data.itemName })
                    : t('historyReportedTitle');
                
                return (
                    <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <button 
                            onClick={() => toggleExpand(item.id)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                            aria-expanded={isExpanded}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded-full">{itemIcon}</div>
                                <div>
                                    <p className="font-semibold text-gray-800">{itemTitle}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <div className="flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3"/>
                                            <span>
                                                {item.timestamp.toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </span>
                                        </div>
                                        {item.type === 'report' && <StatusBadge status={item.data.status} />}
                                    </div>
                                </div>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isExpanded && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                {item.type === 'classification' && <ResultCard result={item.data} />}
                                {item.type === 'report' && (
                                    <Card className="p-4">
                                        <h4 className="font-semibold mb-2">{t('reportDetails')}</h4>
                                        <img src={item.data.image} alt="Reported waste" className="max-h-60 w-full object-contain rounded-md mb-2 bg-gray-100 p-1" />
                                        <p className="text-gray-700 whitespace-pre-wrap">{item.data.description}</p>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default HistoryList;
