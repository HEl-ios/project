import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import Spinner from './common/Spinner.tsx';
import { MapPinIcon, ClockIcon } from './common/Icons.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import { findNearbyFacilities } from '../services/geminiService.ts';
import { Facility } from '../types.ts';

interface SearchHistoryItem {
  id: number;
  timestamp: string;
}

const FacilityLocator: React.FC = () => {
  const { t, language } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem('facilitySearchHistory');
        if (storedHistory) {
            setSearchHistory(JSON.parse(storedHistory));
        }
    } catch (error) {
        console.error("Failed to parse search history from localStorage", error);
    }
  }, []);

  const updateSearchHistory = (newHistory: SearchHistoryItem[]) => {
      setSearchHistory(newHistory);
      localStorage.setItem('facilitySearchHistory', JSON.stringify(newHistory));
  };
  
  const handleClearHistory = () => {
      updateSearchHistory([]);
  };

  const handleOpenMaps = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps/search/?api=1&query=waste+management+facility&ll=${latitude},${longitude}`;
        window.open(url, '_blank');
        setIsLoading(false);
      },
      (geoError) => {
        handleGeoError(geoError, setError);
        setIsLoading(false);
      }
    );
  };
  
  const handleGeoError = (geoError: GeolocationPositionError, errorSetter: (message: string) => void) => {
      switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorSetter(t('locationErrorDenied'));
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorSetter(t('locationErrorUnavailable'));
            break;
          case geoError.TIMEOUT:
            errorSetter(t('locationErrorTimeout'));
            break;
          default:
            errorSetter(t('locationErrorUnknown'));
            break;
        }
  }

  const handleSearchFacilities = () => {
    setIsSearching(true);
    setSearchError(null);
    setFacilities([]);
    setSearchAttempted(true);

    if (!navigator.geolocation) {
        setSearchError("Geolocation is not supported by your browser.");
        setIsSearching(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const results = await findNearbyFacilities(latitude, longitude, language);
                setFacilities(results);

                const newHistoryItem: SearchHistoryItem = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                };
                // Add new item and limit history to the 5 most recent entries
                const updatedHistory = [newHistoryItem, ...searchHistory].slice(0, 5);
                updateSearchHistory(updatedHistory);

            } catch (e) {
                setSearchError(t('searchError'));
            } finally {
                setIsSearching(false);
            }
        },
        (geoError) => {
            handleGeoError(geoError, setSearchError);
            setIsSearching(false);
        }
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('locatorTitle')}</h2>
      <p className="text-gray-500 mb-6">{t('locatorDescription')}</p>
      
      <div className="space-y-8">
        <Card className="p-8">
          <MapPinIcon className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('findFacilitiesTitle')}</h3>
          <p className="text-gray-600 mb-6">
            {t('findFacilitiesDescription')}
          </p>
          
          {error && (
              <div className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-lg" role="alert">
                  <p className="font-semibold">{t('locationErrorTitle')}</p>
                  <p>{error}</p>
              </div>
          )}

          <button
            onClick={handleOpenMaps}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-wait"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{t('gettingLocation')}</span>
              </>
            ) : (
              <>
              <span>{t('findFacilitiesButton')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </>
            )}
          </button>
        </Card>

        <Card className="p-6 text-left">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{t('facilitiesLocationLinkTitle')}</h3>
          <p className="text-gray-600 mb-6 text-center">{t('facilitiesLocationLinkDescription')}</p>
          
          <button
            onClick={handleSearchFacilities}
            disabled={isSearching}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-green-400 disabled:cursor-wait"
          >
            {isSearching ? t('searchingFacilities') : t('searchFacilitiesButton')}
          </button>

          <div className="mt-6 space-y-3">
            {isSearching && <Spinner />}
            {searchError && (
              <div className="text-center text-red-600 bg-red-100 p-3 rounded-lg" role="alert">
                  <p className="font-semibold">{t('locationErrorTitle')}</p>
                  <p>{searchError}</p>
              </div>
            )}
            {facilities.length > 0 && (
                facilities.map((facility, index) => (
                    <a 
                        key={index}
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.name + ', ' + facility.address)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-green-500 transition-colors shadow-sm"
                    >
                        <p className="font-semibold text-green-800">{facility.name}</p>
                        <p className="text-sm text-gray-600 mt-1 flex items-start gap-2">
                            <MapPinIcon className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0"/>
                            <span>{facility.address}</span>
                        </p>
                    </a>
                ))
            )}
            {searchAttempted && !isSearching && facilities.length === 0 && !searchError && (
                <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
                    <p>{t('noFacilitiesFound')}</p>
                </div>
            )}
          </div>
        </Card>

        <Card className="p-6 text-left">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{t('searchHistoryTitle')}</h3>
                {searchHistory.length > 0 && (
                    <button 
                        onClick={handleClearHistory} 
                        className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline px-2 py-1 rounded"
                        aria-label={t('clearSearchHistory')}
                    >
                        {t('clearSearchHistory')}
                    </button>
                )}
            </div>
            {searchHistory.length > 0 ? (
                <ul className="space-y-2">
                    {searchHistory.map(item => (
                        <li key={item.id}>
                            <button
                                onClick={handleSearchFacilities}
                                disabled={isSearching}
                                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex justify-between items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="flex items-center gap-2 text-gray-600">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>
                                        {new Date(item.timestamp).toLocaleString(language, {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-green-700 group-hover:underline">
                                    {t('searchAgain')}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center py-4">{t('noSearchHistory')}</p>
            )}
        </Card>

      </div>
    </div>
  );
};

export default FacilityLocator;