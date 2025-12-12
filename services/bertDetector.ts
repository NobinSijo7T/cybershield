/**
 * BERT-based Cyberbullying Detector
 * Uses TFLite model for accurate cyberbullying detection
 */

import { Asset } from 'expo-asset';
import { BERTTokenizer } from './tokenizer';

// Type definition for TFLite model (loaded dynamically)
type TensorflowModel = {
    run: (inputs: any[]) => Promise<any[]>;
};

// Model instance cache
let modelInstance: TensorflowModel | null = null;
let modelPromise: Promise<TensorflowModel> | null = null;
let tokenizerInstance: BERTTokenizer | null = null;

// Constants
const MAX_SEQ_LENGTH = 128;

// LABEL ENCODING CONFIGURATION
// Set to true if your model uses: probabilities[0] = bullying, probabilities[1] = safe
// Set to false if your model uses: probabilities[0] = safe, probabilities[1] = bullying (default)
// TRY FLIPPING THIS IF DETECTION IS INVERTED!
const USE_REVERSED_LABELS = true; // Changed to true - try reversed labels first

export interface BERTDetectionResult {
    isCyberbullying: boolean;
    confidence: number;
    severity: number; // 0-1 scale
    riskLevel: number; // 0-100
    probabilities: number[];
    processingTime: number;
}

/**
 * Load vocabulary and create tokenizer
 */
