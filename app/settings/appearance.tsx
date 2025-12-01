import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ThemeOptionProps {
    title: string;
    icon: any;
    iconBg: readonly [string, string, ...string[]];
    selected: boolean;
    onPress: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
    title,
    icon,
    iconBg,
    selected,
    onPress,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Pressable
            style={({ pressed }) => [
                styles.themeOption,
                selected && styles.themeOptionSelected,
                { backgroundColor: isDark ? '#2C2C3E' : '#F5F5F5' },
                pressed && styles.pressed,
            ]}
            onPress={onPress}
        >
            <LinearGradient
                colors={iconBg}
                style={styles.themeIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <IconSymbol name={icon} size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.themeTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                {title}
            </Text>
            {selected && (
                <View style={styles.checkmark}>
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#9C64E8" />
                </View>
            )}
        </Pressable>
    );
};

interface ColorOptionProps {
    color: string;
    selected: boolean;
    onPress: () => void;
}

const ColorOption: React.FC<ColorOptionProps> = ({ color, selected, onPress }) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.colorOption,
                { backgroundColor: color },
                selected && styles.colorOptionSelected,
                pressed && styles.pressed,
            ]}
            onPress={onPress}
        >
            {selected && (
                <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
            )}
        </Pressable>
    );
};

export default function AppearanceScreen() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const router = useRouter();

    const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const [accentColor, setAccentColor] = useState('#9C64E8');

    const accentColors = [
        '#9C64E8', // Purple (default)
        '#4169E1', // Blue
        '#32CD32', // Green
        '#FF6B9D', // Pink
        '#FFD700', // Gold
        '#00CED1', // Cyan
        '#FF4500', // Orange-Red
        '#8A2BE2', // Blue-Violet
    ];

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
        setSelectedTheme(newTheme);
        if (newTheme === 'light' && theme === 'dark') {
            toggleTheme();
        } else if (newTheme === 'dark' && theme === 'light') {
            toggleTheme();
        }
        // Auto theme would require system theme detection
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0A0A1F' : '#F5F5F5' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                    Appearance
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Theme Selection */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        THEME
                    </Text>

                    <View style={styles.themeOptions}>
                        <ThemeOption
                            title="Light"
                            icon="sun.max.fill"
                            iconBg={['#FFB74D', '#FFA726']}
                            selected={selectedTheme === 'light'}
                            onPress={() => handleThemeChange('light')}
                        />

                        <ThemeOption
                            title="Dark"
                            icon="moon.fill"
                            iconBg={['#4A4AFF', '#6B6BFF']}
                            selected={selectedTheme === 'dark'}
                            onPress={() => handleThemeChange('dark')}
                        />

                        <ThemeOption
                            title="Auto"
                            icon="circle.lefthalf.filled"
                            iconBg={['#9C64E8', '#B388FF']}
                            selected={selectedTheme === 'auto'}
                            onPress={() => handleThemeChange('auto')}
                        />
                    </View>
                </View>

                {/* Accent Color */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        ACCENT COLOR
                    </Text>

                    <View style={styles.colorGrid}>
                        {accentColors.map((color) => (
                            <ColorOption
                                key={color}
                                color={color}
                                selected={accentColor === color}
                                onPress={() => setAccentColor(color)}
                            />
                        ))}
                    </View>
                </View>

                {/* Display Options */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        DISPLAY OPTIONS
                    </Text>

                    <Pressable style={styles.displayOption}>
                        <View style={styles.displayLeft}>
                            <LinearGradient
                                colors={['#32CD32', '#228B22']}
                                style={styles.displayIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <IconSymbol name="textformat.size" size={20} color="#FFFFFF" />
                            </LinearGradient>
                            <View>
                                <Text style={[styles.displayTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                                    Text Size
                                </Text>
                                <Text style={[styles.displaySubtitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                                    Medium
                                </Text>
                            </View>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={isDark ? '#808080' : '#9E9E9E'} />
                    </Pressable>

                    <Pressable style={styles.displayOption}>
                        <View style={styles.displayLeft}>
                            <LinearGradient
                                colors={['#4169E1', '#6495ED']}
                                style={styles.displayIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <IconSymbol name="sparkles" size={20} color="#FFFFFF" />
                            </LinearGradient>
                            <View>
                                <Text style={[styles.displayTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                                    Animations
                                </Text>
                                <Text style={[styles.displaySubtitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                                    Enabled
                                </Text>
                            </View>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={isDark ? '#808080' : '#9E9E9E'} />
                    </Pressable>

                    <Pressable style={styles.displayOption}>
                        <View style={styles.displayLeft}>
                            <LinearGradient
                                colors={['#FF6B9D', '#FF1493']}
                                style={styles.displayIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <IconSymbol name="app.badge.fill" size={20} color="#FFFFFF" />
                            </LinearGradient>
                            <View>
                                <Text style={[styles.displayTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                                    App Icon
                                </Text>
                                <Text style={[styles.displaySubtitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                                    Default
                                </Text>
                            </View>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={isDark ? '#808080' : '#9E9E9E'} />
                    </Pressable>
                </View>

                {/* Info Section */}
                <View style={[styles.infoSection, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <LinearGradient
                        colors={['#9C64E8', '#B388FF']}
                        style={styles.infoIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <IconSymbol name="paintbrush.fill" size={20} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.infoText, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        Customize the app's appearance to match your preferences and improve your experience
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 16,
    },
    themeOptions: {
        gap: 12,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeOptionSelected: {
        borderColor: '#9C64E8',
    },
    themeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    themeTitle: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    checkmark: {
        marginLeft: 8,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    colorOptionSelected: {
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    displayOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(128, 128, 128, 0.15)',
    },
    displayLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    displayIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    displayTitle: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    displaySubtitle: {
        fontSize: 13,
        opacity: 0.8,
    },
    pressed: {
        opacity: 0.6,
    },
    infoSection: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    infoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});
