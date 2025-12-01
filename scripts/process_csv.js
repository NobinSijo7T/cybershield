const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../cyber_detector/labeled_data.csv');
const outputPath = path.join(__dirname, '../services/ngramData.ts');

try {
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split('\n');

    // Map to store n-gram scores
    // Key: n-gram, Value: { toxic: count, total: count }
    const ngrams = new Map();

    const stopWords = new Set([
        "a", "an", "the", "is", "are", "was", "were", "to", "in", "on", "at",
        "it", "that", "this", "of", "for", "with", "and", "or", "as", "i", "my",
        "you", "your", "we", "our", "he", "she", "they", "them", "rt", "http", "https", "co"
    ]);

    console.log('Processing CSV data...');

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        // Find the 6th comma to separate meta from tweet
        let commaCount = 0;
        let tweetStartIndex = 0;
        for (let j = 0; j < line.length; j++) {
            if (line[j] === ',') {
                commaCount++;
                if (commaCount === 6) {
                    tweetStartIndex = j + 1;
                    break;
                }
            }
        }

        if (tweetStartIndex === 0) continue;

        const metaPart = line.substring(0, tweetStartIndex - 1);
        const tweetPart = line.substring(tweetStartIndex);

        const meta = metaPart.split(',');
        const labelClass = parseInt(meta[5]); // 0, 1, or 2

        if (isNaN(labelClass)) continue;

        // We only care if it's toxic (0 or 1)
        const isToxic = labelClass === 0 || labelClass === 1;
        const weight = labelClass === 0 ? 1.0 : (labelClass === 1 ? 0.6 : 0);

        // Tokenize tweet
        let text = tweetPart.toLowerCase().replace(/https?:\/\/\S+/g, '').replace(/[^a-z0-9\s]/g, ' ');
        const tokens = text.split(/\s+/).filter(t => t.length > 2 && !stopWords.has(t));

        // Generate n-grams (1, 2, 3)
        for (let n = 1; n <= 3; n++) {
            for (let j = 0; j <= tokens.length - n; j++) {
                const gram = tokens.slice(j, j + n).join(' ');
                if (!ngrams.has(gram)) {
                    ngrams.set(gram, { toxic: 0, total: 0 });
                }
                const entry = ngrams.get(gram);
                entry.total += 1;
                if (isToxic) {
                    entry.toxic += weight;
                }
            }
        }
    }

    console.log(`Found ${ngrams.size} unique n-grams.`);

    // Filter for significant n-grams
    const significantNgrams = [];
    ngrams.forEach((val, key) => {
        // Skip purely numeric keys
        if (/^\d+$/.test(key)) return;

        // Min occurrences to be significant (lowered to 3)
        if (val.total < 3) return;

        const toxicityScore = val.toxic / val.total;

        // Keep if highly toxic
        if (toxicityScore > 0.65) {
            significantNgrams.push({ ngram: key, score: parseFloat(toxicityScore.toFixed(2)) });
        }
    });

    // Sort by score desc
    significantNgrams.sort((a, b) => b.score - a.score);

    // Limit to top 2000
    const topNgrams = significantNgrams.slice(0, 2000);

    console.log(`Selected top ${topNgrams.length} toxic n-grams.`);

    // Write to TS file
    const fileContent = `/**
 * Auto-generated n-gram dictionary from labeled_data.csv
 * Contains top toxic phrases and their probability scores
 */
export const NGRAM_DATA: Record<string, number> = ${JSON.stringify(
        topNgrams.reduce((acc, curr) => ({ ...acc, [curr.ngram]: curr.score }), {}),
        null,
        2
    )};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully wrote data to ${outputPath}`);

} catch (err) {
    console.error('Error processing CSV:', err);
}
