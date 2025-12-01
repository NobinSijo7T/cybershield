import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

interface SecurityToggleProps {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

const SecurityToggle: React.FC<SecurityToggleProps> = ({
    title,
    subtitle,
    value,
    onValueChange,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <View style={styles.toggleItem}>
            <View style={styles.toggleLeft}>
                <Text style={[styles.toggleTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                    {title}
                </Text>
                <Text style={[styles.toggleSubtitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                    {subtitle}
                </Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: '#9C64E8' }}
                thumbColor={value ? '#B388FF' : '#F5F5F5'}
                ios_backgroundColor="#767577"
            />
        </View>
    );
};

interface SecurityActionProps {
    icon: any;
    iconBg: readonly [string, string, ...string[]];
    title: string;
    subtitle: string;
    onPress: () => void;
    showChevron?: boolean;
}

const SecurityAction: React.FC<SecurityActionProps> = ({
    icon,
    iconBg,
    title,
    subtitle,
    onPress,
    showChevron = true,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Pressable
            style={({ pressed }) => [
                styles.actionItem,
                pressed && styles.pressed,
            ]}
            onPress={onPress}
        >
            <LinearGradient
                colors={iconBg}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <IconSymbol name={icon} size={20} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                    {title}
                </Text>
                <Text style={[styles.itemSubtitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                    {subtitle}
                </Text>
            </View>
            {showChevron && (
                <IconSymbol name="chevron.right" size={20} color={isDark ? '#808080' : '#9E9E9E'} />
            )}
        </Pressable>
    );
};

export default function SecurityScreen() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const router = useRouter();

    // Security states
    const [autoScan, setAutoScan] = useState(true);
    const [realTimeProtection, setRealTimeProtection] = useState(true);
    const [threatBlocking, setThreatBlocking] = useState(true);
    const [biometricAuth, setBiometricAuth] = useState(false);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);

    const handleRunScan = () => {
        Alert.alert(
            'Security Scan',
            'Starting comprehensive security scan...',
            [{ text: 'OK' }]
        );
    };

    const handleViewThreats = () => {
        console.log('View Detected Threats');
    };

    const handleChangePassword = () => {
        console.log('Change Password');
    };

    const handleViewActivity = () => {
        console.log('View Login Activity');
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0A0A1F' : '#F5F5F5' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                    Security
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Security Status */}
                <View style={[styles.statusCard, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <LinearGradient
                        colors={['#32CD32', '#228B22']}
                        style={styles.statusIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <IconSymbol name="checkmark.shield.fill" size={32} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.statusTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                        System Protected
                    </Text>
                    <Text style={[styles.statusSubtitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        Last scan: 2 hours ago
                    </Text>
                    <Pressable
                        style={styles.scanButton}
                        onPress={handleRunScan}
                    >
                        <LinearGradient
                            colors={['#9C64E8', '#B388FF']}
                            style={styles.scanButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.scanButtonText}>Run Security Scan</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Threat Protection */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        THREAT PROTECTION
                    </Text>

                    <SecurityToggle
                        title="Auto Scan"
                        subtitle="Automatically scan for threats daily"
                        value={autoScan}
                        onValueChange={setAutoScan}
                    />

                    <SecurityToggle
                        title="Real-Time Protection"
                        subtitle="Monitor threats in real-time"
                        value={realTimeProtection}
                        onValueChange={setRealTimeProtection}
                    />

                    <SecurityToggle
                        title="Threat Blocking"
                        subtitle="Automatically block detected threats"
                        value={threatBlocking}
                        onValueChange={setThreatBlocking}
                    />
                </View>

                {/* Authentication */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        AUTHENTICATION
                    </Text>

                    <SecurityToggle
                        title="Biometric Authentication"
                        subtitle="Use Face ID or fingerprint"
                        value={biometricAuth}
                        onValueChange={setBiometricAuth}
                    />

                    <SecurityToggle
                        title="Two-Factor Authentication"
                        subtitle="Add extra layer of security"
                        value={twoFactorAuth}
                        onValueChange={setTwoFactorAuth}
                    />
                </View>

                {/* Security Actions */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        SECURITY MANAGEMENT
                    </Text>

                    <SecurityAction
                        icon="exclamationmark.triangle.fill"
                        iconBg={['#FFD700', '#FFA500']}
                        title="Detected Threats"
                        subtitle="View and manage detected threats"
                        onPress={handleViewThreats}
                    />

                    <SecurityAction
                        icon="key.fill"
                        iconBg={['#4169E1', '#6495ED']}
                        title="Change Password"
                        subtitle="Update your account password"
                        onPress={handleChangePassword}
                    />

                    <SecurityAction
                        icon="clock.fill"
                        iconBg={['#9C64E8', '#B388FF']}
                        title="Login Activity"
                        subtitle="View recent login history"
                        onPress={handleViewActivity}
                    />
                </View>

                {/* Info Section */}
                <View style={[styles.infoSection, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <LinearGradient
                        colors={['#00CED1', '#1E90FF']}
                        style={styles.infoIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <IconSymbol name="info.circle.fill" size={20} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.infoText, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        Enable all security features for maximum protection against cyber threats
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
    statusCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statusIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    statusSubtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    scanButton: {
        width: '100%',
    },
    scanButtonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
    },
    scanButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
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
        marginBottom: 12,
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(128, 128, 128, 0.15)',
    },
    toggleLeft: {
        flex: 1,
        marginRight: 12,
    },
    toggleTitle: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    toggleSubtitle: {
        fontSize: 13,
        opacity: 0.8,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(128, 128, 128, 0.15)',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    itemSubtitle: {
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
