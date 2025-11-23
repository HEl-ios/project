import React, { createContext, useState, ReactNode } from 'react';
import { en } from './locales/en.ts';
import { hi } from './locales/hi.ts';

type Language = 'en' | 'hi';

const translations = { en, hi };

// Define a type for the translation keys based on the English translation file.
// This ensures type safety and autocompletion for translation keys.
export type TranslationKey = keyof typeof en;

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, replacements?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: TranslationKey, replacements?: { [key: string]: string | number }) => {
        let translation = translations[language][key] || translations['en'][key];
        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
            });
        }
        return translation;
    };
    
    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
