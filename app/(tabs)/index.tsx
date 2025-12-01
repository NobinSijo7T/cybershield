import { darkTheme, lightTheme } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { BERTDetectionResult, bertDetector } from '@/services/bertDetector';
import { bytezAI, RecommendationAnalysis } from '@/services/bytezAI';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Animated Button Component
const AnimatedButton = ({
  onPress,
  style,
  children
}: {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// Waveform Animation Component
const Waveform = ({ isActive, color }: { isActive: boolean; color: string }) => {
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.5)).current;
  const bar3 = useRef(new Animated.Value(0.4)).current;
  const bar4 = useRef(new Animated.Value(0.6)).current;
  const bar5 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive) {
      const createWave = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration: 400 + Math.random() * 200,
              useNativeDriver: true,
            }),
          ])
        );
      };

      Animated.parallel([
        createWave(bar1, 0),
        createWave(bar2, 100),
        createWave(bar3, 50),
        createWave(bar4, 150),
        createWave(bar5, 200),
      ]).start();
    } else {
      bar1.setValue(0.3);
      bar2.setValue(0.5);
      bar3.setValue(0.4);
      bar4.setValue(0.6);
      bar5.setValue(0.3);
    }
  }, [isActive]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 16 }}>
      {[bar1, bar2, bar3, bar4, bar5].map((anim, index) => (
        <Animated.View
          key={index}
          style={{
            width: 3,
            height: 16,
            backgroundColor: color,
            borderRadius: 2,
            transform: [
              { scaleY: anim },
              { scaleX: anim }
            ]
          }}
        />
      ))}
    </View>
  );
};

// Encrypt Button with Scramble Effect
const TARGET_TEXT = "Analyze";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = "!@#$%^&*():{};|,.<>/?";

