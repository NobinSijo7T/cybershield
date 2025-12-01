/**
 * CSV Data Loader for Cyberbullying Detection
 * Loads and processes CSV files for enhanced pattern matching
 */

export class CSVLoader {
    /**
     * Parse CSV content into key-value pairs
     */
    static parseCSV(content: string): Map<string, number> {
        const data = new Map<string, number>();
        const lines = content.split('\n');

        // Skip header (first line)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(',');
            if (parts.length >= 2) {
                const key = parts[0].toLowerCase().trim().replace(/"/g, '');
                const value = parseFloat(parts[1]);

                if (!isNaN(value) && key) {
                    data.set(key, value);
                }
            }
        }

        return data;
    }

    /**
     * Load and parse refined n-gram dictionary
     * Using embedded data to avoid require() issues in React Native
     */
    static async loadNGramDict(): Promise<Map<string, number>> {
        try {
            // Load from generated data file
            const { NGRAM_DATA } = require('./ngramData');
            const data = new Map<string, number>();

            Object.entries(NGRAM_DATA).forEach(([key, value]) => {
                data.set(key, value as number);
            });

            return data;
        } catch (error) {
            console.error('Failed to load n-gram dictionary:', error);
            return new Map();
        }
    }

    /**
     * Load cyberbullying tweets dataset
     */
    static async loadCyberbullyingTweets(): Promise<Array<{ text: string; type: string }>> {
        try {
            // Sample data
            return [
                { text: "Why are you even talking to us?", type: "cyberbullying" },
                { text: "Nobody asked for your opinion", type: "cyberbullying" },
                { text: "You are so stupid", type: "cyberbullying" },
                { text: "Go away loser", type: "cyberbullying" },
                { text: "Have a great day!", type: "not_cyberbullying" },
                { text: "Thanks for sharing", type: "not_cyberbullying" }
            ];
        } catch (error) {
            console.error('Failed to load cyberbullying tweets:', error);
            return [];
        }
    }
}
