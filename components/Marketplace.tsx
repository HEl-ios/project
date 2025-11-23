import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation.ts';
import { PickupRequest, PickupStatus } from '../types.ts';
import Card from './common/Card.tsx';
import { DollarSignIcon, TruckIcon, ClockIcon, ArrowLeftIcon, CameraIcon } from './common/Icons.tsx';

interface MarketplaceProps {
    userId: string;
    pickupRequests: PickupRequest[];
    addPickupRequest: (requestData: Omit<PickupRequest, 'id' | 'userId' | 'timestamp' | 'status'>) => void;
    updatePickupStatus: (requestId: string, status: PickupStatus) => void;
    addPoints: (points: number) => void;
}

const getStatusClasses = (status: PickupStatus): string => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const StatusBadge: React.FC<{ status: PickupStatus }> = ({ status }) => {
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
    onSubmit: (data: Omit<PickupRequest, 'id' | 'userId' | 'timestamp' | 'status'>) => void;
}> = ({ onBack, onSubmit }) => {
    const { t } = useTranslation();
    const [materialType, setMaterialType] = useState('Paper');
    const [estimatedWeight, setEstimatedWeight] = useState('< 5kg');
    const [address, setAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [photo, setPhoto] = useState<string | undefined>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ materialType, estimatedWeight, address, contactNumber, photo });
    };
    
    // Simplified photo handler for demonstration
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setPhoto(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 font-semibold text-green-700 hover:text-green-800 mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>{t('backToList')}</span>
            </button>
            <h3 className="text-2xl font-bold text-center mb-4">{t('newPickupRequest')}</h3>
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('materialType')}</label>
                        <select value={materialType} onChange={e => setMaterialType(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                            <option>Paper</option>
                            <option>Plastic</option>
                            <option>Metal</option>
                            <option>Glass</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('estimatedWeight')}</label>
                        <div className="flex gap-4 mt-1">
                           {['< 5kg', '5-10kg', '10+ kg'].map(weight => (
                               <label key={weight} className="flex items-center gap-2">
                                   <input type="radio" value={weight} checked={estimatedWeight === weight} onChange={e => setEstimatedWeight(e.target.value)} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300" />
                                   {weight}
                               </label>
                           ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('address')}</label>
                        <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('contactNumber')}</label>
                        <input type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('photoOptional')}</label>
                        <div className="mt-1 flex items-center gap-4">
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                            <label htmlFor="photo-upload" className="cursor-pointer bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 flex items-center gap-2">
                               <CameraIcon className="w-5 h-5"/> {t('uploadPhoto')}
                            </label>
                            {photo && <img src={photo} alt="preview" className="w-16 h-16 object-cover rounded-md border" />}
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">{t('submitRequest')}</button>
                </form>
            </Card>
        </div>
    )
}

const Marketplace: React.FC<MarketplaceProps> = ({ pickupRequests, addPickupRequest, updatePickupStatus, addPoints }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'list' | 'form' | 'submitted'>('list');

    const handleRequestSubmit = (data: Omit<PickupRequest, 'id' | 'userId' | 'timestamp' | 'status'>) => {
        addPickupRequest(data);
        addPoints(10); // Points for creating a request
        setView('submitted');
    }

    const handleMarkCompleted = (id: string) => {
        updatePickupStatus(id, 'Completed');
        addPoints(50); // Extra points for a completed sale
    }

    if (view === 'submitted') {
        return (
             <div className="max-w-lg mx-auto text-center">
                <Card className="p-8">
                    <h2 className="text-2xl font-bold text-green-600 mb-2">{t('requestSubmitted')}</h2>
                    <p className="text-gray-600 mb-4">{t('requestSubmittedDesc')}</p>
                    <button onClick={() => setView('list')} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700">{t('requestAnotherPickup')}</button>
                </Card>
            </div>
        )
    }

    if (view === 'form') {
        return <NewRequestForm onBack={() => setView('list')} onSubmit={handleRequestSubmit} />
    }
    
    const sortedRequests = [...pickupRequests].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-center text-gray-800">{t('marketplaceTitle')}</h2>
                <p className="text-center text-gray-500 mt-1">{t('marketplaceDescription')}</p>
            </div>

            <button onClick={() => setView('form')} className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg">
                <DollarSignIcon className="w-6 h-6" />
                {t('requestPickup')}
            </button>
            
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('yourPickupRequests')}</h3>
                <Card className="p-4">
                    {sortedRequests.length > 0 ? (
                        <div className="space-y-3">
                            {sortedRequests.map(req => (
                                <div key={req.id} className="p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800">{req.materialType} <span className="text-gray-500 font-normal">({req.estimatedWeight})</span></p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><ClockIcon className="w-4 h-4"/> {new Date(req.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <StatusBadge status={req.status} />
                                    </div>
                                    {req.status === 'Pending' && (
                                        <div className="flex gap-2 mt-3 border-t pt-3">
                                            <button onClick={() => updatePickupStatus(req.id, 'Cancelled')} className="text-xs font-semibold text-red-600 hover:underline px-2 py-1">Cancel</button>
                                            <button onClick={() => handleMarkCompleted(req.id)} className="text-xs font-semibold text-green-600 hover:underline px-2 py-1">{t('markCompleted')}</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <TruckIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                            <p className="text-gray-500">{t('noPickupRequests')}</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Marketplace;
