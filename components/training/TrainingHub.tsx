import React, { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.ts';
// Fix: Import icons for training modules.
import { UsersIcon, BriefcaseIcon, ArrowLeftIcon, GraduationCapIcon, BookOpenIcon, ScanLineIcon, ShieldIcon, DollarSignIcon, BrushIcon, BuildingIcon, PlayCircleIcon, WrenchIcon } from '../common/Icons.tsx';
import Card from '../common/Card.tsx';
import { BadgeSlug, EquipmentRequest } from '../../types.ts';
import SegregationMasterclass from './SegregationMasterclass.tsx';
import EducationalHub from './EducationalHub.tsx';
import RecyclableIdentifier from './RecyclableIdentifier.tsx';
import SafetyTraining from './SafetyTraining.tsx';
import FinancialLiteracy from './FinancialLiteracy.tsx';
import UpcycledArtGenerator from '../UpcycledArtGenerator.tsx';
import AuthoritiesNGOs from './AuthoritiesNGOs.tsx';
import TutorialVideos from './TutorialVideos.tsx';
import GetEquipment from './GetEquipment.tsx';

type TrainingView = 'main' | 'segregation' | 'education' | 'identifier' | 'safety' | 'financial' | 'upcycledArt' | 'authorities' | 'tutorialVideos' | 'getEquipment';

interface TrainingHubProps {
  addPoints: (points: number) => void;
  unlockBadge: (slug: BadgeSlug) => void;
  addEquipmentRequest: (items: string[], authorityName: string) => void;
}

const TrainingCard: React.FC<{
  // Fix: Specified a more specific type for the 'icon' prop to allow cloning with a className.
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
  <Card onClick={onClick} className="p-6 text-center">
    <div className="mb-4 text-green-600 bg-green-100 p-4 rounded-full inline-block">{React.cloneElement(icon, { className: "w-10 h-10" })}</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </Card>
);

const SubModuleWrapper: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({ title, onBack, children }) => (
  <div>
    <button onClick={onBack} className="flex items-center gap-2 font-semibold text-green-700 hover:text-green-800 mb-4">
      <ArrowLeftIcon className="w-5 h-5" />
      <span>{title}</span>
    </button>
    {children}
  </div>
);

const TrainingHub: React.FC<TrainingHubProps> = ({ addPoints, unlockBadge, addEquipmentRequest }) => {
  const { t } = useTranslation();
  const [citizenModule, setCitizenModule] = useState<TrainingView | null>(null);
  const [workerModule, setWorkerModule] = useState<TrainingView | null>(null);
  const [authorityModule, setAuthorityModule] = useState<TrainingView | null>(null);
  const [resourceModule, setResourceModule] = useState<TrainingView | null>(null);


  const citizenModules = [
    { view: 'segregation', icon: <GraduationCapIcon />, title: t('trainingSegregationTitle'), description: t('trainingSegregationDescription') },
    { view: 'education', icon: <BookOpenIcon />, title: t('trainingEducationalTitle'), description: t('trainingEducationalDescription') },
    { view: 'upcycledArt', icon: <BrushIcon />, title: t('upcycledArtGeneratorTitle'), description: t('upcycledArtGeneratorDescription') },
  ];

  const workerModules = [
    { view: 'identifier', icon: <ScanLineIcon />, title: t('trainingIdentifierTitle'), description: t('trainingIdentifierDescription') },
    { view: 'safety', icon: <ShieldIcon />, title: t('trainingSafetyTitle'), description: t('trainingSafetyDescription') },
    { view: 'financial', icon: <DollarSignIcon />, title: t('trainingFinancialTitle'), description: t('trainingFinancialDescription') },
    { view: 'getEquipment', icon: <WrenchIcon />, title: t('trainingGetEquipmentTitle'), description: t('trainingGetEquipmentDescription') },
  ];

  const renderContent = () => {
    if (citizenModule === 'segregation') return <SubModuleWrapper title={t('citizenTrainingTitle')} onBack={() => setCitizenModule(null)}><SegregationMasterclass addPoints={addPoints} /></SubModuleWrapper>;
    if (citizenModule === 'education') return <SubModuleWrapper title={t('citizenTrainingTitle')} onBack={() => setCitizenModule(null)}><EducationalHub /></SubModuleWrapper>;
    if (citizenModule === 'upcycledArt') return <SubModuleWrapper title={t('citizenTrainingTitle')} onBack={() => setCitizenModule(null)}><UpcycledArtGenerator /></SubModuleWrapper>;
    
    if (workerModule === 'identifier') return <SubModuleWrapper title={t('wasteWorkerTrainingTitle')} onBack={() => setWorkerModule(null)}><RecyclableIdentifier addPoints={addPoints} unlockBadge={unlockBadge} /></SubModuleWrapper>;
    if (workerModule === 'safety') return <SubModuleWrapper title={t('wasteWorkerTrainingTitle')} onBack={() => setWorkerModule(null)}><SafetyTraining /></SubModuleWrapper>;
    if (workerModule === 'financial') return <SubModuleWrapper title={t('wasteWorkerTrainingTitle')} onBack={() => setWorkerModule(null)}><FinancialLiteracy /></SubModuleWrapper>;
    if (workerModule === 'getEquipment') return <SubModuleWrapper title={t('wasteWorkerTrainingTitle')} onBack={() => setWorkerModule(null)}><GetEquipment addEquipmentRequest={addEquipmentRequest} /></SubModuleWrapper>;


    if (authorityModule === 'authorities') return <SubModuleWrapper title={t('trainingAuthoritiesTitle')} onBack={() => setAuthorityModule(null)}><AuthoritiesNGOs /></SubModuleWrapper>;
    
    if (resourceModule === 'tutorialVideos') return <SubModuleWrapper title={t('trainingHubTitle')} onBack={() => setResourceModule(null)}><TutorialVideos /></SubModuleWrapper>;


    return (
      <div className="space-y-8">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-full"><UsersIcon className="w-8 h-8 text-blue-600" /></div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{t('citizenTrainingTitle')}</h3>
              <p className="text-gray-500">{t('citizenTrainingDescription')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {citizenModules.map(m => (
              <TrainingCard key={m.view} icon={m.icon} title={m.title} description={m.description} onClick={() => setCitizenModule(m.view as TrainingView)} />
            ))}
          </div>
        </Card>

        <Card className="p-6">
           <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 rounded-full"><BriefcaseIcon className="w-8 h-8 text-indigo-600" /></div>
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{t('wasteWorkerTrainingTitle')}</h3>
                <p className="text-gray-500">{t('wasteWorkerTrainingDescription')}</p>
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workerModules.map(m => (
              <TrainingCard key={m.view} icon={m.icon} title={m.title} description={m.description} onClick={() => setWorkerModule(m.view as TrainingView)} />
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
           <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-100 rounded-full"><BuildingIcon className="w-8 h-8 text-gray-600" /></div>
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{t('trainingAuthoritiesTitle')}</h3>
                <p className="text-gray-500">{t('trainingAuthoritiesDescription')}</p>
            </div>
          </div>
           <div className="grid grid-cols-1 gap-4">
             <TrainingCard 
                key="authorities" 
                icon={<BuildingIcon />} 
                title={t('authoritiesTitle')} 
                description={t('authoritiesDescription')} 
                onClick={() => setAuthorityModule('authorities' as TrainingView)} 
             />
          </div>
        </Card>

        <Card className="p-6">
           <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 rounded-full"><PlayCircleIcon className="w-8 h-8 text-red-600" /></div>
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{t('trainingVideosTitle')}</h3>
                <p className="text-gray-500">{t('trainingVideosDescription')}</p>
            </div>
          </div>
           <div className="grid grid-cols-1 gap-4">
             <TrainingCard
                key="tutorialVideos"
                icon={<PlayCircleIcon />}
                title={t('tutorialVideosTitle')}
                description={t('tutorialVideosDescription')}
                onClick={() => setResourceModule('tutorialVideos' as TrainingView)}
              />
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {(!citizenModule && !workerModule && !authorityModule && !resourceModule) && (
        <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('trainingHubTitle')}</h2>
            <p className="text-center text-gray-500 mb-6">{t('trainingHubDescription')}</p>
        </>
      )}
      {renderContent()}
    </div>
  );
};

export default TrainingHub;