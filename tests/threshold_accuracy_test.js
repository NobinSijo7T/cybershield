/**
 * Threshold Accuracy Test
 * Tests the improved semantic model thresholds for accuracy
 */

// Use dynamic import for ES modules
async function loadModules() {
    const cyberDetectorModule = await import('../services/cyberDetector.ts');
    return cyberDetectorModule.cyberDetector;
}

async function testThresholdAccuracy() {
    console.log('\n========================================');
    console.log('THRESHOLD ACCURACY TEST');
    console.log('Testing improved semantic model thresholds');
    console.log('========================================\n');

    const cyberDetector = await loadModules();

    await cyberDetector.initialize();

    // Test cases organized by expected behavior
    const testCases = {
        // Should be flagged as cyberbullying (TRUE POSITIVES)
        definitelyCyberbullying: [
            { text: "You are stupid and worthless", expectedFlag: true },
            { text: "Kill yourself", expectedFlag: true },
            { text: "Nobody likes you", expectedFlag: true },
            { text: "You should die", expectedFlag: true },
            { text: "Everyone hates you", expectedFlag: true },
            { text: "You're an idiot", expectedFlag: true },
            { text: "Go kill yourself loser", expectedFlag: true },
            { text: "You're ugly and fat", expectedFlag: true },
            { text: "No one wants you here", expectedFlag: true },
            { text: "You don't deserve to live", expectedFlag: true }
        ],

        // Mild negativity that should NOT be flagged (PREVENT FALSE POSITIVES)
        mildNegativeNotBullying: [
            { text: "I disagree with that", expectedFlag: false },
            { text: "That's not quite right", expectedFlag: false },
            { text: "I don't think so", expectedFlag: false },
            { text: "This could be better", expectedFlag: false },
            { text: "I'm not sure about this", expectedFlag: false },
            { text: "That seems wrong", expectedFlag: false },
            { text: "Let's try something else", expectedFlag: false },
            { text: "Maybe reconsider", expectedFlag: false }
        ],

        // Clearly safe/neutral content (TRUE NEGATIVES)
        clearlySafe: [
            { text: "Hello, how are you?", expectedFlag: false },
            { text: "Have a great day!", expectedFlag: false },
            { text: "Thank you so much", expectedFlag: false },
            { text: "Nice to meet you", expectedFlag: false },
            { text: "Good job on the project", expectedFlag: false },
            { text: "Let's work together", expectedFlag: false },
            { text: "What's your favorite color?", expectedFlag: false },
            { text: "See you tomorrow", expectedFlag: false }
        ],

        // Borderline cases - context matters
        borderlineCases: [
            { text: "You're crazy", expectedFlag: false, note: "Casual expression, not targeted" },
            { text: "That's dumb", expectedFlag: false, note: "Directed at idea, not person" },
            { text: "Are you serious?", expectedFlag: false, note: "Question, not attack" },
            { text: "You're so annoying", expectedFlag: true, note: "Personal attack" },
            { text: "Shut up", expectedFlag: false, note: "Rude but not necessarily cyberbullying" },
            { text: "You suck at this", expectedFlag: true, note: "Personal insult" },
            { text: "Nobody asked you", expectedFlag: true, note: "Dismissive personal attack" }
        ],

        // Subtle cyberbullying - should be caught by semantic patterns
        subtleCyberbullying: [
            { text: "Why are you even here?", expectedFlag: true },
            { text: "Did anyone ask you?", expectedFlag: true },
            { text: "Nobody wants your opinion", expectedFlag: true },
            { text: "You don't belong here", expectedFlag: true },
            { text: "Just leave already", expectedFlag: true },
            { text: "Everyone would be happier without you", expectedFlag: true }
        ]
    };

    let totalTests = 0;
    let passed = 0;
    let failed = 0;
    const failures = [];

    // Run all test categories
    for (const [category, tests] of Object.entries(testCases)) {
        console.log(`\n=== ${category.toUpperCase().replace(/([A-Z])/g, ' $1').trim()} ===\n`);

        for (const test of tests) {
            totalTests++;
            const result = await cyberDetector.analyzeText(test.text);
            const isCorrect = result.isCyberbullying === test.expectedFlag;

            if (isCorrect) {
                passed++;
                console.log(`✅ PASS: "${test.text}"`);
                console.log(`   Risk: ${result.riskLevel}%, Confidence: ${(result.confidence * 100).toFixed(1)}%`);
            } else {
                failed++;
                const failType = result.isCyberbullying ? 'FALSE POSITIVE' : 'FALSE NEGATIVE';
                console.log(`❌ FAIL (${failType}): "${test.text}"`);
                console.log(`   Expected: ${test.expectedFlag ? 'CYBERBULLY' : 'SAFE'}, Got: ${result.isCyberbullying ? 'CYBERBULLY' : 'SAFE'}`);
                console.log(`   Risk: ${result.riskLevel}%, Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                console.log(`   Categories:`, result.categories);

                failures.push({
                    text: test.text,
                    category,
                    expected: test.expectedFlag,
                    got: result.isCyberbullying,
                    risk: result.riskLevel,
                    confidence: result.confidence,
                    note: test.note
                });
            }

            if (test.note) {
                console.log(`   Note: ${test.note}`);
            }
        }
    }

    // Summary
    console.log('\n========================================');
    console.log('TEST SUMMARY');
    console.log('========================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passed} (${((passed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed} (${((failed / totalTests) * 100).toFixed(1)}%)`);
    console.log('========================================\n');

    if (failures.length > 0) {
        console.log('\n=== FAILURES DETAIL ===\n');
        failures.forEach((f, i) => {
            console.log(`${i + 1}. "${f.text}"`);
            console.log(`   Category: ${f.category}`);
            console.log(`   Expected: ${f.expected ? 'CYBERBULLY' : 'SAFE'}, Got: ${f.got ? 'CYBERBULLY' : 'SAFE'}`);
            console.log(`   Risk: ${f.risk}%, Confidence: ${(f.confidence * 100).toFixed(1)}%`);
            if (f.note) console.log(`   Note: ${f.note}`);
            console.log('');
        });
    }

    // Accuracy target
    const accuracy = (passed / totalTests) * 100;
    if (accuracy >= 90) {
        console.log('🎉 EXCELLENT! Accuracy >= 90%');
    } else if (accuracy >= 80) {
        console.log('✅ GOOD! Accuracy >= 80%');
    } else if (accuracy >= 70) {
        console.log('⚠️  ACCEPTABLE! Accuracy >= 70%');
    } else {
        console.log('❌ NEEDS IMPROVEMENT! Accuracy < 70%');
    }

    return { totalTests, passed, failed, accuracy };
}

// Run the test
testThresholdAccuracy()
    .then(results => {
        console.log('\nTest completed successfully');
        process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
        console.error('Test failed with error:', error);
        process.exit(1);
    });
