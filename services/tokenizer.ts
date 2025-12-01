/**
 * BERT WordPiece Tokenizer
 * Implements tokenization for BERT models using vocab.txt
 */

export interface TokenizerConfig {
  doLowerCase: boolean;
  maxLength: number;
  padTokenId: number;
  clsTokenId: number;
  sepTokenId: number;
  unkTokenId: number;
}

export class BERTTokenizer {
  private vocab: Map<string, number>;
  private idToToken: Map<number, string>;
  private config: TokenizerConfig;

  constructor(vocabText: string, config: Partial<TokenizerConfig> = {}) {
    this.config = {
      doLowerCase: true,
      maxLength: 512,
      padTokenId: 0,
      clsTokenId: 101,
      sepTokenId: 102,
      unkTokenId: 100,
      ...config,
    };

    // Build vocab maps
    this.vocab = new Map();
    this.idToToken = new Map();
    
    const lines = vocabText.trim().split('\n');
    lines.forEach((token, index) => {
      this.vocab.set(token, index);
      this.idToToken.set(index, token);
    });
  }

  /**
   * Tokenize text and return input IDs
   */
  encode(text: string): {
    inputIds: number[];
    attentionMask: number[];
  } {
    // Basic cleaning
    let processedText = text.trim();
    if (this.config.doLowerCase) {
      processedText = processedText.toLowerCase();
    }

    // Basic tokenization (split on whitespace and punctuation)
    const tokens = this.basicTokenize(processedText);
    
    // WordPiece tokenization
    const wordPieceTokens: string[] = [];
    for (const token of tokens) {
      const subTokens = this.wordPieceTokenize(token);
      wordPieceTokens.push(...subTokens);
    }

    // Convert tokens to IDs
    let tokenIds = wordPieceTokens.map(token => 
      this.vocab.get(token) ?? this.config.unkTokenId
    );

    // Add special tokens: [CLS] + tokens + [SEP]
    tokenIds = [
      this.config.clsTokenId,
      ...tokenIds,
      this.config.sepTokenId
    ];

    // Truncate if necessary
    if (tokenIds.length > this.config.maxLength) {
      tokenIds = tokenIds.slice(0, this.config.maxLength - 1);
      tokenIds.push(this.config.sepTokenId);
    }

    // Create attention mask (1 for real tokens, 0 for padding)
    const attentionMask = new Array(tokenIds.length).fill(1);

    // Pad to max length
    const paddingLength = this.config.maxLength - tokenIds.length;
    if (paddingLength > 0) {
      tokenIds.push(...new Array(paddingLength).fill(this.config.padTokenId));
      attentionMask.push(...new Array(paddingLength).fill(0));
    }

    return {
      inputIds: tokenIds,
      attentionMask: attentionMask,
    };
  }

  /**
   * Basic tokenization - split on whitespace and punctuation
   */
  private basicTokenize(text: string): string[] {
    // Remove accents and normalize
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Split on whitespace
    const tokens: string[] = [];
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    for (const word of words) {
      // Split on punctuation
      const subTokens = this.splitPunctuation(word);
      tokens.push(...subTokens);
    }
    
    return tokens;
  }

  /**
   * Split punctuation from words
   */
  private splitPunctuation(text: string): string[] {
    const tokens: string[] = [];
    let currentToken = '';
    
    for (const char of text) {
      if (this.isPunctuation(char)) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
        tokens.push(char);
      } else {
        currentToken += char;
      }
    }
    
    if (currentToken) {
      tokens.push(currentToken);
    }
    
    return tokens.filter(t => t.length > 0);
  }

  /**
   * WordPiece tokenization
   */
  private wordPieceTokenize(word: string): string[] {
    if (this.vocab.has(word)) {
      return [word];
    }

    const tokens: string[] = [];
    let start = 0;
    
    while (start < word.length) {
      let end = word.length;
      let foundToken = false;
      
      while (start < end) {
        let substr = word.substring(start, end);
        if (start > 0) {
          substr = '##' + substr;
        }
        
        if (this.vocab.has(substr)) {
          tokens.push(substr);
          start = end;
          foundToken = true;
          break;
        }
        end--;
      }
      
      if (!foundToken) {
        tokens.push('[UNK]');
        break;
      }
    }
    
    return tokens;
  }

  /**
   * Check if character is punctuation
   */
  private isPunctuation(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      (code >= 33 && code <= 47) ||  // !"#$%&'()*+,-./
      (code >= 58 && code <= 64) ||  // :;<=>?@
      (code >= 91 && code <= 96) ||  // [\]^_`
      (code >= 123 && code <= 126)   // {|}~
    );
  }
}
