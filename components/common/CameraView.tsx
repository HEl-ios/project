import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/useTranslation.ts';
import { CameraIcon } from './Icons.tsx';

const CameraView: React.FC<{
    onCapture: (image: string) => void;
    onClose: () => void;
}> = ({ onCapture, onClose }) => {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                activeStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                setStream(activeStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = activeStream;
                }
            } catch (err) {
                console.error("Camera access error:", err);
                alert(t('cameraErrorDescription'));
                onClose();
            }
        };
        startCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onClose, t]);

    const handleCapture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            onCapture(dataUrl);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black z-30 flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-around items-center">
                <button
                    onClick={onClose}
                    className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    {t('cancel')}
                </button>
                <button
                    onClick={handleCapture}
                    className="bg-green-600 text-white font-bold py-4 px-4 rounded-full hover:bg-green-700 transition-colors ring-4 ring-white/50"
                    aria-label={t('capture')}
                >
                    <CameraIcon className="w-8 h-8"/>
                </button>
            </div>
        </div>
    );
};

export default CameraView;
