import { useState } from 'react';
import { Platform } from 'react-native';

// Conditional import for native modules
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = null;

// Only import native modules if not in Expo Go
try {
    if (Platform.OS !== 'web') {
        const speechRecognition = require('expo-speech-recognition');
        ExpoSpeechRecognitionModule = speechRecognition.ExpoSpeechRecognitionModule;
        useSpeechRecognitionEvent = speechRecognition.useSpeechRecognitionEvent;
    }
} catch (error) {
    // Native module not available (Expo Go)
    console.log('Speech recognition native module not available');
}

interface UseSpeechRecognitionResult {
    isListening: boolean;
    transcript: string;
    startListening: () => Promise<void>;
    stopListening: () => void;
    error: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Only set up event listeners if native module is available
    if (useSpeechRecognitionEvent) {
        useSpeechRecognitionEvent('start', () => {
            setIsListening(true);
            setError(null);
        });

        useSpeechRecognitionEvent('end', () => {
            setIsListening(false);
        });

        useSpeechRecognitionEvent('result', (event: any) => {
            const results = event.results;
            if (results && results.length > 0) {
                const latestResult = results[results.length - 1];
                if (latestResult && latestResult.transcript) {
                    setTranscript(latestResult.transcript);
                }
            }
        });

        useSpeechRecognitionEvent('error', (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError(event.error || 'Speech recognition error');
            setIsListening(false);
        });
    }

    const startListening = async () => {
        try {
            setError(null);
            setTranscript('');

            // Check if native module is available
            if (!ExpoSpeechRecognitionModule) {
                setError('Speech recognition is only available in development or production builds. Please type your text instead.');
                return;
            }

            // Check and request permissions
            const { status: existingStatus } = await ExpoSpeechRecognitionModule.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                setError('Microphone permission not granted');
                return;
            }

            // Start recognition
            ExpoSpeechRecognitionModule.start({
                lang: 'en-US',
                interimResults: true,
                maxAlternatives: 1,
                continuous: false,
                requiresOnDeviceRecognition: false,
                addsPunctuation: false,
                contextualStrings: [],
            });

            setIsListening(true);
        } catch (err: any) {
            console.error('Failed to start speech recognition:', err);
            setError(err.message || 'Failed to start speech recognition. Please type your text instead.');
            setIsListening(false);
        }
    };

    const stopListening = () => {
        try {
            if (ExpoSpeechRecognitionModule) {
                ExpoSpeechRecognitionModule.stop();
            }
            setIsListening(false);
        } catch (err: any) {
            console.error('Failed to stop speech recognition:', err);
            setError(err.message || 'Failed to stop speech recognition');
            setIsListening(false);
        }
    };

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        error,
    };
}
