import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

const LANGUAGES = [
  { 
    value: 'en', 
    label: 'English', 
    native: 'English',
    flag: '🇬🇧'
  },
  { 
    value: 'amharic', 
    label: 'Amharic', 
    native: 'አማርኛ',
    flag: '🇪🇹'
  },
  { 
    value: 'afan_oromo', 
    label: 'Afan Oromo', 
    native: 'Afaan Oromoo',
    flag: '🇪🇹'
  },
  { 
    value: 'tigrigna', 
    label: 'Tigrigna', 
    native: 'ትግርኛ',
    flag: '🇪🇹'
  },
  { 
    value: 'somali', 
    label: 'Somali', 
    native: 'Soomaali',
    flag: '🇸🇴'
  }
];

// Function to get available languages based on current selection
const getAvailableLanguages = (currentLanguage: string, showOnlySelected: boolean = false) => {
  if (showOnlySelected) {
    return LANGUAGES.filter(lang => lang.value === currentLanguage);
  }
  return LANGUAGES;
};

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showOnlySelected?: boolean; // New prop to show only selected language
}

export function LanguageSelector({ 
  currentLanguage = 'en', 
  onLanguageChange,
  showLabel = true,
  size = 'md',
  showOnlySelected = false
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { patch } = useApi();

  const currentLang = LANGUAGES.find(lang => lang.value === currentLanguage) || LANGUAGES[0];
  const availableLanguages = getAvailableLanguages(currentLanguage, showOnlySelected);

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === currentLanguage) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      // Update user language in backend
      await patch('/users/profile/', { language: newLanguage });
      
      // Call parent callback
      if (onLanguageChange) {
        onLanguageChange(newLanguage);
      }
      
      toast.success('Language updated successfully!');
      
      // Reload page to apply language changes
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Failed to update language:', error);
      toast.error('Failed to update language');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3'
  };

  return (
    <div className="relative">
      <button
        onClick={() => !showOnlySelected && setIsOpen(!isOpen)}
        disabled={loading || showOnlySelected}
        className={`
          flex items-center gap-2 bg-white border border-gray-200 rounded-lg
          ${!showOnlySelected ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'} transition-colors duration-200
          ${sizeClasses[size]}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Globe className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-gray-600`} />
        
        <span className="flex items-center gap-2">
          <span className="text-lg">{currentLang.flag}</span>
          {showLabel && (
            <span className="font-medium text-gray-700">
              {currentLang.native}
            </span>
          )}
        </span>
        
        {!showOnlySelected && (
          <ChevronDown className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && !showOnlySelected && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-2">
              {availableLanguages.map((language) => (
                <button
                  key={language.value}
                  onClick={() => handleLanguageChange(language.value)}
                  disabled={loading}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-gray-50 transition-colors duration-150
                    ${currentLanguage === language.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-xl">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.native}</div>
                    <div className="text-sm text-gray-500">{language.label}</div>
                  </div>
                  {currentLanguage === language.value && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSelector;