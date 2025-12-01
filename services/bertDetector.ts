/**
 * BERT-based Cyberbullying Detector
 * Uses TFLite model for accurate cyberbullying detection
 */

import { Asset } from 'expo-asset';

// Type definition for TFLite model (loaded dynamically)
type TensorflowModel = {
    run: (inputs: any[]) => Promise<any[]>;
};

// Model instance cache
let modelInstance: TensorflowModel | null = null;
let modelPromise: Promise<TensorflowModel> | null = null;
let vocabCache: Map<string, number> | null = null;

// Constants
const MAX_SEQ_LENGTH = 128;
const PAD_TOKEN = '[PAD]';
const UNK_TOKEN = '[UNK]';
const CLS_TOKEN = '[CLS]';
const SEP_TOKEN = '[SEP]';

export interface BERTDetectionResult {
    isCyberbullying: boolean;
    confidence: number;
    severity: number; // 0-1 scale
    riskLevel: number; // 0-100
    probabilities: number[];
    processingTime: number;
}

/**
 * Load vocabulary from vocab.txt
 */
async function loadVocabulary(): Promise<Map<string, number>> {
    if (vocabCache) {
        return vocabCache;
    }

    try {
        console.log('[BERT Detector] Loading vocabulary...');

        // For APK builds, use Asset for optimal loading
        let vocabText: string;
        try {
            // Primary: Load from assets/models (APK-optimized)
            const vocabAsset = Asset.fromModule(require('../assets/models/vocab.txt'));
            await vocabAsset.downloadAsync();

            if (!vocabAsset.localUri) {
                throw new Error('Failed to get vocab asset URI');
            }

            const response = await fetch(vocabAsset.localUri);
            vocabText = await response.text();
            console.log('[BERT Detector] Vocabulary loaded from assets/models (APK path)');
        } catch (assetError) {
            console.warn('[BERT Detector] Primary vocab loading failed, trying fallback:', assetError);

            // Fallback: try loading from BERT_Detector_Model folder
            try {
                const fallbackAsset = Asset.fromModule(require('../BERT_Detector_Model/vocab.txt'));
                await fallbackAsset.downloadAsync();

                if (!fallbackAsset.localUri) {
                    throw new Error('Failed to get fallback vocab asset URI');
                }

                const response = await fetch(fallbackAsset.localUri);
                vocabText = await response.text();
                console.log('[BERT Detector] Vocabulary loaded from BERT_Detector_Model (fallback)');
            } catch (fallbackError) {
                console.error('[BERT Detector] All vocab loading methods failed:', fallbackError);
                throw new Error('Could not load vocabulary from any location');
            }
        }

        const vocab = new Map<string, number>();
        const lines = vocabText.split('\n');

        lines.forEach((token, index) => {
            const cleanToken = token.trim();
            if (cleanToken) {
                vocab.set(cleanToken, index);
            }
        });

        console.log(`[BERT Detector] Loaded ${vocab.size} vocabulary tokens`);
        vocabCache = vocab;
        return vocab;
    } catch (error) {
        console.error('[BERT Detector] Error loading vocabulary:', error);
        throw error;
    }
}

/**
 * Tokenize text using BERT tokenizer
 */
function tokenize(
    text: string,
    vocab: Map<string, number>,
    maxLength: number
): { inputIds: number[]; attentionMask: number[] } {
    // Basic preprocessing
    const cleanText = text.toLowerCase().trim();

    // Simple word tokenization (for basic BERT tokenizer)
    const tokens = cleanText.split(/\s+/).filter(t => t.length > 0);

    // Get token IDs
    const clsId = vocab.get(CLS_TOKEN) || 101;
    const sepId = vocab.get(SEP_TOKEN) || 102;
    const padId = vocab.get(PAD_TOKEN) || 0;
    const unkId = vocab.get(UNK_TOKEN) || 100;

    // Build input IDs: [CLS] + tokens + [SEP]
    const inputIds: number[] = [clsId];
    const attentionMask: number[] = [1];

    // Add token IDs
    for (let i = 0; i < Math.min(tokens.length, maxLength - 2); i++) {
        const token = tokens[i];
        const tokenId = vocab.get(token) || unkId;
        inputIds.push(tokenId);
        attentionMask.push(1);
    }

    // Add SEP token
    inputIds.push(sepId);
    attentionMask.push(1);

    // Pad to max length
    while (inputIds.length < maxLength) {
        inputIds.push(padId);
        attentionMask.push(0);
    }

    return { inputIds, attentionMask };
}

/**
 * Softmax function to convert logits to probabilities
 */
function softmax(logits: number[]): number[] {
    const maxLogit = Math.max(...logits);
    const expValues = logits.map(x => Math.exp(x - maxLogit));
    const sumExp = expValues.reduce((a, b) => a + b, 0);
    return expValues.map(x => x / sumExp);
}

/**
 * BERT Detector Service Class
 */
class BERTDetectorService {
    private modelLoaded = false;
    private initializationPromise: Promise<void> | null = null;

    /**
     * Initialize the BERT detector (eager loading)
     * Call this during app startup for immediate loading
     */
    async initialize(): Promise<void> {
        // Return existing initialization if in progress
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        if (this.modelLoaded) {
            console.log('[BERT Detector] Already initialized');
            return;
        }
        
        // Create initialization promise to prevent multiple simultaneous inits
        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }
    
    private async _doInitialize(): Promise<void> {
        try {
            console.log('[BERT Detector] Initializing...');
            console.log('[BERT Detector] Platform:', require('react-native').Platform.OS);

            // Check if react-native-fast-tflite is available
            try {
                const { loadTensorflowModel: testLoad } = require('react-native-fast-tflite');
                if (!testLoad) {
                    throw new Error('TFLite module not properly loaded');
                }
                console.log('[BERT Detector] TFLite module is available');
            } catch (moduleError) {
                console.warn('[BERT Detector] TFLite module not available:', moduleError);
                console.log('[BERT Detector] This is expected in Expo Go. Use development build for BERT support.');
                this.modelLoaded = false;
                return; // Don't throw - gracefully fail
            }

            // Load vocabulary
            console.log('[BERT Detector] Loading vocabulary...');
            await loadVocabulary();
            console.log('[BERT Detector] Vocabulary loaded successfully');

            // Load TFLite model
            console.log('[BERT Detector] Loading model...');
            await this.loadModel();
            console.log('[BERT Detector] Model loaded successfully');

            this.modelLoaded = true;
            console.log('[BERT Detector] ✓ Initialized successfully');
        } catch (error) {
            console.error('[BERT Detector] ✗ Initialization failed:', error);
            console.error('[BERT Detector] Error stack:', (error as Error).stack);
            console.log('[BERT Detector] App will use semantic detector fallback');
            // Don't throw - allow app to continue with fallback
            this.modelLoaded = false;
        } finally {
            this.initializationPromise = null;
        }
    }

    /**
     * Load the TFLite model
     */
    private async loadModel(): Promise<TensorflowModel> {
        if (modelInstance) {
            return modelInstance;
        }

        if (modelPromise) {
            return modelPromise;
        }

        modelPromise = (async () => {
            try {
                console.log('[BERT Detector] Loading TFLite model...');
                const startTime = Date.now();

                // Try to dynamically import the TFLite module
                let loadTensorflowModelFunc;
                try {
                    const tfliteModule = require('react-native-fast-tflite');
                    loadTensorflowModelFunc = tfliteModule.loadTensorflowModel;

                    if (!loadTensorflowModelFunc) {
                        throw new Error('loadTensorflowModel function not found in module');
                    }
                } catch (moduleError) {
                    console.warn('[BERT Detector] TFLite module not available:', moduleError);
                    console.log('[BERT Detector] Native module requires development build. Expo Go is not supported.');
                    throw new Error('Native TFLite module unavailable');
                }

                // Load the model from assets/models folder
                // In development: Use require() directly (Metro will serve it)
                // In production APK: File will be bundled and accessible
                console.log('[BERT Detector] Loading model from assets...');
                
                const modelSource = require('../assets/models/cyberbully_model.tflite');
                console.log('[BERT Detector] Model source obtained, loading with TFLite...');
                
                const model = await loadTensorflowModelFunc(modelSource);
                console.log('[BERT Detector] TFLite model instance created and ready');

                const loadTime = Date.now() - startTime;
                console.log(`[BERT Detector] Model loaded successfully in ${loadTime}ms`);

                modelInstance = model;
                return model;
            } catch (error) {
                console.error('[BERT Detector] Error loading model:', error);
                console.error('[BERT Detector] Error details:', JSON.stringify(error, null, 2));
                modelPromise = null;
                throw error;
            }
        })();

        return modelPromise;
    }

    /**
     * Analyze text for cyberbullying using BERT model
     */
    async analyzeText(text: string): Promise<BERTDetectionResult> {
        if (!this.modelLoaded) {
            console.log('[BERT Detector] Model not loaded, attempting to initialize...');
            await this.initialize();
        }

        if (!text || text.trim().length === 0) {
            return this.getDefaultResult();
        }

        const startTime = Date.now();

        try {
            // Ensure vocabulary is loaded
            if (!vocabCache) {
                console.error('[BERT Detector] Vocabulary not loaded');
                throw new Error('Vocabulary not loaded');
            }

            if (!modelInstance) {
                console.error('[BERT Detector] Model instance not available');
                console.error('[BERT Detector] Model loaded flag:', this.modelLoaded);
                throw new Error('Model not loaded');
            }

            console.log('[BERT Detector] Analyzing text:', text.substring(0, 50));

            // Tokenize input text
            const { inputIds, attentionMask } = tokenize(text, vocabCache, MAX_SEQ_LENGTH);

            // Convert to Int32Array
            const inputIdsArray = new Int32Array(inputIds);
            const attentionMaskArray = new Int32Array(attentionMask);

            // Reshape to [1, 128] for batch dimension
            const inputIdsTensor = [Array.from(inputIdsArray)];
            const attentionMaskTensor = [Array.from(attentionMaskArray)];

            console.log('[BERT Detector] Running inference...');
            // Run inference
            const outputs = await modelInstance.run([inputIdsTensor, attentionMaskTensor]);

            // Extract logits
            const logits = Array.isArray(outputs[0][0])
                ? outputs[0][0]
                : Array.from(outputs[0] as Float32Array);

            console.log('[BERT Detector] Logits:', logits);

            // Calculate probabilities
            const probabilities = softmax(logits);

            // Determine if cyberbullying (label 1 is bullying)
            const bullyingProbability = probabilities[1];
            const isCyberbullying = bullyingProbability > 0.5;

            // Calculate severity and risk level
            const severity = Math.min(1, Math.max(0, bullyingProbability));
            const riskLevel = Math.round(severity * 100);

            const processingTime = Date.now() - startTime;

            console.log('[BERT Detector] Result:', {
                isCyberbullying,
                confidence: isCyberbullying ? bullyingProbability : probabilities[0],
                severity,
                riskLevel,
                processingTime
            });

            return {
                isCyberbullying,
                confidence: isCyberbullying ? bullyingProbability : probabilities[0],
                severity,
                riskLevel,
                probabilities,
                processingTime
            };
        } catch (error) {
            console.error('[BERT Detector] Analysis error:', error);
            console.error('[BERT Detector] Error details:', (error as Error).message);
            return this.getDefaultResult();
        }
    }

    /**
     * Check if model is loaded
     */
    isLoaded(): boolean {
        return this.modelLoaded;
    }

    /**
     * Get default result for errors/empty text
     */
    private getDefaultResult(): BERTDetectionResult {
        return {
            isCyberbullying: false,
            confidence: 0,
            severity: 0,
            riskLevel: 0,
            probabilities: [1, 0],
            processingTime: 0
        };
    }
}

// Export singleton instance
export const bertDetector = new BERTDetectorService();
