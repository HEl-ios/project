import React, { useState, useRef, useCallback } from 'react';
import { identifyHighValueRecyclable } from '../../services/geminiService.ts';
import { HighValueRecyclableResult, BadgeSlug } from '../../types.ts';
import Card from '../common/Card.tsx';
import Spinner from '../common/Spinner.tsx';
import { CameraIcon, DollarSignIcon, RecycleIcon, ShieldIcon } from '../common/Icons.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';
import CameraView from '../common/CameraView.tsx';

interface RecyclableIdentifierProps {
  unlockBadge: (slug: BadgeSlug) => void;
  addPoints: (points: number) => void;
}

const ResultDisplay: React.FC<{ result: HighValueRecyclableResult }> = ({ result }) => {
    const { t } = useTranslation();
    return (
        <Card className="p-6 space-y-4">
            <h3 className="text-2xl font-bold text-center text-gray-800">{result.itemName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <Card className="p-4 bg-green-50">
                    <h4 className="font-semibold text-green-800">{t('identifierMaterialType')}</h4>
                    <p className="text-lg font-bold text-green-700">{result.materialType}</p>
                </Card>
                <Card className="p-4 bg-yellow-50">
                    <h4 className="font-semibold text-yellow-800">{t('identifierEstimatedValue')}</h4>
                    <p className="text-lg font-bold text-yellow-700">{result.estimatedValue}</p>
                </Card>
            </div>
            <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2"><DollarSignIcon className="w-5 h-5"/>{t('identifierValueDesc')}</h4>
                    <p className="text-gray-600 mt-1">{result.valueDescription}</p>
                </div>
                 <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2"><RecycleIcon className="w-5 h-5"/>{t('howToDispose')}</h4>
                    <p className="text-gray-600 mt-1">{result.disposalInstructions}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 flex items-center gap-2"><ShieldIcon className="w-5 h-5"/>{t('identifierHandling')}</h4>
                    <p className="text-blue-600 mt-1">{result.handlingInstructions}</p>
                </div>
            </div>
        </Card>
    );
};


const RecyclableIdentifier: React.FC<RecyclableIdentifierProps> = ({ addPoints }) => {
  const { t, language } = useTranslation();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HighValueRecyclableResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataURLtoFile = (dataurl: string, filename: string): File | null => {
      const arr = dataurl.split(',');
      const match = arr[0].match(/:(.*?);/);
      if (!match) return null;
      const mime = match[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) { u8arr[n] = bstr.charCodeAt(n); }
      return new File([u8arr], filename, { type: mime });
  }

  const resetState = () => {
    setImageSrc(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePhotoCapture = (dataUrl: string) => {
    setImageSrc(dataUrl);
    const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.jpg`);
    if (file) setImageFile(file);
    setResult(null);
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

  const handleIdentify = useCallback(async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const base64Image = await fileToBase64(imageFile);
      const identificationResult = await identifyHighValueRecyclable(base64Image, imageFile.type, language);
      setResult(identificationResult);
      addPoints(10);
    } catch (err) {
      setError((err as Error).message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [imageFile, addPoints, language]);


  return (
    <div className="max-w-2xl mx-auto">
      {isCameraOpen && <CameraView onCapture={handlePhotoCapture} onClose={() => setIsCameraOpen(false)} />}
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('identifierTitle')}</h2>
      <p className="text-center text-gray-500 mb-6">{t('identifierDescription')}</p>
      
      {!result && (
        <Card className="p-6">
          <div className="flex flex-col items-center">
            {imageSrc ? (
                <div className="relative w-full">
                    <img src={imageSrc} alt="Recyclable to identify" className="w-full h-auto max-h-72 object-contain rounded-md bg-gray-100 p-1 border" />
                    <button type="button" onClick={resetState} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 leading-none text-xl font-bold">&times;</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 w-full">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 hover:bg-gray-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-400 mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span className="text-sm font-semibold text-gray-600">{t('uploadPhoto')}</span>
                    </button>
                    <button type="button" onClick={() => setIsCameraOpen(true)} className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 hover:bg-gray-50 transition-colors">
                        <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm font-semibold text-gray-600">{t('takePhoto')}</span>
                    </button>
                </div>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
  
            <button
              onClick={handleIdentify}
              disabled={!imageSrc || loading}
              className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? t('analyzing') : t('identifierScanButton')}
            </button>
          </div>
        </Card>
      )}

      {loading && <div className="mt-6"><Spinner /></div>}
      {error && <p className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
      
      {result && (
        <div className="mt-6 animate-fade-in">
          <h3 className="text-xl font-bold text-center mb-4">{t('identifierResultTitle')}</h3>
          <ResultDisplay result={result}/>
          <button
              onClick={resetState}
              className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
             {t('classifyAnother')}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecyclableIdentifier;
