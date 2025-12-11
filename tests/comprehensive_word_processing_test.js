/**
 * COMPREHENSIVE WORD PROCESSING & SEMANTIC DETECTION TEST
 * Tests various edge cases, obfuscation, context, and severity levels
 */

const { cyberbullyDetector } = require('../services/semanticDetector.ts');

const detector = cyberbullyDetector;

// Test categories with expected behaviors
const testSuites = {
    "Obfuscation & Leetspeak": [
        { text: "f*ck you", expected: "CYBERBULLY", minRisk: 60, category: "obfuscated" },
        { text: "f@ck off", expected: "CYBERBULLY", minRisk: 60, category: "obfuscated" },
        { text: "k!ll yourself", expected: "CYBERBULLY", minRisk: 90, category: "critical_obfuscated" },
        { text: "y0u ar3 st00pid", expected: "CYBERBULLY", minRisk: 40, category: "leetspeak" },
        { text: "b!tch", expected: "CYBERBULLY", minRisk: 40, category: "obfuscated_slur" },
        { text: "stu**id", expected: "CYBERBULLY", minRisk: 40, category: "censored_insult" },
        { text: "d-u-m-b", expected: "CYBERBULLY", minRisk: 30, category: "spaced_insult" },
    ],

    "Repetition & Emphasis": [
        { text: "stuuuupid", expected: "CYBERBULLY", minRisk: 40, category: "repeated_chars" },
        { text: "sooooo dumb", expected: "CYBERBULLY", minRisk: 40, category: "repeated_chars" },
        { text: "loseeeeeer", expected: "CYBERBULLY", minRisk: 30, category: "repeated_chars" },
        { text: "IDIOT!!!", expected: "CYBERBULLY", minRisk: 50, category: "caps_emphasis" },
        { text: "stupid stupid stupid", expected: "CYBERBULLY", minRisk: 60, category: "word_repetition" },
    ],

    "Context-Aware Detection": [
        { text: "you are bad", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 15, category: "general_bad" },
        { text: "you are a bad boy", expected: "CYBERBULLY", minRisk: 15, maxRisk: 35, category: "personal_bad" },
        { text: "you are a bad person", expected: "CYBERBULLY", minRisk: 15, maxRisk: 35, category: "personal_bad" },
        { text: "this is bad", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 10, category: "object_bad" },
        { text: "that's a bad idea", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 10, category: "concept_bad" },
        { text: "weight lifting", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 5, category: "literal_weight" },
        { text: "heavy weight", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 5, category: "literal_weight" },
        { text: "you are a weight", expected: "CYBERBULLY", minRisk: 40, category: "metaphorical_weight" },
        { text: "you are a weight to the world", expected: "CYBERBULLY", minRisk: 60, maxRisk: 70, category: "burden_attack" },
    ],

    "Slang & Informal Language": [
        { text: "ur so dum", expected: "CYBERBULLY", minRisk: 40, category: "slang_insult" },
        { text: "u r stupid", expected: "CYBERBULLY", minRisk: 40, category: "slang_insult" },
        { text: "lol noob", expected: "CYBERBULLY", minRisk: 20, maxRisk: 40, category: "gaming_insult" },
        { text: "git gud scrub", expected: "CYBERBULLY", minRisk: 15, maxRisk: 35, category: "gaming_mild" },
        { text: "ez clap loser", expected: "CYBERBULLY", minRisk: 25, maxRisk: 45, category: "gaming_taunt" },
    ],

    "Comparative Insults": [
        { text: "you are worse than trash", expected: "CYBERBULLY", minRisk: 65, category: "comparative" },
        { text: "you're the dumbest person I've ever met", expected: "CYBERBULLY", minRisk: 75, category: "superlative" },
        { text: "even a child is smarter than you", expected: "CYBERBULLY", minRisk: 65, category: "comparative_inferiority" },
        { text: "your brain is empty", expected: "CYBERBULLY", minRisk: 70, category: "brain_attack" },
        { text: "as stupid as you", expected: "CYBERBULLY", minRisk: 60, category: "as_comparison" },
    ],

    "Passive Aggressive & Sarcasm": [
        { text: "wow great job genius", expected: "CYBERBULLY", minRisk: 60, category: "sarcastic_praise" },
        { text: "nice work Einstein", expected: "CYBERBULLY", minRisk: 60, category: "sarcastic_praise" },
        { text: "oh nice going champ", expected: "CYBERBULLY", minRisk: 60, category: "sarcastic_praise" },
        { text: "you're pretty smart for someone like you", expected: "CYBERBULLY", minRisk: 65, category: "backhanded_compliment" },
        { text: "at least you tried", expected: "CYBERBULLY", minRisk: 55, maxRisk: 70, category: "condescending" },
        { text: "I'm worried about your mental health", expected: "CYBERBULLY", minRisk: 60, category: "fake_concern" },
    ],

    "Emoji-Based Attacks": [
        { text: "🔫 you", expected: "CYBERBULLY", minRisk: 75, category: "emoji_threat" },
        { text: "💀 @ you", expected: "CYBERBULLY", minRisk: 70, category: "emoji_threat" },
        { text: "🤡🔫", expected: "CYBERBULLY", minRisk: 65, category: "emoji_mockery" },
        { text: "you 🔪", expected: "CYBERBULLY", minRisk: 75, category: "emoji_threat" },
    ],

    "Existential & Worth Attacks": [
        { text: "you are worthless", expected: "CYBERBULLY", minRisk: 80, category: "worth_attack" },
        { text: "you're a mistake", expected: "CYBERBULLY", minRisk: 70, category: "existence_attack" },
        { text: "your existence is a mistake", expected: "CYBERBULLY", minRisk: 75, category: "existence_attack" },
        { text: "nobody likes you", expected: "CYBERBULLY", minRisk: 70, category: "social_rejection" },
        { text: "everyone hates you", expected: "CYBERBULLY", minRisk: 75, category: "universal_rejection" },
        { text: "you don't deserve to live", expected: "CYBERBULLY", minRisk: 90, category: "critical_existence" },
    ],

    "Critical Threats": [
        { text: "I will kill you", expected: "CYBERBULLY", minRisk: 95, category: "death_threat" },
        { text: "you should die", expected: "CYBERBULLY", minRisk: 95, category: "suicide_encouragement" },
        { text: "go kill yourself", expected: "CYBERBULLY", minRisk: 95, category: "suicide_command" },
        { text: "kill urself", expected: "CYBERBULLY", minRisk: 95, category: "suicide_slang" },
        { text: "end your life", expected: "CYBERBULLY", minRisk: 90, category: "suicide_euphemism" },
    ],

    "False Positives - Should Be Safe": [
        { text: "This movie is bad", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 10, category: "opinion" },
        { text: "The weather is terrible", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 10, category: "description" },
        { text: "I hate broccoli", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 10, category: "food_preference" },
        { text: "This is worthless trash", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 25, category: "object_criticism" },
        { text: "Kill the process", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 15, category: "tech_term" },
        { text: "Dead battery", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 10, category: "tech_term" },
        { text: "Great work!", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 5, category: "genuine_praise" },
        { text: "How are you today?", expected: "NO_CYBERBULLY", minRisk: 0, maxRisk: 5, category: "question" },
    ],

    "Mild Severity Boundary Tests": [
        { text: "you are annoying", expected: "CYBERBULLY", minRisk: 20, maxRisk: 40, category: "mild_insult" },
        { text: "you're weird", expected: "CYBERBULLY", minRisk: 15, maxRisk: 35, category: "mild_insult" },
        { text: "you smell bad", expected: "CYBERBULLY", minRisk: 25, maxRisk: 45, category: "personal_insult" },
        { text: "you look ugly", expected: "CYBERBULLY", minRisk: 40, maxRisk: 60, category: "appearance_attack" },
    ],

    "Multi-Word Patterns": [
        { text: "you are such a loser nobody likes", expected: "CYBERBULLY", minRisk: 70, category: "compound_attack" },
        { text: "stupid idiot dumb", expected: "CYBERBULLY", minRisk: 70, category: "multiple_insults" },
        { text: "you're worthless and pathetic", expected: "CYBERBULLY", minRisk: 80, category: "compound_severe" },
        { text: "go die you stupid idiot", expected: "CYBERBULLY", minRisk: 95, category: "threat_with_insults" },
    ]
};

