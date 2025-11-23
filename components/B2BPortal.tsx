import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation.ts';
import { BulkPickupRequest, BulkPickupStatus, BulkWasteType, ComplianceReport } from '../types.ts';
import Card from './common/Card.tsx';
import { BriefcaseIcon, ClockIcon, ArrowLeftIcon } from './common/Icons.tsx';

interface B2BPortalProps {
    businessId: string;
    requests: BulkPickupRequest[];
    addRequest: (requestData: Omit<BulkPickupRequest, 'id' | 'businessId' | 'timestamp' | 'status'>) => void;
    updateRequestStatus: (requestId: string, status: BulkPickupStatus) => void; // For demo purposes
    addPoints: (points: number) => void;
}

const getStatusClasses = (status: BulkPickupStatus): string => {
    switch (status) {
        case 'Requested': return 'bg-yellow-100 text-yellow-800';
        case 'Scheduled': return 'bg-blue-100 text-blue-800';
        case 'Completed': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const StatusBadge: React.FC<{ status: BulkPickupStatus }> = ({ status }) => {
    const { t } = useTranslation();
    const key = `status${status}` as any;
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(status)}`}>
            {t(key)}
        </span>
    );
};

const NewRequestForm: React.FC<{
    onBack: () => void;
    onSubmit: (data: Omit<BulkPickupRequest, 'id' | 'businessId' | 'timestamp' | 'status'>) => void;
}> = ({ onBack, onSubmit }) => {
    const { t } = useTranslation();
    const [wasteType, setWasteType] = useState<BulkWasteType>('Plastics');
    const [estimatedWeightKg, setEstimatedWeightKg] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ wasteType, estimatedWeightKg: Number(estimatedWeightKg), preferredDate, notes });
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 font-semibold text-green-700 hover:text-green-800 mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>{t('backToB2BPortal')}</span>
            </button>
            <h3 className="text-2xl font-bold text-center mb-4">{t('newBulkRequestTitle')}</h3>
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('bulkWasteType')}</label>
                        <select value={wasteType} onChange={e => setWasteType(e.target.value as BulkWasteType)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option value="Plastics">{t('plastics')}</option>
                            <option value="E-waste">{t('ewaste')}</option>
                            <option value="Organic">{t('organic')}</option>
                            <option value="Mixed Commercial">{t('mixed')}</option>
                            <option value="Construction Debris">{t('construction')}</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('bulkEstimatedWeight')}</label>
                        <input type="number" value={estimatedWeightKg} onChange={e => setEstimatedWeightKg(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('preferredDate')}</label>
                        <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('notes')}</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={t('notesPlaceholder')} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">{t('submitBulkRequest')}</button>
                </form>
            </Card>
        </div>
    );
};

const B2BPortal: React.FC<B2BPortalProps> = ({ businessId, requests, addRequest, addPoints }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'dashboard' | 'form' | 'submitted'>('dashboard');

    const stats = useMemo(() => {
        const completedRequests = requests.filter(r => r.status === 'Completed');
        const totalWeight = completedRequests.reduce((sum, r) => sum + r.estimatedWeightKg, 0);
        return {
            totalPickups: requests.length,
            totalWeightKg: totalWeight,
        };
    }, [requests]);

    // Mock compliance reports based on history
    const complianceReports: ComplianceReport[] = useMemo(() => {
         if (stats.totalPickups === 0) return [];
         const breakdown = requests.reduce((acc, req) => {
            if(req.status === 'Completed') {
                acc[req.wasteType] = (acc[req.wasteType] || 0) + req.estimatedWeightKg;
            }
            return acc;
         }, {} as Record<BulkWasteType, number>);

        return [{
            id: 'report-q2-2024',
            businessId,
            period: 'Q2 2024',
            generationDate: new Date().toISOString(),
            summaryData: {
                totalPickups: requests.filter(r => r.status === 'Completed').length,
                totalWeightKg: stats.totalWeightKg,
                wasteBreakdown: breakdown,
            }
        }];
    }, [requests, businessId, stats.totalWeightKg, stats.totalPickups]);

    const handleRequestSubmit = (data: Omit<BulkPickupRequest, 'id' | 'businessId' | 'timestamp' | 'status'>) => {
        addRequest(data);
        addPoints(50);
        setView('submitted');
    };

    if (view === 'submitted') {
        return (
             <div className="max-w-lg mx-auto text-center">
                <Card className="p-8">
                    <h2 className="text-2xl font-bold text-green-600 mb-2">{t('requestSuccessful')}</h2>
                    <p className="text-gray-600 mb-4">{t('requestSuccessfulDesc')}</p>
                    <button onClick={() => setView('dashboard')} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">{t('backToB2BPortal')}</button>
                </Card>
            </div>
        );
    }
    
    if (view === 'form') {
        return <NewRequestForm onBack={() => setView('dashboard')} onSubmit={handleRequestSubmit} />;
    }

    const sortedRequests = [...requests].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-center text-gray-800">{t('b2bPortalTitle')}</h2>
                <p className="text-center text-gray-500 mt-1">{t('b2bPortalDescription')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 text-center bg-indigo-50">
                    <h3 className="text-lg font-semibold text-gray-500">{t('totalPickups')}</h3>
                    <p className="text-4xl font-bold text-indigo-600">{stats.totalPickups}</p>
                </Card>
                 <Card className="p-6 text-center bg-indigo-50">
                    <h3 className="text-lg font-semibold text-gray-500">{t('totalWeightRecycled')}</h3>
                    <p className="text-4xl font-bold text-indigo-600">{stats.totalWeightKg}</p>
                </Card>
            </div>

            <button onClick={() => setView('form')} className="w-full bg-indigo-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-lg">
                <BriefcaseIcon className="w-6 h-6" />
                {t('scheduleBulkPickup')}
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pickup Requests */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{t('yourBulkPickups')}</h3>
                    <Card className="p-4 max-h-96 overflow-y-auto">
                        {sortedRequests.length > 0 ? (
                            <div className="space-y-3">
                                {sortedRequests.map(req => (
                                    <div key={req.id} className="p-4 bg-white rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800">{req.wasteType} <span className="text-gray-500 font-normal">({req.estimatedWeightKg} kg)</span></p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><ClockIcon className="w-4 h-4"/> {new Date(req.preferredDate).toLocaleDateString()}</p>
                                            </div>
                                            <StatusBadge status={req.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <BriefcaseIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                                <p className="text-gray-500">{t('noBulkPickups')}</p>
                            </div>
                        )}
                    </Card>
                </div>
                {/* Compliance Reports */}
                 <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{t('complianceReports')}</h3>
                    <Card className="p-4 max-h-96 overflow-y-auto">
                        {complianceReports.length > 0 ? (
                            <div className="space-y-3">
                                {complianceReports.map(report => (
                                    <div key={report.id} className="p-4 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                                       <div>
                                            <p className="font-semibold text-gray-800">EPR Report - {report.period}</p>
                                            <p className="text-sm text-gray-500">Generated on {new Date(report.generationDate).toLocaleDateString()}</p>
                                       </div>
                                        <button className="text-sm font-bold text-indigo-600 hover:underline">{t('download')}</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <BriefcaseIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                                <p className="text-gray-500">{t('noComplianceReports')}</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default B2BPortal;
