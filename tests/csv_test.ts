
import { NGRAM_DATA } from '../services/ngramData';
import { cyberbullyDetector } from '../services/semanticDetector';

const testCases = [
    "kill cracker",
    "ghetto trash",
    "blame whitey",
    "radical",
    "Hello friend", // Control case
];

async function runTests() {
    console.log("Running CSV Integration Tests...\n");

    // Simulate initialization
    const csvMap = new Map<string, number>();
    Object.entries(NGRAM_DATA).forEach(([key, value]) => {
        csvMap.set(key, value);
    });
    cyberbullyDetector.setCSVData(csvMap);

    for (const text of testCases) {
        const result = cyberbullyDetector.classify(text);
        console.log(`Text: "${text}"`);
        console.log(`Label: ${result.label}`);
        console.log(`Score: ${result.score}`);
        console.log(`Matches: ${JSON.stringify(result.matchedSignals)}`);
        console.log("-".repeat(20));
    }
}

runTests();
