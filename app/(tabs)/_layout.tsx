import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Image } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import Dock from '@/components/ui/Dock';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [activeTab, setActiveTab] = useState('index');

  // Custom tab bar using Dock component for all platforms
  const CustomTabBar = ({ state, navigation }: any) => {
    const items = [
      {
        icon: <Image 
          source={require('@/public/cyber.png')} 
          style={{ 
            width: 24, 
            height: 24,
            tintColor: activeTab === 'index' ? colors.primary : '#fff'
          }} 
        />,
        label: 'Scanner',
        onClick: () => {
          setActiveTab('index');
          navigation.navigate('index');
        },
      },
      {
        icon: <Image 
          source={require('@/public/options.png')} 
          style={{ 
            width: 24, 
            height: 24,
            tintColor: activeTab === 'settings' ? colors.primary : '#fff'
          }} 
        />,
        label: 'Settings',
        onClick: () => {
          setActiveTab('settings');
          navigation.navigate('settings');
        },
      },
    ];

    return (
      <Dock
        items={items}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    );
  };

  return (
    <Tabs
      tabBar={CustomTabBar}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: 'none' },
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="shield.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
