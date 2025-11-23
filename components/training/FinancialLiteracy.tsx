import React, { useState } from 'react';
import Card from '../common/Card.tsx';
import { ChevronDownIcon } from '../common/Icons.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';

const topics = [
  {
    id: 'banking',
    title: 'How to Open a Bank Account',
    content: `Having a bank account is a safe way to store your money and can help you access government schemes.
    - **Documents Needed:** You typically need an ID proof (like an Aadhaar card or Voter ID) and an address proof.
    - **PMJDY Scheme:** The Pradhan Mantri Jan Dhan Yojana (PMJDY) allows you to open a zero-balance account easily.
    - **Benefits:** Your money is safe, you can earn interest, and it makes receiving payments easier.`
  },
  {
    id: 'digital_payments',
    title: 'Using Digital Payments (UPI)',
    content: `Digital payments are a fast and secure way to send and receive money using your phone.
    - **What is UPI?:** Unified Payments Interface (UPI) lets you link your bank account to a mobile app (like Google Pay, PhonePe, Paytm) to make payments.
    - **How it works:** You can pay someone by scanning a QR code, entering their phone number, or using their UPI ID.
    - **Safety:** Never share your UPI PIN with anyone. Treat it like your ATM PIN.`
  },
  {
    id: 'saving',
    title: 'The Benefits of Saving',
    content: `Saving even small amounts regularly can help you prepare for the future and emergencies.
    - **Start Small:** Try to save a small, fixed amount every week or month.
    - **Set Goals:** Having a goal (like saving for a child's education or a medical emergency) can help you stay motivated.
    - **Where to Save:** A bank account is a safe place. You can also look into schemes like recurring deposits (RDs) which help you save regularly.`
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

const FinancialLiteracy: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('trainingFinancialTitle')}</h2>
      <p className="text-center text-gray-500 mb-6">{t('trainingFinancialDescription')}</p>
      <Card>
        {topics.map(topic => (
          <ArticleAccordion key={topic.id} title={topic.title}>
            {topic.content}
          </ArticleAccordion>
        ))}
      </Card>
    </div>
  );
};

export default FinancialLiteracy;
