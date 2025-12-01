export const lightTheme = {
  background: '#E8E4F3',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  primary: '#9C64E8',
  primaryLight: '#B388FF',
  primaryDark: '#7C4DFF',
  success: '#4CAF50',
  warning: '#FFA726',
  danger: '#EF5350',
  border: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  tint: '#9C64E8',
  icon: '#757575',
  tabIconDefault: '#757575',
  tabIconSelected: '#9C64E8',
};

export const darkTheme = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceSecondary: '#2C2C2C',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  primary: '#B388FF',
  primaryLight: '#D4BAFF',
  primaryDark: '#9C64E8',
  success: '#66BB6A',
  warning: '#FFB74D',
  danger: '#EF5350',
  border: '#3A3A3A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  tint: '#B388FF',
  icon: '#B0B0B0',
  tabIconDefault: '#808080',
  tabIconSelected: '#B388FF',
};

export type ThemeColors = typeof lightTheme;

// Backward compatibility exports
export const Colors = {
  light: lightTheme,
  dark: darkTheme,
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};
