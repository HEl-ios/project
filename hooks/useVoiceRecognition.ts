import { useState, useEffect, useRef } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve "Cannot find name 'SpeechRecognition'" errors.
// These types are not always included in default TypeScript DOM library files.
interface SpeechRecognitionAlternative {
    readonly transcript: string;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly [index: number]: SpeechRecognitionAlternative;
    readonly length: number;
}

interface SpeechRecognitionResultList {
    readonly [index: number]: SpeechRecognitionResult;
    readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

// Extend the Window interface to include webkitSpeechRecognition for Safari/Chrome compatibility
declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

// Define the return type for the hook
interface UseVoiceRecognitionReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    isSupported: boolean;
    error: string | null;
}

const useVoiceRecognition = (language: 'en' | 'hi' = 'en'): UseVoiceRecognitionReturn => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    useEffect(() => {
        if (!isSupported) {
            return;
        }

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognitionAPI();
        const recognition = recognitionRef.current;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            // FIX: Provide more specific, user-friendly error messages based on the error type.
            let errorMessage = language === 'hi' ? 'पहचान के दौरान एक त्रुटि हुई।' : 'An error occurred during recognition.';
            switch (event.error) {
                case 'no-speech':
                    errorMessage = language === 'hi' ? 'कोई आवाज़ नहीं मिली। कृपया पुनः प्रयास करें।' : 'No speech was detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = language === 'hi' ? 'माइक्रोफ़ोन तक नहीं पहुँच सका। कृपया अपनी माइक्रोफ़ोन सेटिंग्स जांचें।' : 'Could not access the microphone. Please check your microphone settings.';
                    break;
                case 'not-allowed':
                    errorMessage = language === 'hi' ? 'माइक्रोफ़ोन का उपयोग करने की अनुमति नहीं दी गई। कृपया अपनी ब्राउज़र सेटिंग्स में अनुमति दें।' : 'Microphone access was denied. Please allow microphone access in your browser settings.';
                    break;
                case 'network':
                    errorMessage = language === 'hi' ? 'एक नेटवर्क त्रुटि हुई। कृपया अपना इंटरनेट कनेक्शन जांचें।' : 'A network error occurred. Please check your internet connection.';
                    break;
            }
            setError(errorMessage);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const currentTranscript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            if (event.results[0].isFinal) {
                setTranscript(currentTranscript);
            }
        };

        return () => {
            recognition.stop();
        };
    }, [isSupported, language]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    return { isListening, transcript, startListening, stopListening, isSupported, error };
};

export default useVoiceRecognition;