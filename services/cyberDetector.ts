/**
 * Cyber Detector Service
 * Uses BERT model to detect cyberbullying in text
 */

import { cyberbullyDetector } from './semanticDetector';

export interface AnalysisResult {
  isCyberbullying: boolean;
  riskLevel: number; // 0-100
  confidence: number; // 0-1
  categories: {
    toxicity: number;
    threat: number;
    insult: number;
    identity_hate: number;
  };
}

class CyberDetectorService {
  private modelLoaded = false;

  /**
   * Initialize the detector by loading vocab and model
   */
  async initialize(): Promise<void> {
    if (this.modelLoaded) return;

    try {
      // Load CSV data for semantic detector
      const { CSVLoader } = require('./csvLoader');
      const ngramData = await CSVLoader.loadNGramDict();
      cyberbullyDetector.setCSVData(ngramData);
      console.log(`[CyberDetector] Loaded ${ngramData.size} n-grams into semantic detector`);

      // Model is ready to use with heuristic analysis
      this.modelLoaded = true;
      console.log('Cyber Detector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Cyber Detector:', error);
      throw error;
    }
  }

  /**
   * Analyze text for cyberbullying
   */
  async analyzeText(text: string): Promise<AnalysisResult> {
    if (!this.modelLoaded) {
      await this.initialize();
    }

    if (!text || text.trim().length === 0) {
      return this.getDefaultResult();
    }

    try {
      // FIRST: Use semantic detector for context-aware detection
      const semanticResult = cyberbullyDetector.classify(text);
      console.log('[CyberDetector] Semantic result:', semanticResult);

      // If semantic detector found cyberbullying, boost the scores
      let semanticBoost = 0;
      if (semanticResult.label === 'CYBERBULLY') {
        semanticBoost = semanticResult.score;
        console.log('[CyberDetector] Semantic boost:', semanticBoost);
      }

      // Perform heuristic analysis based on keywords and patterns
      const analysis = this.heuristicAnalysis(text.toLowerCase());

      // Apply semantic boost to categories
      if (semanticBoost > 0) {
        // Determine which category to boost based on semantic matches
        const hasExclusion = semanticResult.semanticMatches.some(m => m.includes('exclusion') || m.includes('dismissive'));
        const hasWorthAttack = semanticResult.semanticMatches.some(m => m.includes('worth') || m.includes('existential'));
        const hasThreat = semanticResult.semanticMatches.some(m => 
          m.includes('threat') || m.includes('violence') || m.includes('death') || 
          m.includes('harm') || m.includes('weapon') || m.includes('CRITICAL')
        );
        const hasShaming = semanticResult.semanticMatches.some(m => m.includes('shaming') || m.includes('embarrass'));

        if (hasThreat) {
          // CRITICAL: Boost threat category significantly for violence/death threats
          analysis.threat = Math.min(1, analysis.threat + semanticBoost * 0.9);
          analysis.toxicity = Math.min(1, analysis.toxicity + semanticBoost * 0.7);
        }
        
        if (hasExclusion || hasWorthAttack) {
          // Boost insult/toxicity for exclusion and worth attacks
          analysis.insult = Math.min(1, analysis.insult + semanticBoost * 0.6);
          analysis.toxicity = Math.min(1, analysis.toxicity + semanticBoost * 0.5);
        }
        
        if (hasShaming) {
          // Boost insult for shaming attacks
          analysis.insult = Math.min(1, analysis.insult + semanticBoost * 0.65);
          analysis.toxicity = Math.min(1, analysis.toxicity + semanticBoost * 0.4);
        }

        // Always boost toxicity for any semantic match
        analysis.toxicity = Math.min(1, analysis.toxicity + semanticBoost * 0.4);

        console.log('[CyberDetector] Boosted analysis:', analysis);
      }

      // Calculate overall risk level (0-100)
      const maxCategory = Math.max(
        analysis.toxicity,
        analysis.threat,
        analysis.insult,
        analysis.identity_hate
      );

      // Calculate average of all categories for better accuracy
      const avgScore = (analysis.toxicity + analysis.threat + analysis.insult + analysis.identity_hate) / 4;

      // Weighted risk calculation with proportional semantic boost
      // Reduce semantic boost for lower scores to prevent mild cases from being over-flagged
      const semanticBoostMultiplier = semanticBoost > 0.7 ? 0.2 : (semanticBoost > 0.4 ? 0.15 : 0.1);
      const weightedRisk = (maxCategory * 0.7) + (avgScore * 0.3) + (semanticBoost * semanticBoostMultiplier);
      const riskLevel = Math.min(100, Math.round(weightedRisk * 100));
      const isCyberbullying = riskLevel > 50 || semanticBoost > 0.5; // Raised threshold to reduce false positives

      // Confidence calculation based on detection strength
      let confidence = 0;
      if (isCyberbullying) {
        // Higher confidence when multiple categories are triggered
        const activeCategoriesCount = [
          analysis.toxicity > 0.1,
          analysis.threat > 0.1,
          analysis.insult > 0.1,
          analysis.identity_hate > 0.1
        ].filter(Boolean).length;

        // Base confidence on max score, boost for multiple categories
        confidence = Math.min(0.98, maxCategory * 0.85 + (activeCategoriesCount * 0.05));
      } else {
        // High confidence for clearly safe content
        confidence = maxCategory < 0.05 ? 0.95 : 0.85 - (maxCategory * 0.5);
      }

      return {
        isCyberbullying,
        riskLevel,
        confidence,
        categories: analysis,
      };
    } catch (error) {
      console.error('Analysis failed:', error);
      return this.getDefaultResult();
    }
  }

