# BERT Detector - Comprehensive Logging Added

## Changes Made to services/bertDetector.ts

### 1. Vocabulary Loading Verification
```
[BERT Detector] Vocab loaded: 30522 tokens
[BERT Detector] ✓ Tokenizer initialized successfully with 30522 vocab tokens
```
- Now verifies vocab.txt has expected size (~30,000 tokens)
- Throws error if vocab is too small (< 1000 tokens)
- Logs exact token count

### 2. analyzeText() Entry Point Logging
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BERT Detector] ▶ analyzeText() called
[BERT Detector] Input text: "you are stupid"
[BERT Detector] Input length: 14 chars
[BERT Detector] Model loaded: true
```
- Shows when BERT is called
- Displays the exact input text received
- Shows model initialization status

### 3. Tokenization Step
```
[BERT Detector] ━━ STEP 1: TOKENIZATION ━━
[BERT Detector] Tokenizing: "you are stupid"
[BERT Detector] ✓ Tokenization complete
[BERT Detector] Total tokens: 128
[BERT Detector] First 20 tokens: ["[CLS]","you","are","stupid","[SEP]","[PAD]",...]
[BERT Detector] First 20 token IDs: [101,2017,2024,5236,102,0,0,...]
```
- Shows tokenization process
- Displays first 20 tokens (human-readable)
- Displays first 20 token IDs (numeric)

### 4. Model Inference
```
[BERT Detector] ━━ STEP 2: MODEL INFERENCE ━━
[BERT Detector] Input shape: [1, 128]
[BERT Detector] Attention mask active tokens: 5
[BERT Detector] Running model inference...
[BERT Detector] ✓ Inference completed in 45ms
```
- Shows input tensor shape
- Counts active (non-padded) tokens
- Measures inference time

### 5. Output Processing & Label Detection
```
[BERT Detector] ━━ STEP 3: OUTPUT PROCESSING ━━
[BERT Detector] Raw logits: [-2.3456,3.1234]
[BERT Detector] Logit[0] (class 0): -2.3456
[BERT Detector] Logit[1] (class 1): 3.1234
[BERT Detector] Logit range: 5.4690
[BERT Detector] Probabilities after softmax: ["0.0045","0.9955"]
[BERT Detector] P(class 0): 0.45%
[BERT Detector] P(class 1): 99.55%
```
- Shows raw logits from model
- Calculates logit range (warns if too small)
- Shows softmax probabilities

### 6. Label Interpretation
```
[BERT Detector] Label encoding: STANDARD (1=bully, 0=safe)
[BERT Detector] Bullying probability: 99.55%
[BERT Detector] Safe probability: 0.45%
[BERT Detector] Classification: 🚨 CYBERBULLYING
```
- Shows which label encoding is used
- Displays interpreted probabilities
- Final classification with emoji indicator

### 7. Final Result Summary
```
[BERT Detector] ━━ FINAL RESULT ━━
[BERT Detector] Confidence: 99.55%
[BERT Detector] Severity: 99.6%
[BERT Detector] Risk Level: 100/100
[BERT Detector] Processing time: 52ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- Summary of final results
- Total processing time

## How to Use

### Rebuild APK
```bash
cd /home/nobin/cybershield/android
./gradlew :app:assembleRelease
```

### View Logs on Device
```bash
# Connect device via USB, enable USB debugging
adb devices

# Filter BERT logs only
adb logcat | grep "BERT Detector"

# Filter both BERT and Semantic logs
adb logcat | grep -E "BERT Detector|Semantic Detector"

# Save logs to file
adb logcat | grep "BERT Detector" > bert_logs.txt
```

## What to Check

### ✅ If Working Correctly:
- Vocab size should be ~30,000 tokens
- Tokenization shows proper BERT tokens like `["[CLS]","you","are","stupid","[SEP]"]`
- Logit range should be > 0.5 (typically 2-10)
- Probabilities should sum to ~1.0
- Classification should match expected result

### ❌ If Not Working:
**Vocab not loading:**
- Check: `[BERT Detector] Vocab loaded: X tokens`
- Expected: 30000-32000 tokens
- If < 1000: vocab.txt file is corrupted or missing

**Model always says "SAFE":**
- Check: Probabilities after softmax
- If P(class 0) ≈ 50%, P(class 1) ≈ 50%: Model outputs are random
- Check: Logit range
- If range < 0.01: Model is not working (collapsed outputs)
- **Solution**: Try flipping label encoding by setting `USE_REVERSED_LABELS = true`

**Tokenization issues:**
- Check: First 20 tokens
- Should show proper BERT tokens, not raw text
- If tokens look wrong: Tokenizer issue

## Configuration

### Label Encoding (Line ~26)
```typescript
const USE_REVERSED_LABELS = false;  // Set to true if model uses 0=bullying, 1=safe
```

**How to test which encoding is correct:**
1. Try a clear bullying text: "kill yourself"
2. Check which probability is higher:
   - If P(class 1) is high → Use `USE_REVERSED_LABELS = false` (default)
   - If P(class 0) is high → Use `USE_REVERSED_LABELS = true`
