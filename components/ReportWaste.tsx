import React, { useState, useRef, useEffect } from 'react';
import Card from './common/Card.tsx';
import { CameraIcon, MicrophoneIcon } from './common/Icons.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import { ReportHistoryItem, ReportAnalysis } from '../types.ts';
import { authenticateWasteMedia, analyzeReportedWaste } from '../services/geminiService.ts';
import useVoiceRecognition from '../hooks/useVoiceRecognition.ts';
import CameraView from './common/CameraView.tsx';

// Simple string hash function for duplicate detection
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};


interface ReportWasteProps {
    incrementReportCount: () => void;
    addReportToHistory: (reportData: Omit<ReportHistoryItem['data'], 'status' | 'penaltyStatus'> & Partial<Pick<ReportHistoryItem['data'], 'analysis'>>) => void;
    addPoints: (points: number) => void;
}

const ReportWaste: React.FC<ReportWasteProps> = ({ incrementReportCount, addReportToHistory, addPoints }) => {
  const { t, language } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening, isSupported, error: voiceError } = useVoiceRecognition(language);

  useEffect(() => {
      if (transcript) {
          setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
      }
  }, [transcript]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAuthError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !description) return;

    setIsSubmitting(true);
    setIsAuthenticating(true);
    setAuthError(null);

    // 1. Duplicate Check
    const imageHash = simpleHash(image);
    const hashes = JSON.parse(localStorage.getItem('wasteReportHashes') || '{}');
    if (hashes[imageHash] && hashes[imageHash] >= 2) {
        setAuthError(t('duplicateReportError'));
        setIsSubmitting(false);
        setIsAuthenticating(false);
        return;
    }

    // 2. AI Authentication & Analysis
    try {
        const base64Image = image.split(',')[1];
        const mimeType = image.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
        
        const authResult = await authenticateWasteMedia(base64Image, mimeType, language);
        
        if (!authResult.isValidWasteReport || !authResult.isRecent) {
            setAuthError(authResult.reason);
            setIsSubmitting(false);
            setIsAuthenticating(false);
            return;
        }

        setIsAuthenticating(false);
        setIsAnalyzing(true);
        
        let analysisResult: ReportAnalysis | undefined = undefined;
        try {
          analysisResult = await analyzeReportedWaste(base64Image, mimeType, language);
        } catch (analysisError) {
            console.warn("AI analysis failed, proceeding without it.", analysisError);
            // Proceed without analysis data if this step fails
        }
        
        setIsAnalyzing(false);

        // 3. Proceed with submission
        await new Promise<void>((resolvePromise) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
              addReportToHistory({ image, description, location, analysis: analysisResult });
              resolvePromise();
            },
            (err) => {
              console.warn("Could not get location:", err.message);
              addReportToHistory({ image, description, analysis: analysisResult });
              resolvePromise();
            },
            { timeout: 10000 }
          );
        });

        // Update hash count on successful submission
        hashes[imageHash] = (hashes[imageHash] || 0) + 1;
        localStorage.setItem('wasteReportHashes', JSON.stringify(hashes));
        
        addPoints(25); // Award points for a successful report
        incrementReportCount();
        setSubmitted(true);

    } catch (err) {
        setAuthError((err as Error).message);
    } finally {
        setIsSubmitting(false);
        setIsAuthenticating(false);
        setIsAnalyzing(false);
    }
  };
  
  const resetForm = () => {
      setImage(null);
      setDescription('');
      setSubmitted(false);
      setAuthError(null);
  }

  const getButtonText = () => {
    if (isAuthenticating) return t('authenticating');
    if (isAnalyzing) return t('analyzingReport');
    if (isSubmitting) return t('submittingReport');
    return t('submitReport');
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-green-600 mb-2">{t('reportThanks')}</h2>
          <p className="text-gray-600 mb-4">{t('reportSubmitted')}</p>
          <button
            onClick={resetForm}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('submitAnother')}
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {isCameraOpen && <CameraView onCapture={(img) => { setImage(img); setIsCameraOpen(false); }} onClose={() => setIsCameraOpen(false)} />}
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('reportTitle')}</h2>
      <p className="text-center text-gray-500 mb-6">{t('reportDescription')}</p>
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportImageLabel')}</label>
              {image ? (
                  <div className="relative">
                      <img src={image} alt="Reported waste" className="w-full h-auto max-h-72 object-contain rounded-md bg-gray-100 p-1 border" />
                      <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 leading-none text-xl font-bold">&times;</button>
                  </div>
              ) : (
                  <div className="grid grid-cols-2 gap-4">
                      <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 hover:bg-gray-50 transition-colors"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-400 mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          <span className="text-sm font-semibold text-gray-600">{t('uploadPhoto')}</span>
                      </button>
                      <button
                          type="button"
                          onClick={() => setIsCameraOpen(true)}
                          className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 hover:bg-gray-50 transition-colors"
                      >
                          <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm font-semibold text-gray-600">{t('takePhoto')}</span>
                      </button>
                  </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('description')}</label>
                 {isSupported && (
                    <button type="button" onClick={isListening ? stopListening : startListening} className={`p-1 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-gray-200'}`}>
                        <MicrophoneIcon className="w-5 h-5"/>
                    </button>
                 )}
              </div>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200"
                placeholder={isListening ? t('voiceInputListening') : t('descriptionPlaceholder')}
              ></textarea>
              {voiceError && <p className="text-xs text-red-500 mt-1">{voiceError}</p>}
               {!isSupported && <p className="text-xs text-gray-500 mt-1">{t('voiceInputUnsupported')}</p>}
            </div>
          </div>

          {authError && (
              <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg" role="alert">
                  <p className="font-semibold">{t('authenticationFailed')}</p>
                  <p>{authError}</p>
              </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={!image || !description || isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-wait"
            >
              {getButtonText()}
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">{t('geotagged')}</p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ReportWaste;