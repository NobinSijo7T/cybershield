/**
 * Enhanced Text Preprocessing with Semantic Analysis
 * Detects subtle cyberbullying through context and meaning
 */

export type ClassificationResult = "CYBERBULLY" | "NO_CYBERBULLY";

export interface WordAnalysis {
    word: string;
    isToxic: boolean;
    severity: "safe" | "low" | "medium" | "high" | "critical";
    categories: string[];
    reasons: string[];
}

export interface ProcessedData {
    original: string;
    normalized: string;
    tokens: string[];
    label: ClassificationResult;
    score: number;
    highSeverity: boolean;
    matchedSignals: string[];
    semanticMatches: string[];
    wordAnalysis?: WordAnalysis[];  // NEW: Word-by-word analysis
}

export interface SemanticPattern {
    pattern: RegExp;
    meaning: string;
    severity: number;
    category: string;
}

export class EnhancedTextPreprocessor {
    // Cache for semantic pattern results (improves performance on repeated texts)
    private patternCache: Map<string, Array<{ pattern: string; meaning: string; severity: number }>> = new Map();
    private readonly MAX_CACHE_SIZE = 1000;

    // Stopwords
    private stopWords: Set<string> = new Set([
        "a", "an", "the", "is", "are", "was", "were",
        "to", "in", "on", "at", "it", "that", "this",
        "of", "for", "with", "and", "or", "as"
    ]);

    // Slang normalization
    private slangMap: Record<string, string> = {
        "u": "you",
        "ur": "you are",
        "r": "are",
        "ya": "you",
        "yu": "you",
        "kys": "kill yourself",
        "stfu": "shut up",
        "gtfo": "get out",
        "lmao": "laughing",
        "lol": "laughing",
        "smh": "shaking my head",
        "ffs": "for sake",
        "wtf": "what",
        "omg": "oh my",
        // Gaming slang
        "noob": "beginner",
        "scrub": "bad player",
        "rekt": "wrecked",
        "dum": "dumb",
        "ez": "easy"
    };

