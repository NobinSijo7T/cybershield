import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

interface SettingItemProps {
  icon: any;
  iconColor: string;
  iconBg: readonly [string, string, ...string[]];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightComponent,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <LinearGradient
          colors={iconBg}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconSymbol name={icon} size={24} color={iconColor} />
        </LinearGradient>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: isDark ? '#B0B0B0' : '#757575' }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent || (showChevron && (
        <IconSymbol name="chevron.right" size={20} color={isDark ? '#808080' : '#9E9E9E'} />
      ))}
    </Pressable>
  );
};

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A1F' : '#F5F5F5' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
            Settings
          </Text>
        </View>

        {/* User Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
          <Pressable style={styles.profileContent}>
            <View style={styles.profileLeft}>
              <LinearGradient
                colors={['#9C64E8', '#B388FF']}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconSymbol name="person.fill" size={32} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.profileName, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                  CyberShield User
                </Text>
                <Text style={[styles.profileEmail, { color: isDark ? '#B0B0B0' : '#757575' }]}>
                  user@cybershield.ai
                </Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#808080' : '#9E9E9E'} />
          </Pressable>
        </View>

        {/* Dark Mode Toggle */}
        <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
          <SettingItem
            icon={isDark ? "moon.fill" : "sun.max.fill"}
            iconColor="#FFFFFF"
            iconBg={isDark ? ['#4A4AFF', '#6B6BFF'] : ['#FFB74D', '#FFA726']}
            title="Dark Mode"
            showChevron={false}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: '#9C64E8' }}
                thumbColor={isDark ? '#B388FF' : '#F5F5F5'}
                ios_backgroundColor="#767577"
              />
            }
          />
        </View>

        {/* Main Settings */}
        <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
          <SettingItem
            icon="bell.fill"
            iconColor="#FFFFFF"
            iconBg={['#FFD700', '#FFA500']}
            title="Notifications"
            onPress={() => router.push('/settings/notifications' as any)}
          />

          <SettingItem
            icon="lock.fill"
            iconColor="#FFFFFF"
            iconBg={['#FF6B9D', '#FF1493']}
            title="Privacy"
            onPress={() => router.push('/settings/privacy' as any)}
          />

          <SettingItem
            icon="shield.fill"
            iconColor="#FFFFFF"
            iconBg={['#00CED1', '#1E90FF']}
            title="Security"
            subtitle="Manage your security settings"
            onPress={() => router.push('/settings/security' as any)}
          />

          <SettingItem
            icon="gearshape.fill"
            iconColor="#FFFFFF"
            iconBg={['#32CD32', '#228B22']}
            title="Main"
            onPress={() => console.log('Main Settings - Coming Soon')}
          />

          <SettingItem
            icon="paintbrush.fill"
            iconColor="#FFFFFF"
            iconBg={['#9C64E8', '#B388FF']}
            title="Appearance"
            subtitle="Customize your experience"
            onPress={() => router.push('/settings/appearance' as any)}
          />

          <SettingItem
            icon="globe"
            iconColor="#FFFFFF"
            iconBg={['#4169E1', '#6495ED']}
            title="Language"
            onPress={() => console.log('Language')}
          />

          <SettingItem
            icon="questionmark.circle.fill"
            iconColor="#FFFFFF"
            iconBg={['#FFD700', '#FFA500']}
            title="Ask a Question"
            subtitle="Get help and support"
            onPress={() => console.log('Help')}
          />
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF' }]}>
          <SettingItem
            icon="info.circle.fill"
            iconColor="#FFFFFF"
            iconBg={['#9C64E8', '#B388FF']}
            title="About CyberShield AI"
            subtitle="Version 1.0.0"
            onPress={() => console.log('About')}
          />
        </View>

        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(128, 128, 128, 0.15)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  pressed: {
    opacity: 0.6,
  },
  footer: {
    height: 20,
  },
});
