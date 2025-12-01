# CyberShield 🛡️

An AI-powered cyberbullying detection app built with Expo and React Native.

## Features

✨ **Real-time Detection** - Analyze text for cyberbullying patterns instantly  
📊 **Multi-Category Analysis** - Detects toxicity, threats, insults, and hate speech  
🎯 **Risk Scoring** - 0-100 risk level with confidence scores  
🗣️ **Voice Input** - Speech-to-text support for hands-free analysis  
🎨 **Modern UI** - Beautiful, animated interface with dark mode  
🔒 **Privacy-First** - All analysis happens on-device, no data sent to servers

## Get Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator, Android Emulator, or Expo Go app

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/NobinSijo7T/cybershield.git
   cd cybershield
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the app**

   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app (mobile)

## How It Works

CyberShield uses **heuristic analysis** with keyword pattern matching to detect cyberbullying in real-time:

1. **Text Input** - User enters text via typing or voice
2. **Analysis** - System analyzes across 4 categories
3. **Risk Calculation** - Generates 0-100 risk score
4. **Results Display** - Shows detailed breakdown with confidence

### Detection Categories

| Category | Description | Risk Indicators |
|----------|-------------|----------------|
| **Toxicity** | Harmful, rude language | "hate", "stupid", aggressive punctuation |
| **Threats** | Violent or threatening content | "kill", "hurt", "attack" |
| **Insults** | Personal attacks | "ugly", "loser", "worthless" |
| **Hate Speech** | Identity-based discrimination | "racist", "sexist", slurs |

## Important Note About Model Files

⚠️ **The large ML model files are NOT included in this repository** due to GitHub's file size limits:
- `model.safetensors` (417 MB)
- `vocab.txt` (1.5 MB)

**✅ The app works perfectly without these files** using heuristic analysis (keyword-based detection).

For anyone cloning/forking this repo: **No additional setup needed!** Just `npm install` and you're ready to go.

See [README_MODEL_SETUP.md](README_MODEL_SETUP.md) for details on how to obtain and use the full ML model if desired in the future.

## Project Structure

```
cybershield/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   │   ├── index.tsx      # Main security scanner
│   │   └── explore.tsx    # Info/help screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── services/              # Business logic
│   ├── cyberDetector.ts   # Cyberbullying detection service
│   └── tokenizer.ts       # BERT tokenization (future use)
├── contexts/              # React contexts (theme, etc.)
├── hooks/                 # Custom React hooks
├── constants/             # Theme and constants
└── cyber_detector/        # Model configuration files
    ├── config.json
    ├── tokenizer_config.json
    └── special_tokens_map.json
```

## Usage

### Basic Example

```typescript
import { cyberDetector } from '@/services/cyberDetector';

// Initialize once
await cyberDetector.initialize();

// Analyze text
const result = await cyberDetector.analyzeText("Your text here");

console.log(result.riskLevel);        // 0-100
console.log(result.isCyberbullying);  // boolean
console.log(result.categories);       // detailed scores
```

## Documentation

- [Cyber Detector Integration Guide](CYBER_DETECTOR_GUIDE.md)
- [Model Setup Instructions](README_MODEL_SETUP.md) - **Important for ML model files**
- [Speech Recognition Guide](SPEECH_TO_TEXT_GUIDE.md)
- [Theme & Animations](THEME_ANIMATIONS_GUIDE.md)
- [Boot Splash Setup](BOOTSPLASH_INTEGRATION.md)

## Technologies Used

- **Expo** - Cross-platform development framework
- **React Native** - Mobile app framework
- **TypeScript** - Type-safe development
- **Expo Speech Recognition** - Voice input
- **BERT Tokenizer** - Text preprocessing (prepared for ML model)

## Current Implementation

✅ **Fully Functional** - Uses heuristic analysis for real-time detection  
✅ **No Setup Required** - Works immediately after `npm install`  
✅ **Lightweight** - No large file downloads needed  
⚠️ **Keyword-Based** - Less accurate than deep learning model

## Future Enhancements

- [ ] TensorFlow.js integration for actual BERT model inference
- [ ] Multi-language support
- [ ] Context-aware analysis
- [ ] User feedback and learning
- [ ] Real-time monitoring for chat apps
- [ ] Cloud-based ML API option
- [ ] Custom sensitivity settings
- [ ] Analysis history and reports

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- BERT model architecture by Google Research
- Expo team for excellent development tools
- React Native community

## Author

**NobinSijo7T**
- GitHub: [@NobinSijo7T](https://github.com/NobinSijo7T)

---

Made with ❤️ for a safer digital world
