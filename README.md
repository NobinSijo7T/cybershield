# CyberShield 🛡️

An AI-powered cyberbullying detection app built with Expo and React Native, featuring BERT-based deep learning detection.

## Features

✨ **Real-time Detection** - Analyze text for cyberbullying patterns instantly  
🧠 **BERT AI Model** - Deep learning-based detection using TensorFlow Lite  
📊 **Multi-Category Analysis** - Detects toxicity, threats, insults, and hate speech  
🎯 **Risk Scoring** - 0-100 risk level with confidence scores  
🗣️ **Voice Input** - Speech-to-text support for hands-free analysis  
🎨 **Modern UI** - Beautiful, animated interface with dark mode  
🔒 **Privacy-First** - All analysis happens on-device, no data sent to servers

## Get Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- Android SDK (for Android builds)
- BERT model files (see Model Setup below)

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

3. **Model Setup (Required for BERT Detection)**

   Download the BERT cyberbullying model and copy it to the following directories:

   **For Development:**
   ```bash
   # Place model files in:
   assets/models/cyberbully_model.tflite
   assets/models/vocab.txt
   ```

   **For Android Release Build:**
   ```bash
   # Also copy to Android assets:
   android/app/src/main/assets/models/cyberbully_model.tflite
   android/app/src/main/assets/models/vocab.txt
   ```

   > **Note:** The model files are not included in the repository due to their size (106MB). You need to download them separately or train your own BERT model.

4. **Start the app**

   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app (mobile)

## How It Works

CyberShield uses a **dual detection system** combining semantic pattern matching with BERT deep learning:

1. **Text Input** - User enters text via typing or voice
2. **Dual Analysis** - System uses both semantic patterns and BERT model
3. **Risk Calculation** - Generates 0-100 risk score
4. **Results Display** - Shows detailed breakdown with confidence

### Detection Methods

#### 1. Semantic Pattern Detection (Always Active)
- 100+ regex patterns for common cyberbullying phrases
- N-gram dictionary with contextual analysis
- Fast, lightweight, works without model files

#### 2. BERT Deep Learning (Requires Model Files)
- 106MB fine-tuned BERT model for accurate detection
- TensorFlow Lite for on-device inference
- Requires `cyberbully_model.tflite` and `vocab.txt`

### Detection Categories

| Category | Description | Risk Indicators |
|----------|-------------|----------------|
| **Toxicity** | Harmful, rude language | "hate", "stupid", aggressive punctuation |
| **Threats** | Violent or threatening content | "kill", "hurt", "attack" |
| **Insults** | Personal attacks | "ugly", "loser", "worthless" |
| **Hate Speech** | Identity-based discrimination | "racist", "sexist", slurs |

## Building Android APK with BERT Support

To build a release APK with native BERT detection:

### Option 1: Development Build (Recommended)

```bash
# 1. Install dependencies (already done in installation)
npm install

# 2. Copy BERT model files to Android assets
mkdir -p android/app/src/main/assets/models
cp assets/models/cyberbully_model.tflite android/app/src/main/assets/models/
cp assets/models/vocab.txt android/app/src/main/assets/models/

# 3. Build APK with Expo dev client (native modules enabled)
cd android
./gradlew :app:assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### Option 2: Without BERT (Semantic Detection Only)

The app works perfectly with just semantic detection (no model files needed):
```bash
cd android
./gradlew :app:assembleRelease
```

> **Note:** BERT model requires `expo-dev-client` for native TensorFlow Lite support. Standard Expo Go does not support native modules.

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

✅ **Dual Detection System** - Semantic patterns + BERT deep learning  
✅ **On-Device AI** - TensorFlow Lite for fast inference  
✅ **No Cloud Required** - All processing happens locally  
✅ **Voice Input** - Speech-to-text integration  
✅ **Cross-Platform** - Android APK with native module support

## APK Download

📦 **Latest Release APK** (346MB with BERT model): [Download here](#)

> Includes all dependencies and BERT model for immediate use. No additional setup required.

## Future Enhancements

- [ ] Multi-language support
- [ ] Context-aware conversation analysis
- [ ] User feedback and model fine-tuning
- [ ] Real-time monitoring for chat apps
- [ ] iOS build with native TFLite support
- [ ] Custom sensitivity settings
- [ ] Analysis history and reports
- [ ] Integration SDK for other apps

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
