import React, { useState } from 'react';
import Card from '../common/Card.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';
import { WrenchIcon } from '../common/Icons.tsx';

interface GetEquipmentProps {
    addEquipmentRequest: (items: string[], authorityName: string) => void;
}

const equipmentList = [
    { id: 'gloves', labelKey: 'equipmentGloves' },
    { id: 'vest', labelKey: 'equipmentVest' },
    { id: 'boots', labelKey: 'equipmentBoots' },
    { id: 'cart', labelKey: 'equipmentCart' },
];

const GetEquipment: React.FC<GetEquipmentProps> = ({ addEquipmentRequest }) => {
    const { t } = useTranslation();
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [authorityName, setAuthorityName] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleCheckboxChange = (itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.size > 0 && authorityName.trim()) {
            addEquipmentRequest(Array.from(selectedItems), authorityName.trim());
            setIsSubmitted(true);
        }
    };
    
    const handleReset = () => {
        setSelectedItems(new Set());
        setAuthorityName('');
        setIsSubmitted(false);
    }

    if (isSubmitted) {
        return (
            <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold text-green-600 mb-2">{t('requestSubmittedSuccessTitle')}</h2>
                <p className="text-gray-600 mb-4">{t('requestSubmittedSuccessDesc')}</p>
                <button
                    onClick={handleReset}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                    {t('requestAnotherButton')}
                </button>
            </Card>
        );
    }


    return (
        <div>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('getEquipmentTitle')}</h2>
            <p className="text-center text-gray-500 mb-6">{t('getEquipmentDescription')}</p>
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-3">{t('equipmentChecklistLabel')}</label>
                        <div className="space-y-3">
                            {equipmentList.map(item => (
                                <label key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => handleCheckboxChange(item.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-700">{t(item.labelKey as any)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="authority-name" className="block text-base font-semibold text-gray-800 mb-2">
                           {t('authorityNameLabel')}
                        </label>
                        <input
                            type="text"
                            id="authority-name"
                            value={authorityName}
                            onChange={(e) => setAuthorityName(e.target.value)}
                            placeholder={t('authorityNamePlaceholder')}
                            className="block w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-base focus:border-green-500 focus:ring-2 focus:ring-green-200"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={selectedItems.size === 0 || !authorityName.trim()}
                        className="w-full flex justify-center items-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                        <WrenchIcon className="w-5 h-5"/>
                        {t('submitRequestButton')}
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default GetEquipment;