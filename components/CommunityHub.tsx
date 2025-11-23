import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation.ts';
import { Community, CommunityMember, CommunityMessage } from '../types.ts';
import { UsersIcon, PlusCircleIcon, ArrowLeftIcon, MapPinIcon } from './common/Icons.tsx';
import Card from './common/Card.tsx';
import CommunityChat from './CommunityChat.tsx';
import { getAreaFromCoordinates } from '../services/geminiService.ts';
import Spinner from './common/Spinner.tsx';

interface CommunityHubProps {
    userId: string;
    userName: string;
    communities: Community[];
    communityMembers: Record<string, CommunityMember[]>;
    communityMessages: Record<string, CommunityMessage[]>;
    createCommunity: (name: string, description: string, areaName: string) => Community;
    joinCommunity: (communityId: string) => void;
    sendMessage: (communityId: string, text: string) => Promise<{ success: boolean; reason?: string; }>;
}

interface CreateCommunityProps {
    onCreate: (name: string, description: string, areaName: string) => void;
    onAreaDetect: () => Promise<string | null>;
}

const CreateCommunity: React.FC<CreateCommunityProps> = ({ onCreate, onAreaDetect }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isDetecting, setIsDetecting] = useState(true);
    const [detectedArea, setDetectedArea] = useState<string | null>(null);
    const [detectionError, setDetectionError] = useState<string | null>(null);
    
    useEffect(() => {
        const runDetection = async () => {
            setIsDetecting(true);
            setDetectionError(null);
            const area = await onAreaDetect();
            if (area) {
                setDetectedArea(area);
            } else {
                setDetectionError('Could not automatically detect your area. A generic location name will be used.');
                setDetectedArea('Community Area'); // Fallback value
            }
            setIsDetecting(false);
        };
        runDetection();
    }, [onAreaDetect]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const areaToUse = detectedArea || "Community Area";
        if (name.trim() && description.trim()) {
            onCreate(name.trim(), description.trim(), areaToUse);
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">{t('createCommunityTitle')}</h3>
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="comm-name" className="block text-sm font-medium text-gray-700">{t('communityName')}</label>
                        <input type="text" id="comm-name" value={name} onChange={e => setName(e.target.value)} placeholder={t('communityNamePlaceholder')} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                    </div>
                    <div>
                        <label htmlFor="comm-desc" className="block text-sm font-medium text-gray-700">{t('communityDescription')}</label>
                        <textarea id="comm-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('communityDescriptionPlaceholder')} rows={3} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                    </div>
                    
                    <div className="p-3 bg-gray-100 rounded-lg text-sm">
                        {isDetecting ? (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Spinner />
                                <p>Detecting your location...</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        Community Location: {detectedArea}
                                    </p>
                                    {detectionError && <p className="text-xs text-yellow-700">{detectionError}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-center text-gray-500 -mt-2">
                        The detected location will be automatically added to your community name.
                    </p>

                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400" disabled={!name.trim() || !description.trim() || isDetecting}>{t('createButton')}</button>
                </form>
            </Card>
        </div>
    );
};

const JoinCommunity: React.FC<{ allCommunities: Community[], myCommunities: Community[], onJoin: (id: string) => void, onOpen: (c: Community) => void, userId: string }> = ({ allCommunities, myCommunities, onJoin, onOpen }) => {
    const { t } = useTranslation();
    const myCommunityIds = new Set(myCommunities.map(c => c.id));

    return (
        <div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">{t('joinCommunityTitle')}</h3>
            <Card className="p-4">
                <h4 className="font-semibold mb-2 px-2">{t('allCommunities')}</h4>
                <div className="space-y-2">
                    {allCommunities.length === 0 && <p className="text-center text-gray-500 py-4">{t('noCommunitiesExist')}</p>}
                    {allCommunities.map(comm => {
                        const isMember = myCommunityIds.has(comm.id);
                        return (
                            <div key={comm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{comm.name}</p>
                                    <p className="text-sm text-gray-600">{comm.description}</p>
                                </div>
                                <button
                                    onClick={() => isMember ? onOpen(comm) : onJoin(comm.id)}
                                    disabled={isMember}
                                    className="bg-green-600 text-white font-bold py-1 px-3 rounded-lg text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700"
                                >
                                    {isMember ? t('joinedButton') : t('joinButton')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

const CommunityHub: React.FC<CommunityHubProps> = (props) => {
    const { t, language } = useTranslation();
    const [view, setView] = useState<'main' | 'create' | 'join' | 'chat'>('main');
    const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
    const [areaDetectionError, setAreaDetectionError] = useState<string | null>(null);

    const myCommunities = props.communities.filter(c => 
        props.communityMembers[c.id]?.some(m => m.userId === props.userId)
    );
    
    const detectArea = async (): Promise<string | null> => {
        setAreaDetectionError(null);
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                setAreaDetectionError("Geolocation is not supported by your browser.");
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const areaName = await getAreaFromCoordinates(latitude, longitude, language);
                        resolve(areaName);
                    } catch (e) {
                        console.error(e);
                        setAreaDetectionError((e as Error).message);
                        resolve(null);
                    }
                },
                (geoError) => {
                    let message = "An unknown error occurred.";
                    if (geoError.code === geoError.PERMISSION_DENIED) {
                        message = "Location access was denied. Please enable it in your browser settings.";
                    } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
                        message = "Location information is unavailable.";
                    }
                    setAreaDetectionError(message);
                    resolve(null);
                },
                { timeout: 10000 }
            );
        });
    };

    const handleCreateCommunity = (name: string, description: string, areaName: string) => {
        const newCommunity = props.createCommunity(name, description, areaName);
        setActiveCommunity(newCommunity);
        setView('chat');
    }

    const handleJoinCommunity = (communityId: string) => {
        props.joinCommunity(communityId);
    }

    const openChat = (community: Community) => {
        setActiveCommunity(community);
        setView('chat');
    }
    
    const renderContent = () => {
        switch (view) {
            case 'create':
                return <CreateCommunity onCreate={handleCreateCommunity} onAreaDetect={detectArea} />;
            case 'join':
                return <JoinCommunity allCommunities={props.communities} myCommunities={myCommunities} onJoin={handleJoinCommunity} onOpen={openChat} userId={props.userId} />;
            case 'chat':
                if (activeCommunity) {
                    return <CommunityChat
                        community={activeCommunity}
                        messages={props.communityMessages[activeCommunity.id] || []}
                        currentUser={{ userId: props.userId, userName: props.userName }}
                        onSendMessage={props.sendMessage}
                    />;
                }
                setView('main'); // Fallback
                return null;
            case 'main':
            default:
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card onClick={() => setView('create')} className="p-6 text-center">
                                <PlusCircleIcon className="w-12 h-12 mx-auto text-green-600 mb-2" />
                                <h3 className="text-xl font-semibold">{t('startCommunity')}</h3>
                            </Card>
                            <Card onClick={() => setView('join')} className="p-6 text-center">
                                <UsersIcon className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                                <h3 className="text-xl font-semibold">{t('joinCommunity')}</h3>
                            </Card>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('yourCommunities')}</h3>
                            <Card className="p-4">
                                <div className="space-y-2">
                                    {myCommunities.length === 0 && <p className="text-center text-gray-500 py-4">{t('noCommunitiesJoined')}</p>}
                                    {myCommunities.map(comm => (
                                        <div key={comm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-semibold">{comm.name}</p>
                                                <p className="text-xs text-gray-500">{t('members', { count: props.communityMembers[comm.id]?.length || 0 })}</p>
                                            </div>
                                            <button onClick={() => openChat(comm)} className="bg-green-600 text-white font-bold py-1 px-3 rounded-lg text-sm hover:bg-green-700">{t('openChat')}</button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {view === 'main' && (
                <>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('communityHubTitle')}</h2>
                    <p className="text-center text-gray-500 mb-6">{t('communityHubDescription')}</p>
                </>
            )}
            {view !== 'main' && (
                <button onClick={() => setView('main')} className="flex items-center gap-2 font-semibold text-green-700 hover:text-green-800 mb-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>{t('communityHubTitle')}</span>
                </button>
            )}
            {renderContent()}
        </div>
    );
};

export default CommunityHub;