// Run tests
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];
const suggestions = [];

console.log("=".repeat(80));
console.log("COMPREHENSIVE WORD PROCESSING & SEMANTIC DETECTION TEST");
console.log("=".repeat(80));
console.log();

for (const [suiteName, tests] of Object.entries(testSuites)) {
    console.log("=".repeat(80));
    console.log(suiteName);
    console.log("=".repeat(80));
    console.log();

    for (const test of tests) {
        totalTests++;
        const result = detector.classify(test.text);
        const riskPercent = Math.round(result.score * 100);
        const isCyberbully = result.label === "CYBERBULLY";

        let passed = true;
        let failReason = "";

        // Check if detection matches expected
        if (test.expected === "CYBERBULLY" && !isCyberbully) {
            passed = false;
            failReason = `Expected CYBERBULLY but got NO_CYBERBULLY (${riskPercent}%)`;
        } else if (test.expected === "NO_CYBERBULLY" && isCyberbully) {
            passed = false;
            failReason = `Expected NO_CYBERBULLY but got CYBERBULLY (${riskPercent}%)`;
        }

        // Check risk percentage range
        if (passed && test.minRisk !== undefined) {
            if (riskPercent < test.minRisk) {
                passed = false;
                failReason = `Risk too low: ${riskPercent}% < ${test.minRisk}%`;
            }
        }

        if (passed && test.maxRisk !== undefined) {
            if (riskPercent > test.maxRisk) {
                passed = false;
                failReason = `Risk too high: ${riskPercent}% > ${test.maxRisk}%`;
            }
        }

        if (passed) {
            passedTests++;
            console.log(`✓ "${test.text}"`);
            console.log(`   Expected: ${test.expected} (${test.minRisk || 0}-${test.maxRisk || 100}%)`);
            console.log(`   Actual: ${isCyberbully ? 'CYBERBULLY' : 'NO_CYBERBULLY'} (${riskPercent}%)`);
            if (result.semanticMatches && result.semanticMatches.length > 0) {
                console.log(`   Patterns: ${result.semanticMatches.join(', ')}`);
            }
            if (result.wordAnalysis && result.wordAnalysis.filter(w => w.isToxic).length > 0) {
                console.log(`   Toxic words: ${result.wordAnalysis.filter(w => w.isToxic).map(w => `${w.word}[${w.severity}]`).join(', ')}`);
            }
        } else {
            failedTests++;
            console.log(`✗ "${test.text}"`);
            console.log(`   Expected: ${test.expected} (${test.minRisk || 0}-${test.maxRisk || 100}%)`);
            console.log(`   Actual: ${isCyberbully ? 'CYBERBULLY' : 'NO_CYBERBULLY'} (${riskPercent}%)`);
            console.log(`   REASON: ${failReason}`);
            if (result.semanticMatches && result.semanticMatches.length > 0) {
                console.log(`   Patterns: ${result.semanticMatches.join(', ')}`);
            }
            if (result.wordAnalysis && result.wordAnalysis.filter(w => w.isToxic).length > 0) {
                console.log(`   Toxic words: ${result.wordAnalysis.filter(w => w.isToxic).map(w => `${w.word}[${w.severity}]`).join(', ')}`);
            }

            failures.push({
                suite: suiteName,
                test: test,
                result: result,
                reason: failReason
            });

            // Generate suggestions
            if (test.expected === "CYBERBULLY" && !isCyberbully) {
                suggestions.push({
                    type: "MISSING_DETECTION",
                    text: test.text,
                    category: test.category,
                    suggestion: `Add pattern or increase word severity for "${test.category}"`
                });
            } else if (test.expected === "NO_CYBERBULLY" && isCyberbully) {
                suggestions.push({
                    type: "FALSE_POSITIVE",
                    text: test.text,
                    category: test.category,
                    suggestion: `Add context check or reduce severity for "${test.category}"`
                });
            } else if (riskPercent < test.minRisk) {
                suggestions.push({
                    type: "SEVERITY_TOO_LOW",
                    text: test.text,
                    category: test.category,
                    currentRisk: riskPercent,
                    expectedMin: test.minRisk,
                    suggestion: `Increase pattern severity or word weights for "${test.category}"`
                });
            } else if (test.maxRisk && riskPercent > test.maxRisk) {
                suggestions.push({
                    type: "SEVERITY_TOO_HIGH",
                    text: test.text,
                    category: test.category,
                    currentRisk: riskPercent,
                    expectedMax: test.maxRisk,
                    suggestion: `Decrease pattern severity or add context filters for "${test.category}"`
                });
            }
        }

        console.log();
    }
}

// Summary
console.log("=".repeat(80));
console.log("TEST SUMMARY");
console.log("=".repeat(80));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
console.log(`Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
console.log();

// Suggestions
if (suggestions.length > 0) {
    console.log("=".repeat(80));
    console.log("IMPROVEMENT SUGGESTIONS");
    console.log("=".repeat(80));
    console.log();

    const grouped = {};
    for (const s of suggestions) {
        if (!grouped[s.type]) grouped[s.type] = [];
        grouped[s.type].push(s);
    }

    for (const [type, items] of Object.entries(grouped)) {
        console.log(`${type} (${items.length} cases):`);
        for (const item of items) {
            console.log(`  • "${item.text}"`);
            console.log(`    ${item.suggestion}`);
            if (item.currentRisk !== undefined) {
                console.log(`    Current: ${item.currentRisk}%, Expected: ${item.expectedMin || 0}-${item.expectedMax || 100}%`);
            }
        }
        console.log();
    }
}

// Exit code
process.exit(failedTests > 0 ? 1 : 0);
