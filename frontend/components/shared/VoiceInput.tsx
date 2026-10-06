import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
  placeholder?: string;
  // If true, automatically translates the spoken text back to English
  translateToEnglish?: boolean; 
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onResult, 
  className = "", 
  translateToEnglish = true 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { selectedLanguage, translateText } = useLanguage();

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        // set language based on selected context language (e.g., 'hi-IN' for Hindi)
        rec.lang = selectedLanguage === 'en' ? 'en-US' : `${selectedLanguage}-IN`; 
        
        rec.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          
          if (translateToEnglish && selectedLanguage !== 'en') {
            setIsProcessing(true);
            try {
              const translated = await translateText(transcript, 'en');
              onResult(translated);
            } catch (err) {
              onResult(transcript);
            }
            setIsProcessing(false);
          } else {
            onResult(transcript);
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          setIsProcessing(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, [selectedLanguage, translateToEnglish, translateText, onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      if (recognition) {
        try {
          // Update language right before starting
          recognition.lang = selectedLanguage === 'en' ? 'en-US' : `${selectedLanguage}-IN`;
          recognition.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  if (!recognition) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={isProcessing}
      className={`p-2 rounded-full transition-all flex items-center justify-center ${
        isListening 
          ? 'bg-red-100 text-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
          : isProcessing
            ? 'bg-stone-100 text-stone-400'
            : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
      } ${className}`}
      title={isListening ? 'Listening...' : 'Click to speak'}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isListening ? (
        <Mic className="w-4 h-4" />
      ) : (
        <MicOff className="w-4 h-4" />
      )}
    </button>
  );
};
