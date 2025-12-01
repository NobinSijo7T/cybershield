/**
 * Text Preprocessing Module for Cyberbullying Detection
 * Handles text normalization, cleaning, and feature extraction
 */

export interface PreprocessedText {
    original: string;
    cleaned: string;
    normalized: string;
    tokens: string[];
    ngrams: string[];
    features: {
        hasNegation: boolean;
        hasIntensifiers: boolean;
        hasPersonalAttack: boolean;
        hasExistentialThreat: boolean;
        toxicityScore: number;
    };
}

export class TextPreprocessor {
    // Negation words that intensify negativity
    private static readonly NEGATIONS = [
        'no', 'not', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor',
        'none', 'no one', 'hardly', 'barely', 'scarcely'
    ];

    // Intensifiers that amplify sentiment
    private static readonly INTENSIFIERS = [
        'very', 'extremely', 'absolutely', 'totally', 'completely', 'utterly',
        'so', 'really', 'fucking', 'damn', 'hell', 'shit'
    ];

    // Personal attack indicators
    private static readonly PERSONAL_ATTACKS = [
        'you are', 'you\'re', 'ur', 'u r', 'u are', 'you', 'your'
    ];

    // Existential threat patterns (attacks on someone's worth/existence)
    private static readonly EXISTENTIAL_PATTERNS = [
        'no good', 'not good', 'worthless', 'useless', 'waste', 'mistake',
        'shouldn\'t exist', 'shouldn\'t be', 'better off without', 'world without',
        'no use', 'not worth', 'don\'t deserve', 'deserve to die', 'should die'
    ];

    /**
     * Main preprocessing function
     */
    static preprocess(text: string): PreprocessedText {
        const original = text;

        // Step 1: Clean the text
        const cleaned = this.cleanText(text);

        // Step 2: Normalize
        const normalized = this.normalizeText(cleaned);

        // Step 3: Tokenize
        const tokens = this.tokenize(normalized);

        // Step 4: Generate n-grams
        const ngrams = this.generateNGrams(tokens, 2, 3);

        // Step 5: Extract features
        const features = this.extractFeatures(normalized, tokens, ngrams);

        return {
            original,
            cleaned,
            normalized,
            tokens,
            ngrams,
            features
        };
    }

    /**
     * Clean text - remove URLs, mentions, special characters
     */
    private static cleanText(text: string): string {
        let cleaned = text;

        // Remove URLs
        cleaned = cleaned.replace(/https?:\/\/\S+/gi, '');

        // Remove email addresses
        cleaned = cleaned.replace(/\S+@\S+\.\S+/g, '');

        // Remove @mentions
        cleaned = cleaned.replace(/@\w+/g, '');

        // Remove hashtags but keep the text
        cleaned = cleaned.replace(/#(\w+)/g, '$1');

        // Remove extra whitespace
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        return cleaned;
    }

    /**
     * Normalize text - lowercase, handle contractions, etc.
     */
    private static normalizeText(text: string): string {
        let normalized = text.toLowerCase();

        // Expand common contractions
        const contractions: Record<string, string> = {
            "won't": "will not",
            "can't": "cannot",
            "n't": " not",
            "'re": " are",
            "'ve": " have",
            "'ll": " will",
            "'d": " would",
            "'m": " am",
            "u r": "you are",
            "ur": "you are",
            "u": "you"
        };

        for (const [contraction, expansion] of Object.entries(contractions)) {
            normalized = normalized.replace(new RegExp(contraction, 'gi'), expansion);
        }

        // Handle repeated characters (e.g., "sooooo" -> "so")
        normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');

        return normalized;
    }

    /**
     * Tokenize text into words
     */
    private static tokenize(text: string): string[] {
        // Split on whitespace and punctuation, but keep words
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0);
    }

    /**
     * Generate n-grams (2-grams and 3-grams)
     */
    private static generateNGrams(tokens: string[], minN: number, maxN: number): string[] {
        const ngrams: string[] = [];

        for (let n = minN; n <= maxN; n++) {
            for (let i = 0; i <= tokens.length - n; i++) {
                const ngram = tokens.slice(i, i + n).join(' ');
                ngrams.push(ngram);
            }
        }

        return ngrams;
    }

    /**
     * Extract linguistic features
     */
    private static extractFeatures(
        normalized: string,
        tokens: string[],
        ngrams: string[]
    ): PreprocessedText['features'] {
        // Check for negation
        const hasNegation = this.NEGATIONS.some(neg =>
            normalized.includes(neg)
        );

        // Check for intensifiers
        const hasIntensifiers = this.INTENSIFIERS.some(int =>
            normalized.includes(int)
        );

        // Check for personal attacks
        const hasPersonalAttack = this.PERSONAL_ATTACKS.some(attack =>
            normalized.includes(attack)
        );

        // Check for existential threats
        const hasExistentialThreat = this.EXISTENTIAL_PATTERNS.some(pattern =>
            normalized.includes(pattern)
        );

        // Calculate toxicity score based on features
        let toxicityScore = 0;
        if (hasNegation && hasPersonalAttack) toxicityScore += 0.3;
        if (hasExistentialThreat) toxicityScore += 0.4;
        if (hasIntensifiers && hasPersonalAttack) toxicityScore += 0.2;
        if (hasNegation && hasExistentialThreat) toxicityScore += 0.3;

        return {
            hasNegation,
            hasIntensifiers,
            hasPersonalAttack,
            hasExistentialThreat,
            toxicityScore: Math.min(1, toxicityScore)
        };
    }

    /**
     * Check if text contains specific pattern
     */
    static containsPattern(text: string, pattern: string): boolean {
        const normalized = text.toLowerCase();
        return normalized.includes(pattern.toLowerCase());
    }

    /**
     * Calculate similarity between two texts
     */
    static calculateSimilarity(text1: string, text2: string): number {
        const tokens1 = new Set(this.tokenize(text1.toLowerCase()));
        const tokens2 = new Set(this.tokenize(text2.toLowerCase()));

        const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
        const union = new Set([...tokens1, ...tokens2]);

        return intersection.size / union.size;
    }
}
