import React, { useState } from 'react';
import Card from '../common/Card.tsx';
import { ChevronDownIcon } from '../common/Icons.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';

const safetyTopics = [
  {
    id: 'ppe',
    title: 'Personal Protective Equipment (PPE)',
    content: `Always wear proper PPE to protect yourself from injuries and infections.
    - **Gloves:** Use thick, puncture-resistant gloves to protect your hands from cuts and hazardous materials.
    - **Boots:** Wear sturdy, closed-toe boots to prevent foot injuries.
    - **Mask:** A mask helps protect you from inhaling dust, fumes, and germs.
    - **Reflective Vest:** Wear a high-visibility vest to ensure you are easily seen by vehicles.`
  },
  {
    id: 'handling',
    title: 'Handling Hazardous Materials',
    content: `Some waste items require special care.
    - **Sharp Objects:** Be extremely careful with glass, needles, and sharp metal. Use tools to pick them up, not your hands. Store them in a hard, puncture-proof container.
    - **Chemicals:** Avoid direct contact with any unknown liquids or powders. If you find containers with chemical labels, handle them with extra care and report them if necessary.
    - **Medical Waste:** Never handle medical waste like syringes or bandages directly. Report it to the authorities.`
  },
  {
    id: 'hygiene',
    title: 'Personal Hygiene',
    content: `Good hygiene is crucial to stay healthy.
    - **Hand Washing:** Wash your hands thoroughly with soap and water multiple times a day, especially before eating and after finishing work.
    - **Clean Clothes:** Change out of your work clothes before entering your home to avoid bringing contaminants inside.
    - **First Aid:** Keep a basic first aid kit with you for minor cuts and scrapes. Clean any wound immediately and apply a bandage.`
  }
];

const ArticleAccordion: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg"
      >
        <span>{title}</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-4 pt-0 text-gray-600 whitespace-pre-line">{children}</div>}
    </div>
  );
};

const SafetyTraining: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('trainingSafetyTitle')}</h2>
      <p className="text-center text-gray-500 mb-6">{t('trainingSafetyDescription')}</p>
      <Card>
        {safetyTopics.map(topic => (
          <ArticleAccordion key={topic.id} title={topic.title}>
            {topic.content}
          </ArticleAccordion>
        ))}
      </Card>
    </div>
  );
};

export default SafetyTraining;