    // Semantic patterns for subtle cyberbullying
    private semanticPatterns: SemanticPattern[] = [
        // CRITICAL THREATS - Physical Violence & Self-Harm (HIGHEST PRIORITY)
        {
            pattern: /\b(i will|i'll|ima|imma|gonna|going to|i'm going to) (kill|murder|end|destroy) (you|u|ur life)\b/i,
            meaning: "CRITICAL: Death threat - direct threat to kill",
            severity: 1.0,
            category: "death_threat"
        },
        {
            pattern: /\b(i will|i'll|ima|imma|gonna|going to) (beat|hurt|harm|attack|hit|punch|kick|stab|shoot|slash) (you|u)\b/i,
            meaning: "CRITICAL: Physical violence threat",
            severity: 0.98,
            category: "violence_threat"
        },
        {
            pattern: /\b(go|going to|gonna|commit|do|just) (suicide|kill yourself|kys|end it|die)\b/i,
            meaning: "CRITICAL: Self-harm/suicide encouragement",
            severity: 1.0,
            category: "self_harm_encouragement"
        },
        {
            pattern: /\b(you|u|you're|ur|youre) (going to|gonna|will|should) (suicide|die|kill yourself|kys|end your life|not exist)\b/i,
            meaning: "CRITICAL: Suicide/death threat or encouragement",
            severity: 1.0,
            category: "death_wish"
        },
        {
            pattern: /\b(you|u) (don't|dont|do not|doesn't|doesnt) deserve (to )?(live|exist|be here|be alive|breathe)\b/i,
            meaning: "CRITICAL: Denying right to exist",
            severity: 0.98,
            category: "existence_denial"
        },
        {
            pattern: /\b(go|just) die\b/i,
            meaning: "CRITICAL: Death wish command",
            severity: 0.95,
            category: "death_wish"
        },
        {
            pattern: /\b(drink|swallow|consume|eat) (bleach|poison|acid|detergent)\b/i,
            meaning: "CRITICAL: Suicide encouragement - toxic substance",
            severity: 1.0,
            category: "self_harm_encouragement"
        },
        {
            pattern: /\bgo (play|run|walk|jump) in (traffic|front of)\b/i,
            meaning: "CRITICAL: Suicide encouragement - play in traffic",
            severity: 0.98,
            category: "self_harm_encouragement"
        },
        {
            pattern: /\b(i'm|i am|we're|we are) (gonna|going to|will) (get|come for|find|hunt) (you|u)\b/i,
            meaning: "CRITICAL: Stalking/hunting threat",
            severity: 0.95,
            category: "stalking_threat"
        },
        {
            pattern: /\b(watch your back|you're dead|you'll regret|i'll make you|you better watch out)\b/i,
            meaning: "CRITICAL: Intimidation threat",
            severity: 0.92,
            category: "intimidation"
        },
        {
            pattern: /\b(i'll|i will) (stab|shoot|cut|slash|choke|strangle|suffocate) (you|u)\b/i,
            meaning: "CRITICAL: Weapon-based violence threat",
            severity: 1.0,
            category: "weapon_threat"
        },
        {
            pattern: /\b(kill|hurt|beat|attack|harm) (yourself|urself|you)\b/i,
            meaning: "CRITICAL: Violence/self-harm command",
            severity: 0.95,
            category: "harm_command"
        },
        {
            pattern: /\b(i|we) (hope|wish) (you|u) (die|get hurt|suffer|rot|burn)\b/i,
            meaning: "CRITICAL: Death/harm wish",
            severity: 0.93,
            category: "death_wish"
        },
        {
            pattern: /\b(nobody|no one) would (miss|care|notice) if (you|u) (died|were gone|disappeared)\b/i,
            meaning: "CRITICAL: Suicide encouragement through isolation",
            severity: 0.98,
            category: "self_harm_encouragement"
        },

        // CONDITIONAL THREATS - If-then violence patterns
        {
            pattern: /\bif (i see|i find|i catch|i get|you) .{0,30}(i will|i'll|ima|gonna) (kill|beat|hurt|attack|destroy|end) (you|u)\b/i,
            meaning: "CRITICAL: Conditional violence threat - if/then pattern",
            severity: 0.96,
            category: "conditional_threat"
        },
        {
            pattern: /\bif (you|u) (don't|dont|do not) .{0,30}(i will|i'll|gonna) (kill|beat|hurt|dox|expose|leak|destroy) (you|u)\b/i,
            meaning: "CRITICAL: Conditional extortion threat",
            severity: 0.98,
            category: "extortion_threat"
        },

        // DOXING & PRIVACY THREATS
        {
            pattern: /\b(i|we) (know|found|have) (where you live|your address|which school|where you go|your phone|your info|your location)\b/i,
            meaning: "CRITICAL: Doxing threat - claiming to have private information",
            severity: 0.95,
            category: "doxing_threat"
        },
        {
            pattern: /\b(i will|i'll|gonna|going to) (dox|expose|leak|share|post|reveal) (you|your info|your address|your photos|your data)\b/i,
            meaning: "CRITICAL: Doxing threat - intent to expose private info",
            severity: 0.97,
            category: "doxing_threat"
        },
        {
            pattern: /\b(send|post|share) (nudes|pics|photos) or (i will|i'll|else)\b/i,
            meaning: "CRITICAL: Sexual extortion threat",
            severity: 1.0,
            category: "sexual_extortion"
        },

        // SEXUAL HARASSMENT & VIOLENCE
        {
            pattern: /\b(i hope|i wish|you should|you gonna) (get |be )?(raped|sexually assaulted|violated)\b/i,
            meaning: "CRITICAL: Sexual violence wish/threat",
            severity: 1.0,
            category: "sexual_violence"
        },
        {
            pattern: /\b(slut|whore|prostitute|hoe|thot)\b/i,
            meaning: "Sexual harassment - gendered slur",
            severity: 0.88,
            category: "sexual_harassment"
        },
        {
            pattern: /\b(send|show|gimme|give me) (nudes|pics|photos|pictures)( of yourself| now)?\b/i,
            meaning: "Sexual harassment - unwanted sexual demand",
            severity: 0.92,
            category: "sexual_harassment"
        },

        // Dismissive/Exclusion patterns
        {
            pattern: /why (are|r) (you|u) even (talking|speaking|here)/i,
            meaning: "Dismissive exclusion - questioning someone's right to speak",
            severity: 0.7,
            category: "exclusion"
        },
        {
            pattern: /who (asked|wants|needs)( for)? (you|u|your)/i,
            meaning: "Dismissive rejection - invalidating someone's input",
            severity: 0.75,
            category: "dismissive"
        },
        {
            pattern: /\bdid (anyone|anybody) ask( you)?\b/i,
            meaning: "Rhetorical dismissal - questioning right to speak",
            severity: 0.73,
            category: "dismissive"
        },
        {
            pattern: /nobody (asked|wants|cares|needs) (you|u|your)/i,
            meaning: "Strong dismissal - complete invalidation",
            severity: 0.85,
            category: "dismissive"
        },
        {
            pattern: /(shut up|be quiet|stop talking)/i,
            meaning: "Silencing attempt",
            severity: 0.6,
            category: "silencing"
        },
        {
            pattern: /go away|leave (us|here)|get (out|lost)/i,
            meaning: "Direct exclusion",
            severity: 0.7,
            category: "exclusion"
        },

        // Questioning worth/belonging
        {
            pattern: /why (do|would) (you|u) even/i,
            meaning: "Questioning someone's actions/worth",
            severity: 0.65,
            category: "worth_attack"
        },
        {
            pattern: /(you|u) (don't|dont|do not) belong/i,
            meaning: "Exclusion - denying belonging",
            severity: 0.8,
            category: "exclusion"
        },
        {
            pattern: /what (are|r) (you|u) doing here/i,
            meaning: "Questioning right to be present",
            severity: 0.7,
            category: "exclusion"
        },

        // Passive-aggressive patterns
        {
            pattern: /(really|seriously)\?+ *(you|u)/i,
            meaning: "Sarcastic disbelief - passive aggression",
            severity: 0.5,
            category: "passive_aggressive"
        },
        {
            pattern: /(you|u) (think|thought) (that|this) (was|is)/i,
            meaning: "Mocking someone's judgment",
            severity: 0.6,
            category: "mocking"
        },
        {
            pattern: /imagine (being|thinking)/i,
            meaning: "Mocking hypothetical",
            severity: 0.55,
            category: "mocking"
        },
        {
            pattern: /(actually|finally) posted (that|this).*brave/i,
            meaning: "Sarcastic praise - passive aggressive",
            severity: 0.6,
            category: "passive_aggressive"
        },
        {
            pattern: /(i['’]d|i would|id) be (so )?ashamed if i (was|were) (you|u)/i,
            meaning: "Shaming - condescension",
            severity: 0.75,
            category: "shaming"
        },
        {
            pattern: /ruin(ed|s)? the (mood|vibe|fun)/i,
            meaning: "Blaming for ruining atmosphere",
            severity: 0.65,
            category: "exclusion"
        },
        {
            pattern: /(funny|hilarious) how (you|u) think (you|u) matter/i,
            meaning: "Minimization of worth",
            severity: 0.8,
            category: "worth_attack"
        },
        {
            pattern: /(seeking|desperate for) attention/i,
            meaning: "Accusation of attention seeking",
            severity: 0.7,
            category: "harassment"
        },
        {
            pattern: /attention seeking/i,
            meaning: "Labeling as attention seeker",
            severity: 0.7,
            category: "harassment"
        },
        {
            pattern: /(keep|start) crying (about it)?/i,
            meaning: "Dismissive mocking of distress",
            severity: 0.75,
            category: "harassment"
        },
        {
            pattern: /cry (more|about it)/i,
            meaning: "Dismissive mocking",
            severity: 0.7,
            category: "harassment"
        },

        // Competence attacks
        {
            pattern: /(you|u) (can't|cant|cannot) even/i,
            meaning: "Competence attack",
            severity: 0.65,
            category: "competence_attack"
        },
        {
            pattern: /(you|u) (don't|dont) (know|understand)/i,
            meaning: "Intelligence dismissal",
            severity: 0.6,
            category: "competence_attack"
        },
        {
            pattern: /\b(you|u|you're|youre|ur) (are|r) (so |really |very |such a |such an )?(stupid|dumb|idiot|moron|retard|retarded|imbecile|fool|foolish)\b/i,
            meaning: "Direct intelligence insult - calling someone stupid/dumb/idiot",
            severity: 0.78,
            category: "intelligence_attack"
        },
        {
            pattern: /\b(you|u) (are|r) (so |really |very )?stupid (that|and)/i,
            meaning: "Stupid declaration with continuation",
            severity: 0.75,
            category: "intelligence_attack"
        },
        {
            pattern: /\b(so|such a|what a|you're a) (stupid|dumb|idiot|moron) (person|kid|boy|girl|guy)\b/i,
            meaning: "Labeling as stupid/dumb person",
            severity: 0.76,
            category: "intelligence_attack"
        },
        {
            pattern: /\b(stop being|quit being|you're being) (so )?(stupid|dumb|idiotic|moronic)\b/i,
            meaning: "Behavioral intelligence attack",
            severity: 0.72,
            category: "intelligence_attack"
        },
        {
            pattern: /\b(you|u) (are|r) (such )?(an? )?(embarrassment|disgrace|disappointment|failure)\b/i,
            meaning: "Identity shaming - labeling as embarrassment/disgrace",
            severity: 0.85,
            category: "shaming"
        },
        {
            pattern: /\bashamed of (you|u)\b/i,
            meaning: "Shaming - expressing shame about person",
            severity: 0.8,
            category: "shaming"
        },
        {
            pattern: /\b(you|u) should be ashamed\b/i,
            meaning: "Direct shame command",
            severity: 0.75,
            category: "shaming"
        },
        {
            pattern: /\b(so|such a|what a) (loser|failure|disappointment)\b/i,
            meaning: "Labeling as loser/failure",
            severity: 0.78,
            category: "shaming"
        },

        // Social rejection
        {
            pattern: /nobody (likes|wants|needs) (you|u)/i,
            meaning: "Social rejection",
            severity: 0.85,
            category: "rejection"
        },
        {
            pattern: /everyone (hates|dislikes|ignores) (you|u)/i,
            meaning: "Universal rejection claim",
            severity: 0.9,
            category: "rejection"
        },
        {
            pattern: /\b(we|everyone|they) (were|was|are) (all )?(happier|better off) (before|without) (you|u)/i,
            meaning: "Social exclusion - claiming group was better without person",
            severity: 0.82,
            category: "exclusion"
        },
        {
            pattern: /\b(everyone|we|they|people) voted (you|u) (out|off|away)/i,
            meaning: "Group voting rejection",
            severity: 0.85,
            category: "exclusion"
        },
        {
            pattern: /\b(everyone|we all|the group|they) (voted|agreed|decided) (that )?(you|u) (shouldn't|shouldnt|should not|cant|cannot) (be|join|stay)/i,
            meaning: "Group exclusion decision - collective rejection",
            severity: 0.88,
            category: "exclusion"
        },
        {
            pattern: /\b(you|u) (shouldn't|shouldnt|should not|dont|can't|cant) be (part of|in|here|with)/i,
            meaning: "Exclusion statement - denying right to participate",
            severity: 0.8,
            category: "exclusion"
        },
        {
            pattern: /\b(everyone|they|people) (laughs|laugh|mock|mocks|is laughing|are laughing) at (you|u)/i,
            meaning: "Social mockery - claiming group ridicule",
            severity: 0.82,
            category: "harassment"
        },
        {
            pattern: /\b(laughs|laughing) at (you|u) behind (your|ur) back/i,
            meaning: "Behind back mockery - secret ridicule claim",
            severity: 0.85,
            category: "harassment"
        },

        // Existence/Visibility attacks
        {
            pattern: /(you|u) (are|r) (invisible|invincible|invicible|nothing)/i,
            meaning: "Denying existence/relevance",
            severity: 0.8,
            category: "exclusion"
        },
        {
            pattern: /(you|u) (don't|dont) (exist|matter)/i,
            meaning: "Denying existence",
            severity: 0.85,
            category: "existential_threat"
        },
        {
            pattern: /like (you|u) (aren't|arent|aint) (even )?there/i,
            meaning: "Treating as invisible",
            severity: 0.75,
            category: "exclusion"
        },

        // Worthlessness
        {
            pattern: /(you|u) (are|r) (no good|not good|useless|worthless|a waste)/i,
            meaning: "Worth attack",
            severity: 0.85,
            category: "worth_attack"
        },
        {
            pattern: /waste of (space|time|air)/i,
            meaning: "Existential dismissal",
            severity: 0.9,
            category: "existential_threat"
        },

        // Existence-based attacks (NEW - catches "your existence is burden")
        {
            pattern: /(your|ur|you are|youre) (very )?existence (is|was) (a )?(burden|waste|mistake|problem|useless)/i,
            meaning: "Existence attack - declaring someone's existence is a burden",
            severity: 0.95,
            category: "existential_threat"
        },
        {
            pattern: /(your|ur) existence (itself )?(is|was|has been) (just )?(burden|waste)/i,
            meaning: "Direct existence burden attack",
            severity: 0.95,
            category: "existential_threat"
        },
        {
            pattern: /\b(your|ur|you)\b.{0,20}\bexistence\b.{0,20}\b(is|was)\b.{0,20}\b(burden|waste|mistake)\b/i,
            meaning: "Personal existence attack with context",
            severity: 0.92,
            category: "existential_threat"
        },
        {
            pattern: /existence (is|was|seems) (a )?(burden|waste|mistake)/i,
            meaning: "Implied existence attack",
            severity: 0.9,
            category: "existential_threat"
        },
        {
            pattern: /\b(you're|youre|you are|ur) (just |such |a total )?(a )?mistake\b/i,
            meaning: "Personal mistake declaration - you are a mistake",
            severity: 0.80,
            category: "existence_attack"
        },
        {
            pattern: /\b(you|u) (are|r) (just |such )?(a )?burden\b(?! on (the|this) (project|team|system|work))/i,
            meaning: "Personal burden declaration",
            severity: 0.85,
            category: "worth_attack"
        },
        {
            pattern: /\b(you|u) (are|r) (just |such )?(a )?(weight|burden) (on|to) (this |the )?(world|society|everyone|people|us)/i,
            meaning: "Weight/burden to world or society - existential attack",
            severity: 0.65,
            category: "existential_threat"
        },
        {
            pattern: /(you|u) (are|r) (just )?(a )?burden (on|to) (me|us|everyone|others|them|people|society)/i,
            meaning: "Burden on people declaration",
            severity: 0.88,
            category: "worth_attack"
        },
        {
            pattern: /(being|existing) (is|was) (a )?burden/i,
            meaning: "Existence as burden statement",
            severity: 0.85,
            category: "existential_threat"
        },
        {
            pattern: /world (would be|is) better (off )?without (you|u)/i,
            meaning: "Existence negation - world better without you",
            severity: 0.95,
            category: "existential_threat"
        },
        {
            pattern: /(everyone|we|people) (would be|are) better (off )?without (you|u)/i,
            meaning: "Social existence negation",
            severity: 0.92,
            category: "existential_threat"
        },
        {
            pattern: /(your|ur) (very )?presence (is|was) (a )?(burden|problem|issue)/i,
            meaning: "Presence attack - similar to existence",
            severity: 0.88,
            category: "exclusion"
        },
        {
            pattern: /\b(your|ur) presence (makes|ruins|destroys) (everything|things|it all)/i,
            meaning: "Presence destruction claim",
            severity: 0.85,
            category: "exclusion"
        },
        {
            pattern: /\bmakes everything (worse|bad|terrible|awful) (for )?(everyone|us|people)/i,
            meaning: "Negative impact claim on group",
            severity: 0.8,
            category: "exclusion"
        },
        {
            pattern: /shouldn'?t (even )?exist/i,
            meaning: "Existence denial",
            severity: 0.92,
            category: "existential_threat"
        },
        {
            pattern: /regret (your|you) (existing|being born)/i,
            meaning: "Existence regret attack",
            severity: 0.9,
            category: "existential_threat"
        },

        // DEHUMANIZATION - Reducing someone to objects/waste
        {
            pattern: /\b(you|u) (are|r) (just )?(a |an )?(piece of )?(trash|garbage|waste|filth|scum|dirt)\b/i,
            meaning: "Dehumanization - comparing to trash/waste",
            severity: 0.88,
            category: "dehumanization"
        },
        {
            pattern: /\b(you|u) (are|r) (such )?(a |an )?(mistake|accident|error|problem)\b/i,
            meaning: "Dehumanization - calling someone a mistake",
            severity: 0.85,
            category: "dehumanization"
        },
        {
            pattern: /\b(you|u) (are|r) (just )?(nothing|nobody|worthless|insignificant)\b/i,
            meaning: "Dehumanization - reducing to nothing",
            severity: 0.83,
            category: "dehumanization"
        },
        {
            pattern: /\b(you|u) look like (a |an )?(trash|garbage|disaster|car crash|train wreck|dumpster|wreck|mess|something .{0,20}threw up)\b/i,
            meaning: "Appearance-based dehumanization - look like trash/disaster",
            severity: 0.82,
            category: "appearance_attack"
        },
        {
            pattern: /\b(you|u) look like (shit|crap|ass|garbage)\b/i,
            meaning: "Crude appearance attack",
            severity: 0.80,
            category: "appearance_attack"
        },

        // COMPARATIVE INFERIORITY - Degrading comparisons
        {
            pattern: /\b(my |a |even a )?(dog|cat|bot|child|baby|toddler|pet) (is |plays |does |performs )?(better|smarter|faster) than (you|u)\b/i,
            meaning: "Comparative inferiority - comparing unfavorably to animals/objects",
            severity: 0.77,
            category: "comparison_attack"
        },
        {
            pattern: /\b(you're|you are|ur) the (worst|dumbest|stupidest|ugliest|most stupid|most useless|most pathetic|biggest loser) (person|thing|human|player|student)\b/i,
            meaning: "Superlative insult - claiming someone is the worst/dumbest",
            severity: 0.85,
            category: "superlative_insult"
        },

        // MILD PERSONAL ATTACKS - Low severity but still cyberbullying
        {
            pattern: /\b(you|u) (are|r) (such )?(a |an )?bad (boy|girl|person|kid|child|student)\b/i,
            meaning: "Mild personal attack - bad boy/girl/person",
            severity: 0.25,
            category: "mild_insult"
        },
        {
            pattern: /\b(you|u) (are|r) (just |really |so |very )?(bad|wrong)\b(?! (at|for|about|with))\b/i,
            meaning: "Generic 'you are bad' - borderline mild insult",
            severity: 0.12,
            category: "borderline_mild"
        },
        {
            pattern: /\b(you|u) (are|r) the (worst|dumbest|ugliest|stupidest|most useless) .{0,30}(i have|i've|ive) (ever )?(seen|met|known)\b/i,
            meaning: "Comparative inferiority - superlative negative comparison",
            severity: 0.85,
            category: "comparative_insult"
        },
        {
            pattern: /\beven (a |an )?(child|baby|idiot|moron) (could|can|knows) .{0,30}(better than you|more than you)\b/i,
            meaning: "Comparative inferiority - even X is better",
            severity: 0.76,
            category: "comparative_insult"
        },

        // OBFUSCATED / LEETSPEAK - Attempting to evade detection
        {
            pattern: /k[i!1][l|1][l|1]\s*(y[o0][u\*]|ur?s[e3][l|1][f|v])/i,
            meaning: "CRITICAL: Obfuscated suicide encouragement (leetspeak)",
            severity: 1.0,
            category: "obfuscated_threat"
        },
        {
            pattern: /f[\*_u@]c?k\s*(y[o0@][u\*]|off)/i,
            meaning: "Obfuscated profanity (leetspeak)",
            severity: 0.70,
            category: "obfuscated_insult"
        },
        {
            pattern: /(sh[i!1][t\*]|cr[a@]p|d[a@]mn|[a@]ss?h[o0][l|1][e3])/i,
            meaning: "Obfuscated profanity",
            severity: 0.65,
            category: "obfuscated_insult"
        },
        {
            pattern: /\b[a-z]{2,}([a-z])\1{2,}[a-z]{2,}\b/i,
            meaning: "Potential obfuscated word with character repetition",
            severity: 0.45,
            category: "obfuscated_text"
        },

        // EMOJI VIOLENCE - Using emojis for threats
        {
            pattern: /(🔫|🗡️|🔪|⚰️|💀|☠️).{0,10}(you|u|👉|@)/i,
            meaning: "Emoji violence - weapon/death emojis directed at person",
            severity: 0.85,
            category: "emoji_threat"
        },
        {
            pattern: /(you|u|👉).{0,10}(🔫|🗡️|🔪|⚰️|💀|☠️)/i,
            meaning: "Emoji violence - targeting person with threat emojis",
            severity: 0.85,
            category: "emoji_threat"
        },
        {
            pattern: /🤡.{0,10}(🔫|💀|⚰️)/i,
            meaning: "Emoji mockery with violence",
            severity: 0.75,
            category: "emoji_harassment"
        },

        // COMPARATIVE INSULTS - "X as Y" comparisons
        {
            pattern: /\b(your|ur) (future|brain|head|mind|thoughts|ideas) (is|are) (as )?(empty|blank|void|useless|dumb|stupid|worthless)\b/i,
            meaning: "Comparative insult - attacking intelligence/future as empty/worthless",
            severity: 0.82,
            category: "comparative_insult"
        },
        {
            pattern: /\b(empty|blank|dumb|stupid|useless) as (your|ur) (brain|head|future|mind)\b/i,
            meaning: "Comparative insult - empty/dumb as your brain",
            severity: 0.82,
            category: "comparative_insult"
        },
        {
            pattern: /\b(your|ur) (brain|head|mind) is (empty|blank|useless|void|nothing)\b/i,
            meaning: "Direct brain/intelligence attack - empty brain",
            severity: 0.80,
            category: "intelligence_attack"
        },
        {
            pattern: /\b(as|more) (stupid|dumb|ugly|worthless|pathetic|useless) as\b/i,
            meaning: "Comparative insult structure",
            severity: 0.75,
            category: "comparative_insult"
        },

        // SARCASM & PASSIVE AGGRESSION - Backhanded compliments
        {
            pattern: /\b(have you considered|you should try) (plastic surgery|therapy|medication|help)\b/i,
            meaning: "Sarcastic concern - false concern attack",
            severity: 0.72,
            category: "passive_aggressive"
        },
        {
            pattern: /\b(i'm |i am )?(worried|concerned) about (your|you) (mental health|sanity|brain)\b/i,
            meaning: "Sarcastic concern - fake worry about mental state",
            severity: 0.70,
            category: "passive_aggressive"
        },
        {
            pattern: /\b(you're|you are|youre) (actually |really |kinda )?(pretty|nice|good|smart|cool|brave) for (someone|a person) (like you|who|with|of your)\b/i,
            meaning: "Backhanded compliment - praise with qualifier",
            severity: 0.75,
            category: "backhanded_compliment"
        },
        {
            pattern: /\bi love how (you|u) (just |always )?(wear|do|say|post|think) (anything|whatever|that)\b/i,
            meaning: "Sarcastic praise - mock appreciation",
            severity: 0.68,
            category: "sarcastic_praise"
        },
        {
            pattern: /\b(wow|oh|nice|great|good|amazing) (job|work|going|move|play)?,? (genius|einstein|sherlock|smarty|champ)\b/i,
            meaning: "Sarcastic praise - mock celebration",
            severity: 0.70,
            category: "sarcastic_praise"
        },
        {
            pattern: /\b(wow|nice|great) (job|work) .{0,30}(ruining|destroying|messing up|screwing up)/i,
            meaning: "Sarcastic praise - mock celebration of failure",
            severity: 0.75,
            category: "sarcastic_praise"
        },
        {
            pattern: /\b(at least|well) you (tried|attempted|did something)\b/i,
            meaning: "Condescending praise - patronizing",
            severity: 0.65,
            category: "condescension"
        },
        {
            pattern: /\bthat's (so |really |very )?(brave|bold|interesting) of you\b/i,
            meaning: "Sarcastic appreciation - mock admiration",
            severity: 0.63,
            category: "sarcastic_praise"
        },

        // GAMING COMMUNITY TAUNTS
        {
            pattern: /\b(lol|lmao|haha|rofl)\s+(noob|newb|n00b|scrub|bot)\b/i,
            meaning: "Gaming mockery - laughing at skill level",
            severity: 0.35,
            category: "gaming_taunt"
        },
        {
            pattern: /\b(git|get)\s+(gud|good)\s+(noob|newb|scrub|bot|kid)\b/i,
            meaning: "Gaming condescension - mocking skill",
            severity: 0.35,
            category: "gaming_condescension"
        },
        {
            pattern: /\b(ez|easy)\s+(clap|win|game|gg)\s+(noob|scrub|loser|bot)\b/i,
            meaning: "Gaming taunt - declaring easy victory over opponent",
            severity: 0.25,
            category: "gaming_victory_taunt"
        },

        // BACKHANDED COMPLIMENTS
        {
            pattern: /\b(you're|youre|you are) (pretty|quite|kinda|sort of|relatively) (smart|good|nice|cool|brave|talented) (for )?(someone|a person) (like you|who|with|of your)\b/i,
            meaning: "Backhanded compliment - qualified praise with insult",
            severity: 0.75,
            category: "backhanded_compliment"
        },

        // PERSONAL WEIGHT/BURDEN INSULTS
        {
            pattern: /\b(you|u) (are|r) (just |such |a total )?(a )?weight\b(?! (lifting|training|loss|gain|class|room))\b/i,
            meaning: "Personal burden insult - calling someone a weight",
            severity: 0.60,
            category: "burden_insult"
        },

        // COMPARATIVE DEGRADATION
        {
            pattern: /\b(you|u) (are|r) (worse|lower|less) than (trash|garbage|shit|nothing|dirt|scum|filth|waste)\b/i,
            meaning: "Comparative degradation - worse than trash/garbage",
            severity: 0.82,
            category: "dehumanization"
        },

        // CAPS EMPHASIS DETECTION (handled in preprocessing but pattern for scoring)
        {
            pattern: /\b[A-Z]{4,}\b/,
            meaning: "Aggressive caps emphasis",
            severity: 0.15,
            category: "emphasis"
        }
    ];

    private normalizeLeetspeak(text: string): string {
        // Comprehensive leetspeak normalization
        let normalized = text;
        
        // Specific common obfuscations (do these FIRST)
        normalized = normalized.replace(/f[\*@#]ck/gi, 'fuck');
        normalized = normalized.replace(/b[!1i\*]tch/gi, 'bitch');
        normalized = normalized.replace(/sh[!i\*]t/gi, 'shit');
        normalized = normalized.replace(/a[s\$5]s/gi, 'ass');
        
        // Remove obfuscation separators FIRST
        normalized = normalized.replace(/\*+/g, '');    // f**k, stu**id
        normalized = normalized.replace(/-+/g, '');     // d-u-m-b
        normalized = normalized.replace(/_+/g, '');     // similar_obfuscation
        normalized = normalized.replace(/\s+/g, ' ');   // normalize spaces
        
        // Number-to-letter substitutions (context-aware)
        normalized = normalized.replace(/y0u/g, 'you');
        normalized = normalized.replace(/ar3/g, 'are');
        normalized = normalized.replace(/st00pid/g, 'stupid');
        normalized = normalized.replace(/b1tch/g, 'bitch');
        normalized = normalized.replace(/1d10t/g, 'idiot');
        
        // General number-to-letter (after specific patterns)
        normalized = normalized.replace(/0/g, 'o');
        normalized = normalized.replace(/1/g, 'i');
        normalized = normalized.replace(/3/g, 'e');
        normalized = normalized.replace(/4/g, 'a');
        normalized = normalized.replace(/5/g, 's');
        normalized = normalized.replace(/7/g, 't');
        normalized = normalized.replace(/8/g, 'b');
        normalized = normalized.replace(/9/g, 'g');
        
        // Symbol-to-letter substitutions
        normalized = normalized.replace(/\$/g, 's');
        normalized = normalized.replace(/@/g, 'a');
        normalized = normalized.replace(/!/g, 'i');
        normalized = normalized.replace(/\+/g, 't');
        
        return normalized;
    }

    private normalizeRepeatingChars(word: string): string {
        return word.replace(/(.)\1{2,}/g, "$1$1");
    }

    private expandSlang(word: string): string {
        return this.slangMap[word] ?? word;
    }

    public preprocess(text: string): {
        normalized: string;
        tokens: string[];
        semanticMatches: Array<{ pattern: string; meaning: string; severity: number }>;
    } {
        // Check for CAPS emphasis BEFORE lowercasing
        const hasCapsEmphasis = /\b[A-Z]{4,}\b/.test(text);
        
        let cleaned = text.toLowerCase();

        // Normalize leetspeak FIRST (before pattern matching)
        cleaned = this.normalizeLeetspeak(cleaned);

        // Check cache first for performance
        let semanticMatches = this.patternCache.get(cleaned);

        if (!semanticMatches) {
            semanticMatches = [];

            // Check semantic patterns BEFORE heavy preprocessing (more efficient)
            for (const sp of this.semanticPatterns) {
                if (sp.pattern.test(cleaned)) {
                    semanticMatches.push({
                        pattern: sp.pattern.source,
                        meaning: sp.meaning,
                        severity: sp.severity
                    });
                }
            }

            // Cache the result
            if (this.patternCache.size >= this.MAX_CACHE_SIZE) {
                // Clear cache when it gets too large (FIFO)
                const firstKey = this.patternCache.keys().next().value;
                if (firstKey) {
                    this.patternCache.delete(firstKey);
                }
            }
            this.patternCache.set(cleaned, semanticMatches);
        }

        // Add CAPS emphasis if detected
        if (hasCapsEmphasis) {
            semanticMatches.push({
                pattern: 'CAPS_EMPHASIS',
                meaning: 'Aggressive caps emphasis',
                severity: 0.20
            });
        }

        // Remove URLs
        cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, " ");

        // Keep letters, numbers, spaces (more efficient single regex)
        cleaned = cleaned.replace(/[^a-z0-9\s]/g, " ");

        // Collapse whitespace
        cleaned = cleaned.replace(/\s+/g, " ").trim();

        // Tokenize
        const rawTokens = cleaned.split(" ");

        // Process tokens (optimized)
        const processedTokens: string[] = [];
        for (const token of rawTokens) {
            if (!token) continue;

            let normalized = this.normalizeRepeatingChars(token);
            normalized = this.expandSlang(normalized);

            const expandedParts = normalized.split(/\s+/);
            for (const part of expandedParts) {
                const w = part.trim();
                if (w.length > 0 && !this.stopWords.has(w)) {
                    processedTokens.push(w);
                }
            }
        }

        return {
            normalized: processedTokens.join(" "),
            tokens: processedTokens,
            semanticMatches
        };
    }
}

export class CyberbullyDetector {
    private preprocessor = new EnhancedTextPreprocessor();
    private csvData: Map<string, number> = new Map();

    // Word categorization for granular analysis
    private criticalThreatWords = new Set([
        "kill", "die", "suicide", "murder", "dead", "death", "stab", "shoot", "slash",
        "assassin", "assassinate", "bomb", "execute", "execution", "homicide", "lynch",
        "slaughter", "sniper", "terrorist", "weapon", "gun", "knife", "pistol", "nuke"
    ]);

    private violenceWords = new Set([
        "beat", "hurt", "harm", "attack", "punch", "kick", "destroy", "violence", "threat",
        "abuse", "assault", "buried", "burn", "crime", "criminal", "explosion", "fight",
        "fire", "firing", "hijack", "hostage", "rape", "torture", "bombing", "explosion"
    ]);

    private worthAttackWords = new Set([
        "waste", "burden", "useless", "worthless", "mistake", "disappear", "trash", "unwanted",
        "loser", "failure", "nobody", "pathetic", "incompetent", "retard", "retarded", "stupid",
        "dumb", "idiot", "moron", "ugly", "fugly", "fat", "fatass", "gross"
    ]);

    private insultWords = new Set([
        "stupid", "dumb", "idiot", "loser", "pathetic", "failure", "incompetent", "nobody",
        "bastard", "bitch", "asshole", "dick", "dickhead", "prick", "cunt", "twat",
        "jerk", "douche", "scumbag", "slut", "whore", "skank", "trash"
    ]);

    private shamingWords = new Set([
        "embarrassment", "embarrassing", "disgrace", "disgusting", "shameful", "disappointment",
        "revolting", "repulsive", "annoying", "irritating", "pest", "nuisance", "ugly",
        "gross", "fat", "fatso", "skanky", "slutty"
    ]);

    private existenceWords = new Set([
        "existence", "problem", "regret", "shouldnt", "empty", "meaningless", "pointless", "broken",
        "mistake", "unwanted", "burden", "waste"
    ]);

    private mockeryWords = new Set([
        "laughs", "mock", "joke", "ridicule", "humiliate", "embarrass"
    ]);

    // Mild/contextual words - LOW severity, context-dependent
    private mildContextualWords = new Set([
        "bad", "wrong", "weird", "strange", "crazy", "silly", "dumb",
        "lame", "sucks", "boring", "annoying", "awful", "terrible", "horrible",
        // Gaming slang - mild
        "noob", "newb", "scrub", "dum", "git", "gud", "ez", "rekt"
    ]);

    // Enhanced toxic keywords - comprehensive profanity and hate speech list
    private toxicKeywords: string[] = [
        // Threat keywords
        "kill", "die", "suicide", "beat", "hurt", "harm", "attack",
        "stab", "shoot", "slash", "punch", "kick", "destroy",
        "murder", "dead", "death", "violence", "threat",

        // Worth attack keywords
        "waste", "burden", "useless", "worthless", "pathetic",
        "mistake", "disappear", "stupid", "dumb", "incompetent",
        "embarrassment", "embarrassing", "disgrace", "disgusting", "shameful",
        "idiot", "loser", "nobody", "failure", "disappointment",
        "yourself", "delete", "leave", "trash", "shut",
        "annoying", "irritating", "pest", "nuisance", "existence",
        "regret", "shouldnt", "problem", "unwanted", "revolting", "repulsive",
        "empty", "meaningless", "pointless", "broken", "laughs", "mock",

        // Profanity and offensive terms
        "abortion", "abuse", "addict", "anal", "anus", "arse", "arsehole", 
        "ass", "asshole", "assh0le", "asswipe", "bastard", "bitch", "bitches",
        "bitching", "bloody", "blowjob", "bollocks", "boner", "boob", "boobs",
        "bullshit", "butt", "butthole", "cock", "coon", "crap", "cunt", "damn",
        "dick", "dickhead", "dildo", "douche", "dumb", "dyke", "fag", "faggot",
        "fck", "fuck", "fucker", "fucking", "fuk", "goddamn", "hell", "homo",
        "jerk", "jizz", "knobend", "lesbian", "lmao", "milf", "mofo", "motherfucker",
        "nazi", "nigga", "nigger", "nude", "nutsack", "penis", "piss", "pissed",
        "poop", "porn", "prick", "pube", "pussy", "queer", "rape", "retard",
        "screw", "sex", "shit", "slut", "smegma", "sperm", "suck", "tit", "tits",
        "tosser", "turd", "twat", "vagina", "wank", "whore", "wtf",
        
        // Racial and ethnic slurs
        "beaner", "chink", "coon", "darkie", "dago", "gook", "goy", "gyp",
        "hijack", "kike", "kraut", "nig", "niger", "nigga", "niggah", "nigger",
        "niggur", "paki", "polack", "raghead", "redneck", "russki", "sandnigger",
        "slant", "spic", "spick", "towelhead", "wetback", "whitey", "wog",
        "wop", "zipperhead",
        
        // Sexual and explicit content
        "analannie", "analsex", "aroused", "ass", "assfuck", "asslick", "backdoor",
        "ballsack", "beastality", "bestiality", "blowjob", "booty", "breast",
        "brothel", "cameltoe", "clit", "clitoris", "cock", "cocksuck", "cocksucker",
        "coitus", "condom", "copulate", "cum", "cumshot", "cunt", "cybersex",
        "deepthroat", "dick", "dildo", "dong", "ejaculate", "erect", "erection",
        "escort", "fag", "felatio", "fellatio", "fetish", "fingerfuck", "fisting",
        "fondle", "foreskin", "fornicate", "foursome", "fuck", "gangbang", "gay",
        "gaysex", "genital", "handjob", "harem", "herpes", "hiv", "homo", "homosexual",
        "hooker", "horny", "hymen", "incest", "intercourse", "jerk", "jism", "jizz",
        "kinky", "lesbian", "libido", "lovebone", "lubejob", "lust", "masturbate",
        "milf", "molestation", "muff", "naked", "nympho", "oral", "orgasm", "orgy",
        "penetration", "penis", "pimp", "playboy", "porn", "porno", "pornography",
        "prostitute", "pube", "pubic", "pussy", "queer", "rape", "rectum", "rim",
        "scrotum", "semen", "sex", "sexo", "sexy", "shag", "sixtynine", "slut",
        "smut", "snatch", "sodom", "sodomy", "sperm", "spunk", "stripper", "suck",
        "swallow", "syphilis", "tampon", "testical", "testicle", "threesome", "tit",
        "titties", "titty", "topless", "tranny", "transexual", "transsexual", "transvestite",
        "twat", "urethra", "urine", "vagina", "viagra", "vibrator", "virgin", "vulva",
        "wank", "wanker", "whore", "xxx",
        
        // Violence and weapons
        "abuse", "assault", "assassin", "attack", "beat", "bomb", "bombers", "bombing",
        "buried", "burn", "bury", "crime", "criminal", "death", "destroy", "die", "doom",
        "executed", "execution", "explode", "explosion", "fight", "fire", "firing", "gun",
        "harm", "hijack", "hijacker", "hit", "homicide", "hostage", "hurt", "kill", "killed",
        "killer", "killing", "knife", "lynch", "mafia", "murder", "murderer", "nuke",
        "pistol", "punch", "rape", "raper", "shoot", "shooting", "shot", "slaughter",
        "slaughter", "sniper", "stab", "terrorist", "threat", "torture", "violence", "weapon",
        
        // Drugs and substances  
        "addict", "alcohol", "amphetamine", "cocaine", "crack", "crackpipe", "dope",
        "drug", "drunk", "ecstacy", "ganja", "hash", "heroin", "high", "joint",
        "lsd", "marijuana", "meth", "narcotic", "opium", "pot", "reefer", "roach",
        "smack", "smoke", "weed",
        
        // Religious intolerance
        "allah", "baptist", "bible", "buddhist", "catholic", "christ", "christian",
        "church", "devil", "god", "hamas", "hindu", "islam", "islamic", "jesus",
        "jew", "jewish", "jihad", "mormon", "moslem", "muslim", "nazi", "quran",
        "rabbi", "religious", "satan", "terrorist",
        
        // Body shaming and insults
        "fat", "fatass", "fatso", "fugly", "gross", "loser", "retard", "retarded",
        "skank", "skanky", "slut", "slutty", "stupid", "ugly", "useless", "worthless"
    ];

    // Multi-word toxic phrases
    private toxicPhrases: string[] = [
        // CRITICAL THREATS (highest priority)
        "i will kill you", "i'll kill you", "gonna kill you", "going to kill you",
        "i will beat you", "i'll beat you", "gonna beat you",
        "i will hurt you", "i'll hurt you", "gonna hurt you",
        "i will stab you", "i'll stab you", "gonna stab you",
        "i will shoot you", "i'll shoot you",
        "i will attack you", "i'll attack you",
        "go suicide", "commit suicide", "do suicide", "kill yourself",
        "go kill yourself", "you should die", "just die", "go die",
        "end your life", "kill urself", "kys",
        "watch your back", "you're dead", "youre dead",
        "nobody would miss you", "no one would care",
        "better off dead", "world better without you",

        // Existence & worth attacks
        "waste of space", "better off without you", "nobody wants you here",
        "completely useless", "you serve no purpose", "you are a burden",
        "your existence is burden", "your existence is waste", "your existence is mistake",
        "existence is burden", "existence is waste", "existence is problem",
        "you are burden", "being you is burden",
        "everyone better without you", "shouldnt exist",
        "your presence is burden", "presence is problem",

        // Intelligence & competence attacks
        "empty as your brain", "your brain is empty", "your future is empty",
        "everyone voted that", "shouldnt be part", "laughs at you", "mock you",
        "makes everything worse", "your presence makes", "presence ruins",

        // Shaming attacks
        "you are embarrassing", "you are pathetic", "you are disgusting",
        "you are an embarrassment", "you are a disgrace", "you are a disappointment",
        "you are a failure", "such a loser", "what a loser", "so pathetic",
        "ashamed of you", "you should be ashamed",

        // Social rejection
        "do everyone a favor and just disappear", "youre a mistake",
        "you are a mistake", "wish you were never born", "nobody cares about you",
        "so stupid it hurts", "youre so stupid", "never be good enough",
        "youre an embarrassment", "you are an embarrassment",
        "go away nobody likes you", "nobody likes you",
        "you dont belong here", "shut up loser", "take a hint",
        "id be so ashamed if i were you", "ruin the mood",
        "you think you matter", "keep crying about it",
        "why are you even talking", "who asked you", "nobody asked"
    ];

    // High severity patterns
    private highSeverityPatterns: string[] = [
        "kill yourself", "go kill yourself", "kys",
        "you should die", "better off dead", "end your life",
        "commit suicide", "go suicide", "do suicide", "just die",
        "i will kill you", "i'll kill you", "gonna kill you",
        "i will beat you", "i'll beat you", "gonna beat you",
        "i will hurt you", "i'll hurt you", "gonna hurt you",
        "i will stab you", "i'll stab you", "gonna stab you",
        "i will shoot you", "i'll shoot you", "gonna shoot you",
        "i will attack you", "i'll attack you",
        "go die", "just die", "you should die",
        "watch your back", "you're dead", "you'll regret this",
        "nobody would miss you", "no one would care if you died",
        "end it all", "kill urself", "hurt yourself"
    ];

    /**
     * Load CSV data for enhanced detection
     */
    public async loadCSVData(csvContent: string): Promise<void> {
        console.log(`[CyberbullyDetector] Parsing CSV content (length: ${csvContent.length})`);

        if (!csvContent) {
            console.warn('[CyberbullyDetector] CSV content is empty');
            return;
        }

        const lines = csvContent.split(/\r?\n/);
        console.log(`[CyberbullyDetector] Found ${lines.length} lines`);

        if (lines.length > 0) {
            console.log(`[CyberbullyDetector] First line: "${lines[0]}"`);
        }

        let loadedCount = 0;
        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(',');
            if (parts.length >= 2) {
                const ngram = parts[0].toLowerCase().trim();
                const score = parseFloat(parts[1]);
                if (!isNaN(score)) {
                    this.csvData.set(ngram, score);
                    loadedCount++;
                }
            }
        }

        console.log(`[CyberbullyDetector] Loaded ${loadedCount} patterns from CSV (Total: ${this.csvData.size})`);
    }

    /**
     * Check if CSV data is loaded
     */
    public hasCSVData(): boolean {
        return this.csvData.size > 0;
    }

    /**
     * Directly set CSV data map
     */
    public setCSVData(data: Map<string, number>): void {
        this.csvData = data;
        console.log(`[CyberbullyDetector] Set ${this.csvData.size} patterns from data source`);
    }

    /**
     * Analyze each word individually for toxicity
     */
    private analyzeWords(tokens: string[], originalText: string = ""): WordAnalysis[] {
        const analyses: WordAnalysis[] = [];
        const textLower = originalText.toLowerCase();
        
        // Check for personal context (directed at a person)
        const hasPersonalPronouns = /\b(you|your|you're|youre|ur|u are)\b/i.test(textLower);
        
        // Check for non-personal/technical context (enhanced)
        const hasTechContext = /\b(process|program|app|software|system|battery|device|server|code|the process|the battery|the device|the system|the app)\b/i.test(textLower);
        const hasObjectContext = /\b(this|that|it|these|those|movie|weather|food|idea|the movie|the weather)\b/i.test(textLower) && !hasPersonalPronouns;

        for (const token of tokens) {
            const word = token.toLowerCase();
            const analysis: WordAnalysis = {
                word: token,
                isToxic: false,
                severity: "safe",
                categories: [],
                reasons: []
            };

            // Skip critical/high severity words if in technical/object context
            const skipDueToContext = (hasTechContext || hasObjectContext) && !hasPersonalPronouns;
            
            // Check against categorized word sets
            if (this.criticalThreatWords.has(word)) {
                // Allow "kill the process", "dead battery" etc.
                if (!skipDueToContext) {
                    analysis.isToxic = true;
                    analysis.severity = "critical";
                    analysis.categories.push("threat", "violence");
                    analysis.reasons.push(`Critical threat word: "${token}"`);
                }
            } else if (this.violenceWords.has(word)) {
                if (!skipDueToContext) {
                    analysis.isToxic = true;
                    analysis.severity = "high";
                    analysis.categories.push("violence", "threat");
                    analysis.reasons.push(`Violence-related: "${token}"`);
                }
            } else if (this.worthAttackWords.has(word)) {
                // "worthless trash" (object) vs "you are worthless" (personal)
                // Flag if has personal pronouns OR no clear object context
                if (hasPersonalPronouns || !hasObjectContext) {
                    analysis.isToxic = true;
                    analysis.severity = "high";
                    analysis.categories.push("insult", "toxicity");
                    analysis.reasons.push(`Personal worth attack: "${token}"`);
                }
            } else if (this.shamingWords.has(word)) {
                if (hasPersonalPronouns || !hasObjectContext) {
                    analysis.isToxic = true;
                    analysis.severity = "medium";
                    analysis.categories.push("insult", "toxicity");
                    analysis.reasons.push(`Shaming language: "${token}"`);
                }
            } else if (this.insultWords.has(word)) {
                if (hasPersonalPronouns || !hasObjectContext) {
                    analysis.isToxic = true;
                    analysis.severity = "medium";
                    analysis.categories.push("insult");
                    analysis.reasons.push(`Insulting term: "${token}"`);
                }
            } else if (this.existenceWords.has(word)) {
                if (hasPersonalPronouns || !hasObjectContext) {
                    analysis.isToxic = true;
                    analysis.severity = "high";
                    analysis.categories.push("toxicity", "insult");
                    analysis.reasons.push(`Existence attack: "${token}"`);
                }
            } else if (this.mockeryWords.has(word)) {
                if (hasPersonalPronouns) {
                    analysis.isToxic = true;
                    analysis.severity = "medium";
                    analysis.categories.push("toxicity");
                    analysis.reasons.push(`Mockery/ridicule: "${token}"`);
                }
            } else if (this.mildContextualWords.has(word)) {
                // Mild words are only toxic if directed at a person
                if (hasPersonalPronouns) {
                    analysis.isToxic = true;
                    analysis.severity = "low";
                    analysis.categories.push("mild_insult");
                    analysis.reasons.push(`Mild negative term in personal context: "${token}"`);
                }
                // Otherwise not toxic (e.g., "bad weather", "bad idea")
            }

            // Check CSV data for additional context
            if (this.csvData.has(word) && (hasPersonalPronouns || !hasObjectContext)) {
                const csvScore = this.csvData.get(word)!;
                if (csvScore > 0.3) {
                    analysis.isToxic = true;
                    if (csvScore >= 0.8) {
                        analysis.severity = analysis.severity === "safe" ? "critical" : analysis.severity;
                    } else if (csvScore >= 0.6) {
                        analysis.severity = analysis.severity === "safe" ? "high" : analysis.severity;
                    } else if (csvScore >= 0.4) {
                        analysis.severity = analysis.severity === "safe" ? "medium" : analysis.severity;
                    } else {
                        analysis.severity = analysis.severity === "safe" ? "low" : analysis.severity;
                    }
                    if (!analysis.categories.includes("toxicity")) {
                        analysis.categories.push("toxicity");
                    }
                    analysis.reasons.push(`CSV toxicity score: ${(csvScore * 100).toFixed(1)}%`);
                }
            }

            analyses.push(analysis);
        }

        return analyses;
    }

    /**
     * Check CSV data for matches
     */
    private checkCSVMatches(normalized: string, tokens: string[]): {
        score: number;
        matches: string[];
    } {
        let score = 0;
        const matches: string[] = [];

        // Check individual tokens
        for (const token of tokens) {
            if (this.csvData.has(token)) {
                const csvScore = this.csvData.get(token)!;
                score += csvScore;
                matches.push(`CSV:${token}(${csvScore.toFixed(2)})`);
            }
        }

        // Check 2-grams
        for (let i = 0; i < tokens.length - 1; i++) {
            const bigram = `${tokens[i]} ${tokens[i + 1]}`;
            if (this.csvData.has(bigram)) {
                const csvScore = this.csvData.get(bigram)!;
                score += csvScore;
                matches.push(`CSV:${bigram}(${csvScore.toFixed(2)})`);
            }
        }

        // Check 3-grams
        for (let i = 0; i < tokens.length - 2; i++) {
            const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
            if (this.csvData.has(trigram)) {
                const csvScore = this.csvData.get(trigram)!;
                score += csvScore;
                matches.push(`CSV:${trigram}(${csvScore.toFixed(2)})`);
            }
        }

        return { score: Math.min(score, 1), matches };
    }

    /**
     * Compute heuristic score with semantic analysis
     */
    private computeScore(
        normalized: string,
        tokens: string[],
        semanticMatches: Array<{ pattern: string; meaning: string; severity: number }>
    ): {
        score: number;
        highSeverity: boolean;
        matchedSignals: string[];
    } {
        const matchedSignals: string[] = [];
        let score = 0;
        let highSeverity = false;

        const text = ` ${normalized} `;

        // Detect non-personal context to reduce false positives
        const hasNonPersonalContext = /\b(project|system|team|work|task|code|software|application|feature|issue|bug)\b/i.test(text);
        const hasPersonalPronouns = /\b(you|your|ur)\b/i.test(text);

        // 1. Semantic pattern matches (HIGHEST PRIORITY)
        for (const match of semanticMatches) {
            score += match.severity;
            matchedSignals.push(`SEMANTIC:${match.meaning}`);
            if (match.severity >= 0.7) {
                highSeverity = true;
            }
        }

        // 2. High-severity patterns
        for (const pattern of this.highSeverityPatterns) {
            if (text.includes(` ${pattern} `) || text.includes(pattern.replace(/\s+/g, ""))) {
                score += 0.8;
                highSeverity = true;
                matchedSignals.push(`HIGH:${pattern}`);
            }
        }

        // 3. Multi-word toxic phrases
        for (const phrase of this.toxicPhrases) {
            if (text.includes(` ${phrase} `)) {
                score += 0.5;
                matchedSignals.push(`PHRASE:${phrase}`);
            }
        }

        // 4. Keyword hits (reduce weight significantly for better granularity)
        const tokenSet = new Set(tokens);
        const keywordWeight = (hasNonPersonalContext && !hasPersonalPronouns) ? 0.05 : 0.12;
        for (const keyword of this.toxicKeywords) {
            if (tokenSet.has(keyword)) {
                score += keywordWeight;
                matchedSignals.push(`WORD:${keyword}`);
            }
        }

        // 5. CSV data matches
        const csvResult = this.checkCSVMatches(normalized, tokens);
        score += csvResult.score * 0.5; // Reduce CSV weight
        matchedSignals.push(...csvResult.matches);

        // Don't cap score yet - let word analysis adjust it
        return { score, highSeverity, matchedSignals };
    }

    /**
     * Public API: classify text
     */
    public classify(text: string): ProcessedData {
        const { normalized, tokens, semanticMatches } = this.preprocessor.preprocess(text);
        const { score, highSeverity, matchedSignals } = this.computeScore(
            normalized,
            tokens,
            semanticMatches
        );

        // Perform word-level analysis with original text for context
        const wordAnalysis = this.analyzeWords(tokens, text);

        // Count severity levels from word analysis
        const criticalWordCount = wordAnalysis.filter(w => w.severity === "critical").length;
        const highWordCount = wordAnalysis.filter(w => w.severity === "high").length;
        const mediumWordCount = wordAnalysis.filter(w => w.severity === "medium").length;
        const lowWordCount = wordAnalysis.filter(w => w.severity === "low").length;

        // Calculate weighted score based on word severity
        let severityWeightedScore = 0;
        for (const word of wordAnalysis) {
            switch (word.severity) {
                case "critical":
                    severityWeightedScore += 0.9; // Critical words = 90% risk each
                    break;
                case "high":
                    severityWeightedScore += 0.6; // High severity = 60% risk each
                    break;
                case "medium":
                    severityWeightedScore += 0.3; // Medium severity = 30% risk each
                    break;
                case "low":
                    severityWeightedScore += 0.15; // Low severity = 15% risk each
                    break;
            }
        }

        // Average the severity score with token count (normalize)
        const avgSeverityScore = tokens.length > 0 ? severityWeightedScore / tokens.length : 0;

        // Determine if text should be flagged based on word severity
        let autoFlagAsCyberbully = false;
        let severityBoost = 0;

        if (criticalWordCount >= 1) {
            // Any critical word = instant cyberbullying flag
            autoFlagAsCyberbully = true;
            severityBoost = Math.min(0.7 + (criticalWordCount * 0.15), 0.95);
            matchedSignals.push(`CRITICAL_WORDS:${criticalWordCount}`);
        } else if (highWordCount >= 1) {
            // Any high severity word = cyberbullying flag  
            autoFlagAsCyberbully = true;
            severityBoost = Math.min(0.45 + (highWordCount * 0.12), 0.75);
            matchedSignals.push(`HIGH_SEVERITY_WORDS:${highWordCount}`);
        } else if (mediumWordCount >= 2) {
            // 2+ medium severity words = likely cyberbullying
            autoFlagAsCyberbully = true;
            severityBoost = Math.min(0.25 + (mediumWordCount * 0.08), 0.55);
            matchedSignals.push(`MEDIUM_SEVERITY_WORDS:${mediumWordCount}`);
        } else if (mediumWordCount === 1 && tokens.length <= 5) {
            // Single medium word in short text = moderate risk
            // Check if personal context - if so, flag it
            const hasPersonalContext = /\b(you|your|you're|youre|ur|u are)\b/i.test(text);
            if (hasPersonalContext) {
                autoFlagAsCyberbully = true;
                severityBoost = 0.25;
            } else {
                severityBoost = 0.2;
            }
            matchedSignals.push(`MEDIUM_SEVERITY_WORDS:${mediumWordCount}`);
        } else if (lowWordCount >= 2 && tokens.length <= 6) {
            // Multiple low severity words in personal context = mild cyberbullying
            const hasPersonalContext = /\b(you|your|you're|youre|ur|u are)\b/i.test(text);
            if (hasPersonalContext) {
                autoFlagAsCyberbully = true; // Auto-flag multiple mild insults
                severityBoost = 0.20;
                matchedSignals.push(`LOW_SEVERITY_PERSONAL:${lowWordCount}`);
            } else {
                severityBoost = 0.1;
                matchedSignals.push(`LOW_SEVERITY_WORDS:${lowWordCount}`);
            }
        } else if (lowWordCount === 1) {
            // Single low-severity word = NOT enough for cyberbullying flag
            // Just contribute a small score boost, don't auto-flag
            severityBoost = 0.08; // Very small boost
            matchedSignals.push(`LOW_SEVERITY_WORDS:${lowWordCount}`);
        }

        // Combine base score with severity-weighted score
        let finalScore = Math.max(score, avgSeverityScore) + (severityBoost * 0.5);
        
        // Determine if it's dangerous cyberbullying (multiple high/critical words)
        let isDangerousCyberbullying = false;
        if (criticalWordCount >= 2 || (criticalWordCount >= 1 && highWordCount >= 1)) {
            isDangerousCyberbullying = true;
            finalScore = Math.max(finalScore, 0.92); // High but not always max
            matchedSignals.push(`DANGEROUS_CYBERBULLYING:${criticalWordCount} critical, ${highWordCount} high`);
        } else if (highWordCount >= 2) {
            isDangerousCyberbullying = true;
            finalScore = Math.max(finalScore, 0.75);
            matchedSignals.push(`DANGEROUS_CYBERBULLYING:${highWordCount} high severity words`);
        }

        // Cap final score
        finalScore = Math.min(finalScore, 1.0);

        // Lower threshold if semantic patterns detected or high-severity words found
        // Require stronger signals for low severity words to prevent false positives
        const threshold = autoFlagAsCyberbully ? 0.2 : (lowWordCount >= 2 ? 0.25 : (semanticMatches.length > 0 ? 0.35 : (highSeverity ? 0.3 : 0.5)));
        const label: ClassificationResult = (finalScore >= threshold || autoFlagAsCyberbully) ? "CYBERBULLY" : "NO_CYBERBULLY";

        return {
            original: text,
            normalized,
            tokens,
            label,
            score: finalScore,
            highSeverity: highSeverity || isDangerousCyberbullying,
            matchedSignals,
            semanticMatches: semanticMatches.map(m => m.meaning),
            wordAnalysis
        };
    }
}

// Export singleton instance
export const cyberbullyDetector = new CyberbullyDetector();
