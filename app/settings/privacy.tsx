import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

interface PrivacyToggleProps {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
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

interface PrivacyItemProps {
    icon: any;
    iconBg: readonly [string, string, ...string[]];
    title: string;
    subtitle: string;
    onPress: () => void;
}

const PrivacyItem: React.FC<PrivacyItemProps> = ({
    icon,
    iconBg,
    title,
    subtitle,
    onPress,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Pressable
            style={({ pressed }) => [
                styles.privacyItem,
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
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#808080' : '#9E9E9E'} />
        </Pressable>
    );
};

export default function PrivacyScreen() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const router = useRouter();

    // Privacy states
    const [analytics, setAnalytics] = useState(false);
    const [crashReports, setCrashReports] = useState(true);
    const [personalizedAds, setPersonalizedAds] = useState(false);
    const [locationTracking, setLocationTracking] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0A0A1F' : '#F5F5F5' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                    Privacy
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Data Collection */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        DATA COLLECTION
                    </Text>

                    <PrivacyToggle
                        title="Usage Analytics"
                        subtitle="Help improve the app by sharing usage data"
                        value={analytics}
                        onValueChange={setAnalytics}
                    />

                    <PrivacyToggle
                        title="Crash Reports"
                        subtitle="Automatically send crash reports"
                        value={crashReports}
                        onValueChange={setCrashReports}
                    />

                    <PrivacyToggle
                        title="Personalized Ads"
                        subtitle="Show ads based on your interests"
                        value={personalizedAds}
                        onValueChange={setPersonalizedAds}
                    />

                    <PrivacyToggle
                        title="Location Tracking"
                        subtitle="Allow location-based features"
                        value={locationTracking}
                        onValueChange={setLocationTracking}
                    />
                </View>

                {/* Privacy Controls */}
                <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        PRIVACY CONTROLS
                    </Text>

                    <PrivacyItem
                        icon="doc.text.fill"
                        iconBg={['#4169E1', '#6495ED']}
                        title="Privacy Policy"
                        subtitle="Read our privacy policy"
                        onPress={() => console.log('Privacy Policy')}
                    />

                    <PrivacyItem
                        icon="hand.raised.fill"
                        iconBg={['#FF6B9D', '#FF1493']}
                        title="Data Permissions"
                        subtitle="Manage app permissions"
                        onPress={() => console.log('Data Permissions')}
                    />

                    <PrivacyItem
                        icon="arrow.down.doc.fill"
                        iconBg={['#32CD32', '#228B22']}
                        title="Download My Data"
                        subtitle="Export your personal data"
                        onPress={() => console.log('Download Data')}
                    />

                    <PrivacyItem
                        icon="trash.fill"
                        iconBg={['#EF5350', '#D32F2F']}
                        title="Delete Account"
                        subtitle="Permanently delete your account"
                        onPress={() => console.log('Delete Account')}
                    />
                </View>

                {/* Info Section */}
                <View style={[styles.infoSection, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
                    <LinearGradient
                        colors={['#9C64E8', '#B388FF']}
                        style={styles.infoIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <IconSymbol name="shield.fill" size={20} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.infoText, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                        Your privacy is important to us. We use encryption and secure protocols to protect your data.
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
    privacyItem: {
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
