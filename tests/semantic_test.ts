
import { cyberbullyDetector } from '../services/semanticDetector';

const testCases = [
    "Wow, you actually posted that? Brave.",
    "I’d be so ashamed if I were you.",
    "Look who finally decided to show up and ruin the mood.",
    "It’s funny how you think you matter.",
    "Are you seeking attention again?",
    "Keep crying about it.",
    "YOU ARE A WASTE",
    "You are invicible",
    "You are invisible"
];

async function runTests() {
    console.log("Running Semantic Detection Tests...\n");

    for (const text of testCases) {
        const result = cyberbullyDetector.classify(text);
        console.log(`Text: "${text}"`);
        console.log(`Label: ${result.label}`);
        console.log(`Score: ${result.score}`);
        console.log(`Matches: ${JSON.stringify(result.semanticMatches)}`);
        console.log("-".repeat(20));
    }
}

runTests();
