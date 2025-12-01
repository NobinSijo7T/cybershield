/**
 * Dock Component Usage Example
 * 
 * This file demonstrates how to use the Dock component
 * with custom items and configuration.
 */

import Dock from '@/components/ui/Dock';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Example with custom icons and actions
export function DockExample() {
  const items = [
    {
      icon: <IconSymbol size={18} name="house.fill" color="#fff" />,
      label: 'Home',
      onClick: () => console.log('Home clicked'),
    },
    {
      icon: <IconSymbol size={18} name="archivebox.fill" color="#fff" />,
      label: 'Archive',
      onClick: () => console.log('Archive clicked'),
    },
    {
      icon: <IconSymbol size={18} name="person.fill" color="#fff" />,
      label: 'Profile',
      onClick: () => console.log('Profile clicked'),
    },
    {
      icon: <IconSymbol size={18} name="gearshape.fill" color="#fff" />,
      label: 'Settings',
      onClick: () => console.log('Settings clicked'),
    },
  ];

  return (
    <Dock
      items={items}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
      distance={200}
      spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
    />
  );
}

/**
 * Props:
 * - items: Array of dock items with icon, label, and onClick
 * - panelHeight: Height of the dock panel (default: 68)
 * - baseItemSize: Base size of each item (default: 50)
 * - magnification: Size when magnified on hover (default: 70)
 * - distance: Distance from cursor for magnification effect (default: 200)
 * - spring: Spring animation configuration
 * - className: Additional CSS classes
 * - dockHeight: Total dock height (default: 256)
 */