  /**
   * Heuristic analysis based on keyword patterns
   * Enhanced with weighted scoring and context analysis
   * Updated to match semantic detector patterns
   */
  private heuristicAnalysis(text: string): {
    toxicity: number;
    threat: number;
    insult: number;
    identity_hate: number;
  } {
    const lowerText = text.toLowerCase();
    const result = {
      toxicity: 0,
      threat: 0,
      insult: 0,
      identity_hate: 0,
    };

    // CRITICAL THREATS - Death & Violence (weight: 0.50 - HIGHEST)
    const criticalThreats = [
      'i will kill you', 'i\'ll kill you', 'gonna kill you', 'going to kill you',
      'i will beat you', 'i\'ll beat you', 'gonna beat you',
      'i will hurt you', 'i\'ll hurt you', 'gonna hurt you',
      'i will stab you', 'i\'ll stab you', 'gonna stab you',
      'i will shoot you', 'i\'ll shoot you', 'gonna shoot you',
      'i will attack you', 'i\'ll attack you', 'gonna attack you',
      'watch your back', 'you\'re dead', 'you are dead', 'youre dead',
      'i\'ll find you', 'gonna get you', 'i\'m gonna get you'
    ];

    // CRITICAL - Self-harm encouragement (weight: 0.50)
    const selfHarmThreats = [
      'kill yourself', 'go kill yourself', 'kys', 'k y s',
      'go suicide', 'commit suicide', 'do suicide',
      'you should die', 'go die', 'just die',
      'end your life', 'end it all', 'kill urself',
      'better off dead', 'nobody would miss you', 'no one would care if you died'
    ];

    // High-severity toxicity keywords (weight: 0.35)
    const highToxicKeywords = [
      'everyone hates you', 'nobody likes you',
      'waste of space', 'worthless piece', 'good for nothing',
      'worst mistake', 'world would be better without you',
      'your existence is burden', 'you are a burden', 'you are burden',
      'your brain is empty', 'empty as your brain',
      'everyone voted that', 'shouldn\'t be part',
      'no good', 'not good', 'better off without',
      'don\'t deserve', 'do not deserve', 'deserve to die'
    ];

    // Medium-severity toxicity keywords (weight: 0.25)
    const mediumToxicKeywords = [
      'hate you', 'stupid', 'idiot', 'dumb', 'shut up', 'loser',
      'pathetic', 'worthless', 'disgusting', 'trash', 'garbage',
      'you are embarrassing', 'you are pathetic', 'you are disgusting',
      'embarrassment', 'disgrace', 'disappointment', 'failure',
      'moron', 'screw you', 'awful', 'horrible', 'fool',
      'incompetent', 'useless', 'laughs at you', 'mock you'
    ];

    // Low-severity toxicity keywords (weight: 0.15)
    const lowToxicKeywords = [
      'suck', 'terrible', 'annoying', 'gross', 'creep', 'weirdo',
      'psycho', 'crazy', 'insane', 'lame', 'boring'
    ];

    // High-severity threat keywords (weight: 0.40)
    const highThreatKeywords = [
      'murder you', 'bomb you', 'hunt you down',
      'hurt you bad', 'make you pay', 'you will die',
      'gonna die', 'going to die', 'you are going to die',
      'end you', 'destroy you', 'kill you'
    ];

    // Medium-severity threat keywords (weight: 0.30)
    const mediumThreatKeywords = [
      'kill', 'hurt', 'attack', 'destroy', 'beat you up', 'fight',
      'violence', 'harm', 'threat', 'stab', 'punch', 'slap', 'kick',
      'shoot', 'slash', 'threatening', 'regret', 'suffer'
    ];

    // Low-severity threat keywords (weight: 0.20)
    const lowThreatKeywords = [
      'beat', 'hit', 'smash', 'crush', 'break', 'pain'
    ];

    // High-severity insult keywords (weight: 0.25)
    const highInsultKeywords = [
      'nobody', 'nothing', 'failure', 'worthless', 'useless',
      'waste of life', 'mistake', 'embarrassment', 'disgrace',
      'you don\'t belong', 'nobody wants you', 'everyone voted you out',
      'your presence makes everything worse'
    ];

    // Medium-severity insult keywords (weight: 0.18)
    const mediumInsultKeywords = [
      'ugly', 'fat', 'stupid', 'loser', 'weak', 'pathetic',
      'freak', 'disgusting', 'repulsive', 'gross person'
    ];

    // Low-severity insult keywords (weight: 0.12)
    const lowInsultKeywords = [
      'lame', 'nerd', 'geek', 'dork', 'weirdo', 'awkward',
      'embarrassing', 'shameful', 'ridiculous', 'joke', 'silly',
      'absurd', 'nonsense', 'laughable', 'pitiful', 'sad'
    ];

    // Hate speech keywords (weight: 0.45)
    const hateKeywords = [
      'racist', 'sexist', 'homophobic', 'xenophobic', 'bigot',
      'discrimination', 'slur', 'prejudice', 'hate crime',
      'intolerant', 'nazi', 'fascist', 'supremacist'
    ];

    // Enhanced cyberbullying patterns
    const bullyingPatterns = [
      /no one likes you/i,
      /everyone hates you/i,
      /kill yourself/i,
      /you should die/i,
      /go die/i,
      /nobody cares/i,
      /you('re| are) nothing/i,
      /waste of space/i,
      /attention seeking/i,
      /pathetic loser/i,
      /you('re| are) disgusting/i,
      /nobody wants you/i,
      /you('re| are) worthless/i,
      /your existence is/i,
      /empty as your brain/i,
      /everyone voted/i,
      /laughs at you/i
    ];

    // Calculate weighted scores
    let toxicScore = 0;
    let threatScore = 0;
    let insultScore = 0;
    let hateScore = 0;

    // CRITICAL THREATS - Maximum impact (both threat AND toxicity)
    criticalThreats.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        threatScore += 0.50;
        toxicScore += 0.40;
      }
    });

    selfHarmThreats.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        threatScore += 0.50;
        toxicScore += 0.45;
      }
    });

    // Count high-severity matches
    highToxicKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) toxicScore += 0.35;
    });

    mediumToxicKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) toxicScore += 0.25;
    });

    lowToxicKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) toxicScore += 0.15;
    });

    // Threat keywords
    highThreatKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) threatScore += 0.40;
    });

    mediumThreatKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) threatScore += 0.30;
    });

    lowThreatKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) threatScore += 0.20;
    });

    // Insult keywords
    highInsultKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) insultScore += 0.25;
    });

    mediumInsultKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) insultScore += 0.18;
    });

    lowInsultKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) insultScore += 0.12;
    });

    // Hate keywords
    hateKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) hateScore += 0.45;
    });

    // Pattern matching (adds significant weight)
    let patternMatches = 0;
    bullyingPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        patternMatches++;
        toxicScore += 0.30;
        insultScore += 0.25;
      }
    });

    // Calculate base scores
    result.toxicity = Math.min(1, toxicScore);
    result.threat = Math.min(1, threatScore);
    result.insult = Math.min(1, insultScore);
    result.identity_hate = Math.min(1, hateScore);

    // Context-based boosters
    const textLength = text.length;

    // Boost scores for aggressive punctuation
    const aggressivePunctuation = (text.match(/!{2,}/g) || []).length;
    if (aggressivePunctuation > 0) {
      result.toxicity = Math.min(1, result.toxicity + 0.10);
      result.threat = Math.min(1, result.threat + 0.10);
    }

    // Boost scores for ALL CAPS (but only if significant text)
    if (textLength > 10) {
      const capsRatio = (text.match(/[A-Z]/g) || []).length / textLength;
      if (capsRatio > 0.6) {
        result.toxicity = Math.min(1, result.toxicity + 0.15);
        result.threat = Math.min(1, result.threat + 0.12);
      }
    }

    // Boost scores for repeated characters (e.g., "sooooo stupid")
    const repeatedChars = (text.match(/(.)\1{3,}/g) || []).length;
    if (repeatedChars > 0) {
      result.toxicity = Math.min(1, result.toxicity + 0.08);
    }

    // Check for negative emoticons
    const negativeEmoticons = [':@', '>:(', 'D:<', '>:[', '>:()', 'ò_ó'];
    let emoticonCount = 0;
    negativeEmoticons.forEach(emoticon => {
      if (text.includes(emoticon)) emoticonCount++;
    });
    if (emoticonCount > 0) {
      result.toxicity = Math.min(1, result.toxicity + 0.06);
    }

    // Multiple category detection boost (indicates serious cyberbullying)
    const activeCategories = [
      result.toxicity > 0.2,
      result.threat > 0.2,
      result.insult > 0.2,
      result.identity_hate > 0.2
    ].filter(Boolean).length;

    if (activeCategories >= 2) {
      // Boost all categories slightly when multiple are present
      result.toxicity = Math.min(1, result.toxicity * 1.15);
      result.threat = Math.min(1, result.threat * 1.15);
      result.insult = Math.min(1, result.insult * 1.15);
      result.identity_hate = Math.min(1, result.identity_hate * 1.15);
    }

    return result;
  }

  /**
   * Get default result for empty or invalid input
   */
  private getDefaultResult(): AnalysisResult {
    return {
      isCyberbullying: false,
      riskLevel: 0,
      confidence: 0,
      categories: {
        toxicity: 0,
        threat: 0,
        insult: 0,
        identity_hate: 0,
      },
    };
  }

  /**
   * Get risk status text based on risk level
   */
  getRiskStatus(riskLevel: number): {
    text: string;
    severity: 'low' | 'medium' | 'high';
  } {
    if (riskLevel <= 33) {
      return { text: 'Low Risk', severity: 'low' };
    } else if (riskLevel <= 66) {
      return { text: 'Caution', severity: 'medium' };
    } else {
      return { text: 'Danger', severity: 'high' };
    }
  }

  /**
   * Get dominant category from analysis
   */
  getDominantCategory(categories: AnalysisResult['categories']): string {
    const entries = Object.entries(categories);
    const maxEntry = entries.reduce((max, entry) =>
      entry[1] > max[1] ? entry : max
    );

    if (maxEntry[1] === 0) return 'None';

    const categoryNames: Record<string, string> = {
      toxicity: 'Toxic Language',
      threat: 'Threatening',
      insult: 'Insulting',
      identity_hate: 'Hate Speech',
    };

    return categoryNames[maxEntry[0]] || 'Unknown';
  }
}

// Export singleton instance
export const cyberDetector = new CyberDetectorService();
