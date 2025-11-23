import React, { useState } from 'react';
import Card from '../common/Card.tsx';
import { ChevronDownIcon } from '../common/Icons.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';

const articles = [
  {
    id: 'composting',
    title: 'Home Composting 101',
    content: `Composting is a simple way to turn your kitchen scraps into nutrient-rich soil for your garden. 
    - **What to compost:** Fruit and vegetable scraps, eggshells, coffee grounds, and yard trimmings.
    - **What to avoid:** Meat, dairy, oily foods, and pet waste.
    - **How to start:** Use a dedicated compost bin. Layer your 'greens' (kitchen scraps) with 'browns' (dry leaves, cardboard). Keep it moist and turn it occasionally to aerate. In a few months, you'll have rich compost!`
  },
  {
    id: 'ewaste',
    title: 'Safely Disposing of E-Waste',
    content: `Electronic waste (e-waste) like old phones, batteries, and computers contains hazardous materials and should never be thrown in regular trash.
    - **Why it's hazardous:** E-waste can leak toxic chemicals like lead and mercury into the soil and water.
    - **How to dispose:** Find a designated e-waste collection center. Many electronics stores also have take-back programs.
    - **Recycling:** E-waste also contains valuable materials like gold and copper that can be recovered and reused.`
  },
  {
    id: 'recyclingSymbols',
    title: 'Understanding Recycling Symbols',
    content: `The 'three arrows' symbol, known as the Mobius loop, indicates an item is recyclable. However, the number inside the symbol is important!
    - **#1 (PET):** Common in water bottles. Widely recycled.
    - **#2 (HDPE):** Found in milk jugs and shampoo bottles. Also widely recycled.
    - **#5 (PP):** Used in yogurt cups and containers. Recycling is less common but growing.
    - **Check locally:** Always check with your local municipality to see which types of plastics they accept.`
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

const EducationalHub: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('educationalHubTitle')}</h2>
      <p className="text-center text-gray-500 mb-6">{t('trainingEducationalDescription')}</p>
      <Card>
        {articles.map(article => (
          <ArticleAccordion key={article.id} title={article.title}>
            {article.content}
          </ArticleAccordion>
        ))}
      </Card>
    </div>
  );
};

export default EducationalHub;