async function loadTokenizer(): Promise<BERTTokenizer> {
    if (tokenizerInstance) {
        return tokenizerInstance;
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

        // Verify vocab size
        const vocabLines = vocabText.trim().split('\n');
        console.log('[BERT Detector] Vocab loaded: ' + vocabLines.length + ' tokens');
        
        if (vocabLines.length < 1000) {
            console.error('[BERT Detector] WARNING: Vocab size too small (' + vocabLines.length + ' tokens). Expected ~30,000 for BERT.');
            throw new Error('Vocabulary file appears corrupted or incomplete');
        }
        
        // Create tokenizer with proper config
        tokenizerInstance = new BERTTokenizer(vocabText, {
            doLowerCase: true,
            maxLength: MAX_SEQ_LENGTH,
            padTokenId: 0,
            clsTokenId: 101,
            sepTokenId: 102,
            unkTokenId: 100,
        });

        console.log('[BERT Detector] ✓ Tokenizer initialized successfully with ' + vocabLines.length + ' vocab tokens');
        return tokenizerInstance;
    } catch (error) {
        console.error('[BERT Detector] Error loading tokenizer:', error);
        throw error;
    }
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
            console.log('[BERT Detector] Loading tokenizer...');
            await loadTokenizer();
            console.log('[BERT Detector] Tokenizer loaded successfully');

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
                console.log('[BERT Detector] Loading model from assets...');
                
                // Try multiple loading methods for compatibility
                let model;
                
                // Method 1: Direct require() - works if plugin configured correctly
                try {
                    const modelSource = require('../assets/models/cyberbully_model.tflite');
                    console.log('[BERT Detector] Method 1: require() - Source type:', typeof modelSource);
                    console.log('[BERT Detector] Method 1: require() - Source value:', modelSource);
                    
                    model = await loadTensorflowModelFunc(modelSource);
                    console.log('[BERT Detector] ✓ Method 1 succeeded: Direct require()');
                } catch (method1Error) {
                    console.warn('[BERT Detector] ✗ Method 1 failed:', (method1Error as Error).message);
                    
                    // Method 2: Use Expo Asset API to get file URI
                    try {
                        console.log('[BERT Detector] Method 2: Trying Expo Asset API...');
                        const modelAsset = Asset.fromModule(require('../assets/models/cyberbully_model.tflite'));
                        await modelAsset.downloadAsync();
                        const modelUri = modelAsset.localUri || modelAsset.uri;
                        console.log('[BERT Detector] Method 2: Asset URI:', modelUri);
                        
                        // TFLite might accept { url: string } format
                        model = await loadTensorflowModelFunc({ url: modelUri });
                        console.log('[BERT Detector] ✓ Method 2 succeeded: Expo Asset API');
                    } catch (method2Error) {
                        console.error('[BERT Detector] ✗ Method 2 failed:', (method2Error as Error).message);
                        throw new Error('All model loading methods failed. Check that react-native-fast-tflite plugin is properly configured.');
                    }
                }

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
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[BERT Detector] ▶ analyzeText() called');
        console.log('[BERT Detector] Input text: "' + text + '"');
        console.log('[BERT Detector] Input length: ' + text.length + ' chars');
        console.log('[BERT Detector] Model loaded: ' + this.modelLoaded);
        
        if (!this.modelLoaded) {
            console.log('[BERT Detector] Model not loaded, attempting to initialize...');
            await this.initialize();
            console.log('[BERT Detector] After initialization, model loaded: ' + this.modelLoaded);
        }

        if (!text || text.trim().length === 0) {
            console.log('[BERT Detector] Empty input, returning default result');
            return this.getDefaultResult();
        }

        // Preprocess text to match training data format
        // Most BERT cyberbullying models are trained on lowercase text
        const processedText = text.toLowerCase().trim();
        console.log('[BERT Detector] Preprocessed: "' + processedText + '"');

        const startTime = Date.now();

        try {
            // Ensure tokenizer is loaded
            if (!tokenizerInstance) {
                console.error('[BERT Detector] Tokenizer not loaded');
                throw new Error('Tokenizer not loaded');
            }

            if (!modelInstance) {
                console.error('[BERT Detector] Model instance not available');
                console.error('[BERT Detector] Model loaded flag:', this.modelLoaded);
                throw new Error('Model not loaded');
            }

            console.log('[BERT Detector] ━━ STEP 1: TOKENIZATION ━━');
            console.log('[BERT Detector] Tokenizing: "' + processedText.substring(0, 100) + (processedText.length > 100 ? '...' : '') + '"');

            // Tokenize input text using proper BERT tokenizer (use processed text)
            const { inputIds, attentionMask, tokens } = tokenizerInstance.encode(processedText);

            // Debugging: show tokenization output
            console.log('[BERT Detector] ✓ Tokenization complete');
            console.log('[BERT Detector] Total tokens: ' + tokens.length);
            console.log('[BERT Detector] First 20 tokens: ' + JSON.stringify(tokens.slice(0, 20)));
            console.log('[BERT Detector] First 20 token IDs: ' + JSON.stringify(inputIds.slice(0, 20)));

            console.log('[BERT Detector] ━━ STEP 2: MODEL INFERENCE ━━');
            console.log('[BERT Detector] Input shape: [1, ' + inputIds.length + ']');
            console.log('[BERT Detector] Attention mask active tokens: ' + attentionMask.reduce((a,b)=>a+b,0));
            
            // CRITICAL FIX: TFLite expects Float32Array or Int32Array, NOT nested arrays
            // Create properly typed arrays for TFLite model
            const inputIdsTyped = new Int32Array(inputIds);
            const attentionMaskTyped = new Int32Array(attentionMask);
            
            console.log('[BERT Detector] Input IDs type: ' + inputIdsTyped.constructor.name);
            console.log('[BERT Detector] Attention mask type: ' + attentionMaskTyped.constructor.name);
            console.log('[BERT Detector] Running model inference...');
            
            const inferenceStart = Date.now();
            // Run inference with typed arrays (not nested arrays)
            const outputs = await modelInstance.run([inputIdsTyped, attentionMaskTyped]);
            const inferenceTime = Date.now() - inferenceStart;
            console.log('[BERT Detector] ✓ Inference completed in ' + inferenceTime + 'ms');

            // Extract logits
            const logits = Array.isArray(outputs[0][0])
                ? outputs[0][0]
                : Array.from(outputs[0] as Float32Array);

            console.log('[BERT Detector] ━━ STEP 3: OUTPUT PROCESSING ━━');
            console.log('[BERT Detector] Raw logits: ' + JSON.stringify(logits));
            console.log('[BERT Detector] Logit[0] (class 0): ' + logits[0].toFixed(4));
            console.log('[BERT Detector] Logit[1] (class 1): ' + logits[1].toFixed(4));
            
            // Extra debug: if logits are all near-equal or extremely small/large, log a warning
            try {
                const maxLog = Math.max(...logits);
                const minLog = Math.min(...logits);
                const range = Math.abs(maxLog - minLog);
                console.log('[BERT Detector] Logit range: ' + range.toFixed(4));
                
                if (range < 0.01) {
                    console.warn('[BERT Detector] ⚠️ WARNING: Logits have near-zero range (' + range.toFixed(6) + ')');
                    console.warn('[BERT Detector] This suggests model may not be working correctly');
                }
            } catch (e) {
                console.error('[BERT Detector] Error checking logit range:', e);
            }

            // Calculate probabilities
            const probabilities = softmax(logits);
            console.log('[BERT Detector] Probabilities after softmax: ' + JSON.stringify(probabilities.map(p => p.toFixed(4))));
            console.log('[BERT Detector] P(class 0): ' + (probabilities[0] * 100).toFixed(2) + '%');
            console.log('[BERT Detector] P(class 1): ' + (probabilities[1] * 100).toFixed(2) + '%');

            // IMPORTANT: Label encoding detection
            // Some models use: [0=safe, 1=bullying] (USE_REVERSED_LABELS = false)
            // Other models use: [0=bullying, 1=safe] (USE_REVERSED_LABELS = true)
            
            // Determine bullying probability based on label encoding
            const bullyingProbability = USE_REVERSED_LABELS ? probabilities[0] : probabilities[1];
            const safeProbability = USE_REVERSED_LABELS ? probabilities[1] : probabilities[0];
            
            // Use lower threshold for more sensitive detection
            const DETECTION_THRESHOLD = 0.35; // Lowered from 0.45 to catch mild insults like "you are a fool"
            const isCyberbullying = bullyingProbability > DETECTION_THRESHOLD;
            
            // Log BOTH interpretations for debugging
            console.log('[BERT Detector] ━━ LABEL INTERPRETATION ━━');
            console.log('[BERT Detector] Current mode: ' + (USE_REVERSED_LABELS ? 'REVERSED (0=bully, 1=safe)' : 'STANDARD (1=bully, 0=safe)'));
            console.log('[BERT Detector] → If STANDARD (current=' + (!USE_REVERSED_LABELS) + '): Bully=' + (probabilities[1]*100).toFixed(2) + '%, Safe=' + (probabilities[0]*100).toFixed(2) + '% → ' + (probabilities[1] > DETECTION_THRESHOLD ? '🚨 CYBERBULLYING' : '✅ SAFE'));
            console.log('[BERT Detector] → If REVERSED (current=' + (USE_REVERSED_LABELS) + '): Bully=' + (probabilities[0]*100).toFixed(2) + '%, Safe=' + (probabilities[1]*100).toFixed(2) + '% → ' + (probabilities[0] > DETECTION_THRESHOLD ? '🚨 CYBERBULLYING' : '✅ SAFE'));
            console.log('[BERT Detector] ━━━━━━━━━━━━━━━━━━━━━━');
            console.log('[BERT Detector] Using: ' + (USE_REVERSED_LABELS ? 'REVERSED' : 'STANDARD') + ' encoding');
            console.log('[BERT Detector] Detection threshold: ' + (DETECTION_THRESHOLD * 100).toFixed(0) + '%');
            console.log('[BERT Detector] Bullying probability: ' + (bullyingProbability * 100).toFixed(2) + '%');
            console.log('[BERT Detector] Safe probability: ' + (safeProbability * 100).toFixed(2) + '%');
            console.log('[BERT Detector] Classification: ' + (isCyberbullying ? '🚨 CYBERBULLYING' : '✅ SAFE') + ' (threshold=' + (DETECTION_THRESHOLD*100).toFixed(0) + '%)');

            // Calculate severity and risk level
            const severity = Math.min(1, Math.max(0, bullyingProbability));
            const riskLevel = Math.round(severity * 100);

            const processingTime = Date.now() - startTime;

            console.log('[BERT Detector] ━━ FINAL RESULT ━━');
            console.log('[BERT Detector] Confidence: ' + ((isCyberbullying ? bullyingProbability : safeProbability) * 100).toFixed(2) + '%');
            console.log('[BERT Detector] Severity: ' + (severity * 100).toFixed(1) + '%');
            console.log('[BERT Detector] Risk Level: ' + riskLevel + '/100');
            console.log('[BERT Detector] Processing time: ' + processingTime + 'ms');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            return {
                isCyberbullying,
                confidence: isCyberbullying ? bullyingProbability : safeProbability,
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
