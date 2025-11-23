import React, { useState, useRef, useCallback } from 'react';
import { getMaterialFromImage, generateUpcycledArt } from '../services/geminiService.ts';
import Card from './common/Card.tsx';
import Spinner from './common/Spinner.tsx';
import { CameraIcon } from './common/Icons.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import CameraView from './common/CameraView.tsx';

// Helper function to convert a data URL to a File object
const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    const match = arr[0].match(/:(.*?);/);
    if (!match) return null;

    const mime = match[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


const UpcycledArtGenerator: React.FC = () => {
    const { t, language } = useTranslation();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState<string>('');
    const [ideaPrompt, setIdeaPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const materials = [
        { key: 'plasticBottles', value: 'plastic bottles' },
        { key: 'oldNewspapers', value: 'old newspapers' },
        { key: 'tinCans', value: 'tin cans' },
        { key: 'glassJars', value: 'glass jars' },
        { key: 'cardboard', value: 'cardboard boxes' },
    ];

    const resetInputs = () => {
        setImageSrc(null);
        setImageFile(null);
        setSelectedMaterial('');
        setIdeaPrompt('');
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
    
    const generateAgain = () => {
        setGeneratedImage(null);
        resetInputs();
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImageFile(file);
            setSelectedMaterial(''); // Clear manual selection
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePhotoCapture = (dataUrl: string) => {
        setImageSrc(dataUrl);
        const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.jpg`);
        if (file) {
            setImageFile(file);
            setSelectedMaterial(''); // Clear manual selection
        }
        setError(null);
        setIsCameraOpen(false);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    const handleGenerate = async () => {
        if (!ideaPrompt.trim() || (!imageFile && !selectedMaterial)) return;

        setLoading(true);
        setError(null);
        setGeneratedImage(null);
        
        let material = selectedMaterial;

        try {
            if (imageFile) {
                setLoadingMessage(t('analyzing'));
                const base64Image = await fileToBase64(imageFile);
                material = await getMaterialFromImage(base64Image, imageFile.type, language);
            }
            
            if (!material) {
                throw new Error(t('errorIdentifyingMaterial'));
            }

            setLoadingMessage(t('generatingArt'));
            const artBase64 = await generateUpcycledArt(material, ideaPrompt);
            setGeneratedImage(`data:image/png;base64,${artBase64}`);

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    }

    if (loading) {
        return (
            <div className="max-w-md mx-auto text-center">
                <Card className="p-8">
                    <Spinner />
                    <p className="mt-4 text-gray-600 font-semibold">{loadingMessage}</p>
                </Card>
            </div>
        );
    }

    if (error) {
         return (
            <div className="max-w-md mx-auto text-center space-y-4">
                <Card className="p-8">
                    <p className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>
                    <button
                        onClick={generateAgain}
                        className="mt-4 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {t('generateAgain')}
                    </button>
                </Card>
            </div>
        );
    }
    
    if (generatedImage) {
        return (
            <div className="max-w-lg mx-auto text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-800">{t('artResultTitle')}</h2>
                <Card className="p-4">
                     <img src={generatedImage} alt="Generated upcycled art" className="w-full h-auto object-contain rounded-md" />
                </Card>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={generateAgain}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {t('generateAgain')}
                    </button>
                    <a
                        href={generatedImage}
                        download="upcycled-art.png"
                        className="w-full block bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
                    >
                        {t('downloadArt')}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {isCameraOpen && <CameraView onCapture={handlePhotoCapture} onClose={() => setIsCameraOpen(false)} />}
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('upcycledArtTitle')}</h2>
            <p className="text-center text-gray-500 mb-6">{t('upcycledArtDescription')}</p>

            <Card className="p-6 space-y-6">
                {/* Step 1 */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('artStep1')}</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        {imageSrc ? (
                            <div className="relative w-full">
                                <img src={imageSrc} alt="Waste to upcycle" className="w-full h-auto max-h-56 object-contain rounded-md bg-white p-1 border" />
                                <button type="button" onClick={() => {setImageFile(null); setImageSrc(null);}} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 leading-none text-xl font-bold">&times;</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 hover:bg-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-400 mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    <span className="text-sm text-center font-semibold text-gray-600">{t('uploadWasteImage')}</span>
                                </button>
                                <button type="button" onClick={() => setIsCameraOpen(true)} className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 hover:bg-white transition-colors">
                                    <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-center font-semibold text-gray-600">{t('takePhoto')}</span>
                                </button>
                            </div>
                        )}
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

                        <div className="flex items-center my-4">
                            <hr className="flex-grow border-gray-300" />
                            <span className="mx-4 text-gray-500 font-semibold">{t('orSelectMaterial')}</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>
                        
                        <select
                            value={selectedMaterial}
                            onChange={(e) => {setSelectedMaterial(e.target.value); setImageFile(null); setImageSrc(null);}}
                            className="w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-base focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        >
                            <option value="">{t('selectAMaterial')}</option>
                            {materials.map(m => (
                                <option key={m.key} value={m.value}>{t(m.key as any)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Step 2 */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('artStep2')}</h3>
                    <textarea
                        value={ideaPrompt}
                        onChange={(e) => setIdeaPrompt(e.target.value)}
                        rows={3}
                        className="block w-full rounded-lg border-gray-300 shadow-sm p-3 text-base placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        placeholder={t('artPromptPlaceholder')}
                    />
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={!ideaPrompt || (!imageFile && !selectedMaterial)}
                  className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {t('generateArtButton')}
                </button>
            </Card>
        </div>
    );
};

export default UpcycledArtGenerator;