const EncryptButton = ({
  onPress,
  isAnalyzing,
  colors,
  buttonStyles
}: {
  onPress: () => void;
  isAnalyzing: boolean;
  colors: any;
  buttonStyles: any;
}) => {
  const [text, setText] = useState(TARGET_TEXT);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-100)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  const scramble = () => {
    let pos = 0;

    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }

          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          const randomChar = CHARS[randomCharIndex];

          return randomChar;
        })
        .join("");

      setText(scrambled);
      pos++;

      if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
        stopScramble();
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    clearInterval(intervalRef.current || undefined);
    setText(TARGET_TEXT);
  };

  useEffect(() => {
    if (isHovered) {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 100,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      shimmerAnim.setValue(-100);
    }
  }, [isHovered, shimmerAnim]);

  useEffect(() => {
    if (isAnalyzing) {
      const createDotAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animations = Animated.parallel([
        createDotAnimation(dot1Anim, 0),
        createDotAnimation(dot2Anim, 200),
        createDotAnimation(dot3Anim, 400),
      ]);

      animations.start();

      return () => {
        dot1Anim.setValue(0);
        dot2Anim.setValue(0);
        dot3Anim.setValue(0);
      };
    }
  }, [isAnalyzing, dot1Anim, dot2Anim, dot3Anim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
    setIsHovered(true);
    scramble();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
    setIsHovered(false);
    stopScramble();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isAnalyzing}
    >
      <Animated.View style={[
        buttonStyles.encryptButton,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <View style={buttonStyles.encryptGradient}>
          <View style={buttonStyles.encryptContent}>
            <Image
              source={require('@/public/analyze.png')}
              style={{ width: 20, height: 20, tintColor: '#fff' }}
              resizeMode="contain"
            />
            <Text style={buttonStyles.encryptText}>
              {isAnalyzing ? 'ENCRYPT_DATA' : text}
            </Text>
            {isAnalyzing && (
              <View style={buttonStyles.loadingDots}>
                <Animated.View style={[
                  buttonStyles.dot,
                  { opacity: dot1Anim }
                ]} />
                <Animated.View style={[
                  buttonStyles.dot,
                  { opacity: dot2Anim }
                ]} />
                <Animated.View style={[
                  buttonStyles.dot,
                  { opacity: dot3Anim }
                ]} />
              </View>
            )}
          </View>
          {isHovered && !isAnalyzing && (
            <Animated.View
              style={[
                buttonStyles.shimmer,
                {
                  transform: [{
                    translateY: shimmerAnim
                  }]
                }
              ]}
            />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Category Score Component
const CategoryScore = ({
  label,
  score,
  color
}: {
  label: string;
  score: number;
  color: string;
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color }}>
          {Math.round(score * 100)}%
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: colors.surfaceSecondary, borderRadius: 3, overflow: 'hidden' }}>
        <View
          style={{
            height: '100%',
            width: `${score * 100}%`,
            backgroundColor: color,
            borderRadius: 3
          }}
        />
      </View>
    </View>
  );
};

export default function SecurityScannerScreen() {
  const { isDark, toggleTheme } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;

  const [inputText, setInputText] = useState('');
  const [riskLevel, setRiskLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bertResult, setBertResult] = useState<BERTDetectionResult | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showMicDropdown, setShowMicDropdown] = useState(false);
  const [microphones, setMicrophones] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedMic, setSelectedMic] = useState<string>('Default Microphone');
  const [recommendation, setRecommendation] = useState<RecommendationAnalysis | null>(null);

  // Model selection: 'semantic' or 'bert'
  const [selectedModel, setSelectedModel] = useState<'semantic' | 'bert'>('semantic');

  // Category scores for graphs
  const [categoryScores, setCategoryScores] = useState({
    toxicity: 0,
    threat: 0,
    insult: 0,
    identity_hate: 0
  });

  // Speech recognition
  const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Scroll animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const isHeaderVisible = useRef(true);

  // Initialize the detector on mount
  useEffect(() => {
    const initDetector = async () => {
      try {
        // Mark as initialized immediately - we'll lazy-load when needed
        console.log('[App] App ready - detectors will lazy-load on first use');
        setIsInitialized(true);
        setSelectedModel('semantic'); // Default to semantic (no loading required)
      } catch (err) {
        console.error('Initialization error:', err);
        setIsInitialized(true);
        setSelectedModel('semantic');
      }
    };
    initDetector();

    // Load available microphones
    const loadMicrophones = async () => {
      try {
        if (Platform.OS === 'web') {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const mics = devices
            .filter(device => device.kind === 'audioinput')
            .map((device, index) => ({
              id: device.deviceId,
              label: device.label || `Microphone ${index + 1}`
            }));
          setMicrophones(mics.length > 0 ? mics : [{ id: 'default', label: 'Default Microphone' }]);
        } else {
          // For mobile, show a default option
          setMicrophones([
            { id: 'default', label: 'Default Microphone' },
            { id: 'internal', label: 'Internal Microphone' },
            { id: 'external', label: 'External Microphone' }
          ]);
        }
      } catch (err) {
        console.error('Failed to load microphones:', err);
        setMicrophones([{ id: 'default', label: 'Default Microphone' }]);
      }
    };
    loadMicrophones();
  }, []);

  // Update input text when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Pulsing animation for microphone when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const getRiskStatus = () => {
    if (!bertResult) {
      if (riskLevel <= 33) return { text: 'Low Risk', color: colors.success };
      if (riskLevel <= 66) return { text: 'Caution', color: colors.warning };
      return { text: 'Danger', color: colors.danger };
    }

    // Use BERT result
    if (bertResult.riskLevel <= 33) {
      return { text: 'Low Risk', color: colors.success };
    } else if (bertResult.riskLevel <= 66) {
      return { text: 'Caution', color: colors.warning };
    } else {
      return { text: 'Danger', color: colors.danger };
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      Alert.alert('No Input', 'Please enter some text to analyze');
      return;
    }

    if (!isInitialized) {
      Alert.alert('Loading', 'The detector is still initializing. Please wait...');
      return;
    }

    setIsAnalyzing(true);
    setRecommendation(null);
    setBertResult(null);
    setRiskLevel(0);
    setCategoryScores({ toxicity: 0, threat: 0, insult: 0, identity_hate: 0 });

    try {
      console.log(`Analyzing text with ${selectedModel} model:`, inputText);

      let detectionResult: BERTDetectionResult;
      let categories = { toxicity: 0, threat: 0, insult: 0, identity_hate: 0 };

      if (selectedModel === 'bert') {
        // Lazy-load BERT if not already loaded
        if (!bertDetector.isLoaded()) {
          console.log('[App] Lazy-loading BERT detector...');
          try {
            await bertDetector.initialize();
            if (!bertDetector.isLoaded()) {
              console.warn('[App] BERT failed to load, falling back to semantic');
              setSelectedModel('semantic');
            }
          } catch (bertErr) {
            console.error('[App] BERT initialization failed:', bertErr);
            Alert.alert('Model Switch', 'BERT model unavailable. Using semantic detector.');
            setSelectedModel('semantic');
          }
        }

        if (bertDetector.isLoaded()) {
          // Use BERT model
          console.log('[App] Using BERT detector');
          detectionResult = await bertDetector.analyzeText(inputText);

          // For BERT, we don't have category breakdowns, so estimate from severity
          const severity = detectionResult.severity;
          categories = {
            toxicity: severity * 0.8,
            threat: severity * 0.6,
            insult: severity * 0.7,
            identity_hate: severity * 0.4
          };
        }
      }
      
      if (selectedModel === 'semantic' || !bertDetector.isLoaded()) {
        // Use Semantic detector
        console.log('[App] Using Semantic detector');
        const { cyberbullyDetector } = require('@/services/semanticDetector');
        
        // Lazy-load CSV data on first use
        if (!cyberbullyDetector.hasCSVData()) {
          console.log('[App] Lazy-loading CSV data...');
          try {
            const { Asset } = require('expo-asset');
            const csvAsset = Asset.fromModule(require('../../assets/data/refined_ngram_dict.csv'));
            await csvAsset.downloadAsync();
            
            if (csvAsset.localUri) {
              const response = await fetch(csvAsset.localUri);
              const csvContent = await response.text();
              await cyberbullyDetector.loadCSVData(csvContent);
              console.log('[App] CSV data loaded successfully');
            }
          } catch (csvErr) {
            console.warn('[App] CSV loading failed, using patterns only:', csvErr);
          }
        }
        
        const semanticResult = cyberbullyDetector.classify(inputText);
        console.log('Semantic detection result:', semanticResult);

        // Convert semantic result to BERT-like format
        detectionResult = {
          isCyberbullying: semanticResult.label === 'CYBERBULLY',
          confidence: semanticResult.score,
          severity: semanticResult.score,
          riskLevel: Math.round(semanticResult.score * 100),
          probabilities: [1 - semanticResult.score, semanticResult.score],
          processingTime: 0
        };

        // Calculate category scores from semantic matches
        categories = calculateCategoryScores(semanticResult);
      }

      setBertResult(detectionResult);
      setRiskLevel(detectionResult.riskLevel);
      setCategoryScores(categories);

      // Generate recommendation using BytezAI (word-by-word analysis)
      console.log('Generating recommendation with BytezAI...');
      const recommendationResult = await bytezAI.generateRecommendation(inputText);
      console.log('BytezAI recommendation:', recommendationResult);
      setRecommendation(recommendationResult);

      // Show alert if cyberbullying detected
      if (detectionResult.isCyberbullying && detectionResult.severity >= 0.6) {
        Alert.alert(
          '⚠️ Cyberbullying Detected',
          recommendationResult.recommendation,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Analysis error:', err);
      Alert.alert('Error', 'Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to calculate category scores from semantic results
  const calculateCategoryScores = (semanticResult: any) => {
    const matches = semanticResult.semanticMatches || [];
    const wordAnalysis = semanticResult.wordAnalysis || [];
    const score = semanticResult.score;

    let toxicity = 0;
    let threat = 0;
    let insult = 0;
    let identity_hate = 0;

    // 1. Analyze semantic matches (high confidence)
    matches.forEach((match: string) => {
      const lowerMatch = match.toLowerCase();

      if (lowerMatch.includes('threat') || lowerMatch.includes('violence') ||
        lowerMatch.includes('death') || lowerMatch.includes('harm') ||
        lowerMatch.includes('weapon') || lowerMatch.includes('critical')) {
        threat = Math.max(threat, score * 0.9);
        toxicity = Math.max(toxicity, score * 0.8);
      }

      if (lowerMatch.includes('insult') || lowerMatch.includes('worth') ||
        lowerMatch.includes('shaming') || lowerMatch.includes('embarrass') ||
        lowerMatch.includes('intelligence') || lowerMatch.includes('competence')) {
        insult = Math.max(insult, score * 0.85);
        toxicity = Math.max(toxicity, score * 0.7);
      }

      if (lowerMatch.includes('hate') || lowerMatch.includes('discrimin') ||
        lowerMatch.includes('racist') || lowerMatch.includes('sexist')) {
        identity_hate = Math.max(identity_hate, score * 0.95);
        toxicity = Math.max(toxicity, score * 0.9);
      }

      // General toxicity from any match
      toxicity = Math.max(toxicity, score * 0.5);
    });

    // 2. Analyze individual words (granular detail)
    if (wordAnalysis && wordAnalysis.length > 0) {
      wordAnalysis.forEach((word: any) => {
        if (word.isToxic) {
          const severityScore = word.severity === 'critical' ? 1.0 :
            word.severity === 'high' ? 0.8 :
              word.severity === 'medium' ? 0.6 : 0.4;

          if (word.categories.includes('threat') || word.categories.includes('violence')) {
            threat = Math.max(threat, severityScore);
            toxicity = Math.max(toxicity, severityScore * 0.9);
          }
          if (word.categories.includes('insult')) {
            insult = Math.max(insult, severityScore);
            toxicity = Math.max(toxicity, severityScore * 0.8);
          }
          if (word.categories.includes('toxicity')) {
            toxicity = Math.max(toxicity, severityScore);
          }
        }
      });
    }

    // 3. Fallback/Baseline based on overall score
    if (score > 0.5) {
      toxicity = Math.max(toxicity, score * 0.6); // Baseline toxicity for high scores
    }

    // Ensure scores are within 0-1 range
    return {
      toxicity: Math.min(toxicity, 1),
      threat: Math.min(threat, 1),
      insult: Math.min(insult, 1),
      identity_hate: Math.min(identity_hate, 1)
    };
  };

  const handleMicPress = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY.current;

    // Only trigger animation if scroll delta is significant (> 5px)
    if (Math.abs(scrollDelta) < 5) {
      return;
    }

    if (currentScrollY > 50 && scrollDelta > 0 && isHeaderVisible.current) {
      // Scrolling down - hide header
      isHeaderVisible.current = false;
      Animated.timing(headerHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else if (scrollDelta < 0 && !isHeaderVisible.current) {
      // Scrolling up - show header
      isHeaderVisible.current = true;
      Animated.timing(headerHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };

  const status = getRiskStatus();
  const styles = createStyles(colors);

  const headerAnimatedStyle = {
    height: headerHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 110],
    }),
    opacity: headerHeight,
    overflow: 'hidden' as const,
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={32} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>CyberShield AI</Text>
            <Text style={styles.headerSubtitle}>AI threat detection</Text>
          </View>
        </View>

        <AnimatedButton onPress={toggleTheme} style={styles.themeButton}>
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={24}
            color={colors.primary}
          />
        </AnimatedButton>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Input Section */}
          <View style={styles.inputContainer}>
            <Ionicons name="search" size={24} color={colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Paste suspicious text here..."
              placeholderTextColor={colors.textTertiary}
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
          </View>

          {/* Listening Indicator */}
          {isListening && (
            <View style={styles.listeningIndicator}>
              <Waveform isActive={isListening} color={colors.danger} />
              <Text style={styles.listeningText}>Listening...</Text>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Model Selector */}
          <View style={styles.modelSelectorContainer}>
            <Text style={styles.modelSelectorLabel}>Detection Model:</Text>
            <View style={styles.modelSelector}>
              <TouchableOpacity
                style={[
                  styles.modelOption,
                  selectedModel === 'semantic' && styles.modelOptionActive,
                  { backgroundColor: selectedModel === 'semantic' ? colors.primary + '20' : colors.surfaceSecondary }
                ]}
                onPress={() => setSelectedModel('semantic')}
              >
                <Ionicons
                  name="analytics"
                  size={18}
                  color={selectedModel === 'semantic' ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.modelOptionText,
                  { color: selectedModel === 'semantic' ? colors.primary : colors.textSecondary }
                ]}>
                  Semantic
                </Text>
                {selectedModel === 'semantic' && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modelOption,
                  selectedModel === 'bert' && styles.modelOptionActive,
                  { backgroundColor: selectedModel === 'bert' ? colors.primary + '20' : colors.surfaceSecondary },
                  !bertDetector.isLoaded() && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (bertDetector.isLoaded()) {
                    setSelectedModel('bert');
                  } else {
                    Alert.alert('BERT Model Not Available', 'The BERT model failed to load. Using Semantic model instead.');
                  }
                }}
                disabled={!bertDetector.isLoaded()}
              >
                <Ionicons
                  name="hardware-chip"
                  size={18}
                  color={selectedModel === 'bert' ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.modelOptionText,
                  { color: selectedModel === 'bert' ? colors.primary : colors.textSecondary }
                ]}>
                  BERT {!bertDetector.isLoaded() && '(Unavailable)'}
                </Text>
                {selectedModel === 'bert' && bertDetector.isLoaded() && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Analyze Button */}
          <View style={styles.buttonRow}>
            <EncryptButton
              onPress={handleAnalyze}
              isAnalyzing={isAnalyzing}
              colors={colors}
              buttonStyles={styles}
            />
          </View>

          {/* Mic Button */}
          <View style={styles.micButtonContainer}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <AnimatedButton onPress={handleMicPress} style={styles.micButton}>
                <View style={styles.micButtonContent}>
                  <Animated.View style={{ transform: [{ scale: isListening ? pulseAnim : 1 }] }}>
                    <Ionicons
                      name={isListening ? "mic" : "mic-outline"}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Animated.View>
                  <Text style={styles.micButtonText}>
                    {isListening ? "Recording..." : "Speak"}
                  </Text>
                </View>
              </AnimatedButton>
              <TouchableOpacity
                onPress={() => setShowMicDropdown(!showMicDropdown)}
                style={styles.micDropdownButton}
              >
                <Ionicons
                  name={showMicDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Dropdown Menu */}
            {showMicDropdown && (
              <View style={styles.micDropdownMenu}>
                {microphones.map((mic) => (
                  <TouchableOpacity
                    key={mic.id}
                    style={styles.micDropdownItem}
                    onPress={() => {
                      setSelectedMic(mic.label);
                      setShowMicDropdown(false);
                    }}
                  >
                    <Ionicons
                      name="mic"
                      size={16}
                      color={selectedMic === mic.label ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                      styles.micDropdownText,
                      selectedMic === mic.label && { color: colors.primary, fontWeight: '600' }
                    ]}>
                      {mic.label}
                    </Text>
                    {selectedMic === mic.label && (
                      <Ionicons name="checkmark" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Risk Status */}
          <View style={styles.riskHeader}>
            <View style={styles.riskLabelContainer}>
              <Ionicons name="shield-checkmark" size={20} color={status.color} />
              <Text style={[styles.riskLabel, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
            <Text style={styles.riskPercentage}>{riskLevel}%</Text>
          </View>

          {/* Risk Bar */}
          <View style={styles.riskBarContainer}>
            <View style={styles.riskBarBackground}>
              <LinearGradient
                colors={[colors.success, colors.warning, colors.danger]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.riskBarGradient}
              />
            </View>
            <View style={[styles.riskIndicator, { left: `${riskLevel}%` as any }]} />
          </View>

          {/* Risk Labels */}
          <View style={styles.riskLabels}>
            <Text style={styles.riskLabelText}>Safe</Text>
            <Text style={styles.riskLabelText}>Caution</Text>
            <Text style={styles.riskLabelText}>Danger</Text>
          </View>

          {/* BERT Detection Results */}
          {bertResult && (
            <>
              <View style={styles.divider} />
              <View style={styles.aiAnalysisHeader}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                <Text style={styles.aiAnalysisTitle}>AI Detection</Text>
              </View>

              {bertResult.isCyberbullying ? (
                <View style={styles.aiResultCard}>
                  <View style={[styles.aiResultHeader, { backgroundColor: colors.danger + '15' }]}>
                    <Ionicons name="alert-circle" size={24} color={colors.danger} />
                    <Text style={[styles.aiResultTitle, { color: colors.danger }]}>
                      Cyberbullying Detected
                    </Text>
                  </View>

                  <View style={styles.aiDetailRow}>
                    <Text style={styles.aiDetailLabel}>Confidence:</Text>
                    <Text style={styles.aiDetailValue}>{Math.round(bertResult.confidence * 100)}%</Text>
                  </View>

                  <View style={styles.aiDetailRow}>
                    <Text style={styles.aiDetailLabel}>Severity:</Text>
                    <Text style={styles.aiDetailValue}>{Math.round(bertResult.severity * 100)}%</Text>
                  </View>

                  <View style={styles.aiDetailRow}>
                    <Text style={styles.aiDetailLabel}>Processing Time:</Text>
                    <Text style={styles.aiDetailValue}>{bertResult.processingTime}ms</Text>
                  </View>

                  {/* Category Scores */}
                  <View style={styles.divider} />
                  <Text style={styles.analysisTitle}>Category Breakdown</Text>
                  <View style={styles.categoryScores}>
                    <CategoryScore
                      label="Toxicity"
                      score={categoryScores.toxicity}
                      color={colors.danger}
                    />
                    <CategoryScore
                      label="Threats"
                      score={categoryScores.threat}
                      color={colors.warning}
                    />
                    <CategoryScore
                      label="Insults"
                      score={categoryScores.insult}
                      color={colors.primary}
                    />
                    <CategoryScore
                      label="Hate Speech"
                      score={categoryScores.identity_hate}
                      color={colors.danger}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.aiResultCard}>
                  <View style={[styles.aiResultHeader, { backgroundColor: colors.success + '15' }]}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    <Text style={[styles.aiResultTitle, { color: colors.success }]}>
                      No Cyberbullying Detected
                    </Text>
                  </View>

                  <View style={styles.aiDetailRow}>
                    <Text style={styles.aiDetailLabel}>Confidence:</Text>
                    <Text style={styles.aiDetailValue}>{Math.round(bertResult.confidence * 100)}%</Text>
                  </View>

                  <View style={styles.aiDetailRow}>
                    <Text style={styles.aiDetailLabel}>Processing Time:</Text>
                    <Text style={styles.aiDetailValue}>{bertResult.processingTime}ms</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {/* BytezAI Recommendations */}
          {recommendation && (
            <>
              <View style={styles.divider} />
              <View style={styles.recommendationBox}>
                <View style={styles.recommendationHeader}>
                  <Ionicons name="information-circle" size={18} color={colors.primary} />
                  <Text style={styles.recommendationTitle}>What to do next:</Text>
                </View>
                <Text style={styles.recommendationText}>{recommendation.recommendation}</Text>

                {recommendation.wordAnalysis && recommendation.wordAnalysis.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.aiDetailLabel, { marginBottom: 8 }]}>
                      Detected {recommendation.wordAnalysis.filter(w => w.isToxic).length} toxic word(s)
                    </Text>
                    {recommendation.detectedCategories.length > 0 && (
                      <Text style={styles.contextText}>
                        Categories: {recommendation.detectedCategories.join(', ')}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
          <Text style={styles.footerText}>
            AI-powered • Your data stays private
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof lightTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  themeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    overflow: 'visible',
  },
  inputContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  searchIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  listeningText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
  },
  modelSelectorContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  modelSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  modelSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  modelOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modelOptionActive: {
    borderColor: colors.primary,
  },
  modelOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 20,
  },
  micButtonContainer: {
    position: 'relative',
    zIndex: 999,
    width: '100%',
    marginTop: 12,
  },
  encryptButton: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  encryptGradient: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  encryptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  encryptText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    zIndex: 0,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  analyzeButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  analyzeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  micButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  micDropdownButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  micDropdownMenu: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 999,
    zIndex: 9999,
    overflow: 'hidden',
  },
  micDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  micDropdownText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  micButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    gap: 12,
  },
  micButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  micButtonIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  riskPercentage: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  riskBarContainer: {
    marginBottom: 12,
  },
  riskBarBackground: {
    height: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  riskBarGradient: {
    height: '100%',
    width: '100%',
  },
  riskIndicator: {
    position: 'absolute',
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  riskLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskLabelText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  categoryPill: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  categoryScores: {
    gap: 12,
  },
  categoryScore: {
    gap: 6,
  },
  categoryScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryScoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryScoreValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryScoreBar: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryScoreFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confidenceText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  aiAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  aiAnalysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  aiResultCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  aiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  aiResultTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  aiDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aiDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  aiDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  severityBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recommendationBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contextBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contextTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  contextText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
