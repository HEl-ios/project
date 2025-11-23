import React from 'react';
import Card from './Card.tsx';
import { RecycleIcon } from './Icons.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';
import { WasteClassificationResult } from '../../types.ts';

const ResultCard: React.FC<{ result: WasteClassificationResult }> = ({ result }) => {
  const { t } = useTranslation();
  const getBackgroundColor = () => {
    switch (result.wasteType) {
      case 'Wet Waste': return 'bg-yellow-100 border-yellow-400';
      case 'Dry Waste': return 'bg-blue-100 border-blue-400';
      case 'Hazardous': return 'bg-red-100 border-red-400';
      case 'Recyclable': return 'bg-green-100 border-green-400';
      default: return 'bg-gray-100 border-gray-400';
    }
  };

  const getTextColor = () => {
      switch (result.wasteType) {
          case 'Wet Waste': return 'text-yellow-800';
          case 'Dry Waste': return 'text-blue-800';
          case 'Hazardous': return 'text-red-800';
          case 'Recyclable': return 'text-green-800';
          default: return 'text-gray-800';
      }
  };

  return (
    <Card className={`p-6 border-l-4 ${getBackgroundColor()}`}>
      <h3 className="text-xl font-bold text-gray-800">{result.itemName}</h3>
      <p className={`font-semibold ${getTextColor()}`}>{result.wasteType}</p>
      <p className="mt-2 text-gray-600">{result.description}</p>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700">{t('howToDispose')}</h4>
        <p className="text-gray-600">{result.disposalInstructions}</p>
      </div>
      {result.recyclable && <div className="mt-4 flex items-center gap-2 text-green-700 font-semibold"><RecycleIcon className="w-5 h-5"/> {t('recyclable')}</div>}
    </Card>
  );
};

export default ResultCard;
