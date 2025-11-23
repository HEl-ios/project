import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation.ts';
import { GlobeIcon } from './common/Icons.tsx';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleLanguageChange = (lang: 'en' | 'hi') => {
        setLanguage(lang);
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-gray-100 text-gray-800 font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <GlobeIcon className="h-5 w-5" />
                <span>{language.toUpperCase()}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20" role="menu">
                    <div className="py-1">
                        <button
                            onClick={() => handleLanguageChange('en')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                        >
                            {t('english')}
                        </button>
                        <button
                            onClick={() => handleLanguageChange('hi')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                        >
                            {t('hindi')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
