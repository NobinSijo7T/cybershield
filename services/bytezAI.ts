import { WordAnalysis } from './semanticDetector';

export interface RecommendationAnalysis {
  recommendation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  wordAnalysis: WordAnalysis[];
  detectedCategories: string[];
}

export class BytezAI {
  private cache: Map<string, { result: RecommendationAnalysis; timestamp: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Local model: Word categorization sets
  private criticalThreatWords = new Set([
    "kill", "die", "suicide", "murder", "dead", "death", "stab", "shoot", "slash",
    "bleach", "poison", "traffic"
  ]);

  private violenceWords = new Set([
    "beat", "hurt", "harm", "attack", "punch", "kick", "destroy", "violence", "threat"
  ]);

  private worthAttackWords = new Set([
    "waste", "burden", "useless", "worthless", "mistake", "disappear", "trash", "unwanted",
    "happier", "genius"
  ]);

  private insultWords = new Set([
    "stupid", "dumb", "idiot", "loser", "pathetic", "failure", "incompetent", "nobody"
  ]);

  private shamingWords = new Set([
    "embarrassment", "embarrassing", "disgrace", "disgusting", "shameful", "disappointment",
    "revolting", "repulsive", "annoying", "irritating", "pest", "nuisance", "ruining"
  ]);

  private existenceWords = new Set([
    "existence", "problem", "regret", "shouldnt", "empty", "meaningless", "pointless", "broken",
    "invisible", "belong", "talking", "replied"
  ]);

  private mockeryWords = new Set([
    "laughs", "mock", "joke", "ridicule", "humiliate", "laughing", "hint"
  ]);

  private sexualHarassmentWords = new Set([
    "slut", "whore", "prostitute", "hoe", "thot", "rape", "raped", "violated", "nudes", "pics"
  ]);

  private dehumanizationWords = new Set([
    "trash", "garbage", "filth", "scum", "dirt", "nothing", "nobody", "insignificant", "object"
  ]);

  private doxingWords = new Set([
    "address", "location", "school", "dox", "expose", "leak", "reveal", "phone", "info"
  ]);

  private comparativeInsultWords = new Set([
    "worst", "dumbest", "ugliest", "stupidest", "better", "smarter", "faster"
  ]);

  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate recommendation based on word-by-word analysis
   * This is the ONLY function BytezAI now performs
   */
  async generateRecommendation(text: string): Promise<RecommendationAnalysis> {
    try {
      console.log('[BytezAI] Generating recommendation for text:', text);

      // Check cache first
      const cacheKey = text.toLowerCase().trim();
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('[BytezAI] Returning cached recommendation');
        return cached.result;
      }

      // Perform word-by-word analysis
      const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      const wordAnalysis = this.analyzeWords(words);

      // Determine severity based on word analysis
      const severity = this.calculateSeverity(wordAnalysis);

      // Extract detected categories
      const detectedCategories = this.extractCategories(wordAnalysis);

      // Generate recommendation based on severity
      const recommendation = this.getRecommendation(severity, detectedCategories);

      const result: RecommendationAnalysis = {
        recommendation,
        severity,
        wordAnalysis,
        detectedCategories
      };

      // Cache the result
      this.cache.set(cacheKey, { result, timestamp: Date.now() });

      return result;

    } catch (err) {
      console.error('[BytezAI] Recommendation generation error:', err);
      return this.getDefaultRecommendation();
    }
  }

