import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

interface NotificationToggleProps {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
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

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const router = useRouter();

    // Notification states
    const [threatAlerts, setThreatAlerts] = useState(true);
    const [systemUpdates, setSystemUpdates] = useState(true);
    const [scanComplete, setScanComplete] = useState(true);
    const [weeklyReports, setWeeklyReports] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [badgeEnabled, setBadgeEnabled] = useState(true);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0A0A1F' : '#F5F5F5' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                    Notifications
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Alert Notifications */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        ALERT NOTIFICATIONS
                    </Text>

                    <NotificationToggle
                        title="Threat Alerts"
                        subtitle="Get notified about detected threats"
                        value={threatAlerts}
                        onValueChange={setThreatAlerts}
                    />

                    <NotificationToggle
                        title="System Updates"
                        subtitle="Updates about system security"
                        value={systemUpdates}
                        onValueChange={setSystemUpdates}
                    />

                    <NotificationToggle
                        title="Scan Complete"
                        subtitle="Notify when security scans finish"
                        value={scanComplete}
                        onValueChange={setScanComplete}
                    />
                </View>

                {/* Report Notifications */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        REPORTS
                    </Text>

                    <NotificationToggle
                        title="Weekly Security Reports"
                        subtitle="Receive weekly security summaries"
                        value={weeklyReports}
                        onValueChange={setWeeklyReports}
                    />
                </View>

                {/* Notification Settings */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        NOTIFICATION STYLE
                    </Text>

                    <NotificationToggle
                        title="Sound"
                        subtitle="Play sound for notifications"
                        value={soundEnabled}
                        onValueChange={setSoundEnabled}
                    />

                    <NotificationToggle
                        title="Vibration"
                        subtitle="Vibrate for notifications"
                        value={vibrationEnabled}
                        onValueChange={setVibrationEnabled}
                    />

                    <NotificationToggle
                        title="Badge App Icon"
                        subtitle="Show notification count on app icon"
                        value={badgeEnabled}
                        onValueChange={setBadgeEnabled}
                    />
                </View>

                {/* Info Section */}
                <View style={[styles.infoSection, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        style={styles.infoIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <IconSymbol name="info.circle.fill" size={20} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.infoText, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        You can manage notification permissions in your device settings
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
