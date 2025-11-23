import React, { useState } from 'react';
import Card from '../common/Card.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';
import { ChevronDownIcon, PlayCircleIcon } from '../common/Icons.tsx';

interface Video {
    titleKey: string;
    url: string;
}

interface VideoCategory {
    levelKey: 'beginners' | 'intermediate' | 'experts';
    videos: Video[];
}

const citizenVideos: VideoCategory[] = [
    {
        levelKey: 'beginners',
        videos: [
            { titleKey: 'citizenBeginnerVideo1', url: 'https://youtu.be/VHVrrkSRFBM' },
            { titleKey: 'citizenBeginnerVideo2', url: 'https://www.youtube.com/watch?v=M8X-A2f_VwQ' },
        ],
    },
    {
        levelKey: 'intermediate',
        videos: [
            { titleKey: 'citizenIntermediateVideo1', url: 'https://www.youtube.com/watch?v=e_s-s_11j-A' },
            { titleKey: 'citizenIntermediateVideo2', url: 'https://www.youtube.com/watch?v=pUMIFQ2pD3I' },
        ],
    },
    {
        levelKey: 'experts',
        videos: [
            { titleKey: 'citizenExpertVideo1', url: 'https://www.youtube.com/watch?v=J3-a9jG-5gU' },
            { titleKey: 'citizenExpertVideo2', url: 'https://www.youtube.com/watch?v=z_4-a32_f2E' },
        ],
    },
];

const workerVideos: VideoCategory[] = [
    {
        levelKey: 'beginners',
        videos: [
            { titleKey: 'workerBeginnerVideo1', url: 'https://www.youtube.com/watch?v=e114e1Ip4wI' },
            { titleKey: 'workerBeginnerVideo2', url: 'https://www.youtube.com/watch?v=mYwpO5n3-A8' },
        ],
    },
    {
        levelKey: 'intermediate',
        videos: [
            { titleKey: 'workerIntermediateVideo1', url: 'https://www.youtube.com/watch?v=aZ2da-DRi1A' },
            { titleKey: 'workerIntermediateVideo2', url: 'https://www.youtube.com/watch?v=R2bIib-a-3k' },
        ],
    },
    {
        levelKey: 'experts',
        videos: [
            { titleKey: 'workerExpertVideo1', url: 'https://www.youtube.com/watch?v=eW4C7n1T4jI' },
            { titleKey: 'workerExpertVideo2', url: 'https://www.youtube.com/watch?v=tI9e_W29OqI' },
        ],
    },
];

const VideoAccordion: React.FC<{ category: VideoCategory }> = ({ category }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg bg-gray-50 hover:bg-gray-100"
            >
                <span>{t(category.levelKey)}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 space-y-3">
                    {category.videos.map((video) => (
                        <a
                            key={video.titleKey}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white rounded-md border hover:bg-green-50 hover:border-green-300 transition-colors"
                        >
                            <PlayCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700">{t(video.titleKey as any)}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

const TutorialVideos: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('tutorialVideosTitle')}</h2>
            <p className="text-center text-gray-500 mb-6">{t('tutorialVideosDescription')}</p>
            
            <div className="space-y-8">
                {/* For Citizens */}
                <Card className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('videosForCitizens')}</h3>
                    <div className="space-y-4">
                        {citizenVideos.map(category => (
                            <VideoAccordion key={category.levelKey} category={category} />
                        ))}
                    </div>
                </Card>

                {/* For Waste Workers */}
                <Card className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('videosForWorkers')}</h3>
                    <div className="space-y-4">
                        {workerVideos.map(category => (
                            <VideoAccordion key={category.levelKey} category={category} />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TutorialVideos;