  /**
   * Analyze each word individually
   */
  private analyzeWords(words: string[]): WordAnalysis[] {
    const analyses: WordAnalysis[] = [];

    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (!cleanWord) continue;

      const analysis: WordAnalysis = {
        word: cleanWord,
        isToxic: false,
        severity: "safe",
        categories: [],
        reasons: []
      };

      // Check against categorized word sets
      if (this.criticalThreatWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "critical";
        analysis.categories.push("threat", "violence");
        analysis.reasons.push(`Critical threat word: "${cleanWord}"`);
      } else if (this.violenceWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "high";
        analysis.categories.push("violence", "threat");
        analysis.reasons.push(`Violence-related: "${cleanWord}"`);
      } else if (this.worthAttackWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "high";
        analysis.categories.push("insult", "toxicity");
        analysis.reasons.push(`Personal worth attack: "${cleanWord}"`);
      } else if (this.shamingWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "medium";
        analysis.categories.push("insult", "toxicity");
        analysis.reasons.push(`Shaming language: "${cleanWord}"`);
      } else if (this.insultWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "medium";
        analysis.categories.push("insult");
        analysis.reasons.push(`Insulting term: "${cleanWord}"`);
      } else if (this.existenceWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "high";
        analysis.categories.push("toxicity", "insult");
        analysis.reasons.push(`Existence attack: "${cleanWord}"`);
      } else if (this.mockeryWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "medium";
        analysis.categories.push("toxicity");
        analysis.reasons.push(`Mockery/ridicule: "${cleanWord}"`);
      } else if (this.sexualHarassmentWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "critical";
        analysis.categories.push("sexual_harassment", "threat");
        analysis.reasons.push(`Sexual harassment term: "${cleanWord}"`);
      } else if (this.dehumanizationWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "high";
        analysis.categories.push("insult", "toxicity");
        analysis.reasons.push(`Dehumanizing term: "${cleanWord}"`);
      } else if (this.doxingWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "critical";
        analysis.categories.push("threat", "privacy_violation");
        analysis.reasons.push(`Doxing-related: "${cleanWord}"`);
      } else if (this.comparativeInsultWords.has(cleanWord)) {
        analysis.isToxic = true;
        analysis.severity = "medium";
        analysis.categories.push("insult");
        analysis.reasons.push(`Comparative insult: "${cleanWord}"`);
      }

      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * Calculate severity based on word analysis
   */
  private calculateSeverity(wordAnalysis: WordAnalysis[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = wordAnalysis.filter(w => w.severity === "critical").length;
    const highCount = wordAnalysis.filter(w => w.severity === "high").length;
    const mediumCount = wordAnalysis.filter(w => w.severity === "medium").length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 0) return 'high';
    if (mediumCount >= 2) return 'high';
    if (mediumCount === 1) return 'medium';
    return 'low';
  }

  /**
   * Extract unique categories from word analysis
   */
  private extractCategories(wordAnalysis: WordAnalysis[]): string[] {
    const categories = new Set<string>();
    wordAnalysis.forEach(w => {
      w.categories.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }

  /**
   * Get recommendation based on severity and categories
   */
  private getRecommendation(severity: 'low' | 'medium' | 'high' | 'critical', categories: string[]): string {
    if (severity === 'critical' || severity === 'high') {
      return `WHAT TO DO NEXT:

1. DO NOT RESPOND to this message - engaging often escalates the situation
2. TAKE SCREENSHOTS immediately to preserve evidence with dates/timestamps
3. BLOCK the sender on all platforms where they can contact you
4. REPORT to platform moderators using the reporting feature
5. TELL A TRUSTED ADULT - parent, teacher, counselor, or school administrator
6. If you feel unsafe, contact local authorities or call a crisis hotline
7. DOCUMENT all incidents in a journal with dates and details

Remember: This is NOT your fault. You deserve to feel safe online.`;
    } else if (severity === 'medium') {
      return `WHAT TO DO NEXT:

1. DON'T RESPOND - Bullies want a reaction, don't give them one
2. SCREENSHOT the message in case it escalates
3. BLOCK the sender to prevent further messages
4. REPORT to platform moderators if this continues
5. TALK TO SOMEONE you trust about how this makes you feel
6. Remember: Mean words say more about the sender than about you

One mean message doesn't define you. Stay strong!`;
    } else {
      return `WHAT TO DO NEXT:

1. Be aware of this behavior
2. Consider blocking if it continues
3. Talk to someone if it bothers you
4. Remember: You control who you interact with online`;
    }
  }

  /**
   * Get default recommendation for errors
   */
  private getDefaultRecommendation(): RecommendationAnalysis {
    return {
      recommendation: `WHAT TO DO NEXT:

1. Be aware of this behavior
2. Consider blocking if it continues
3. Talk to someone if it bothers you
4. Remember: You control who you interact with online`,
      severity: 'low',
      wordAnalysis: [],
      detectedCategories: []
    };
  }
}

export const bytezAI = new BytezAI();
