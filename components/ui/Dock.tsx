import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: any;
};

type DockItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
  touchX: number;
  baseItemSize: number;
  magnification: number;
  distance: number;
  itemIndex: number;
  itemPositions: number[];
};

function DockItem({
  children,
  onClick,
  touchX,
  baseItemSize,
  magnification,
  distance,
  itemIndex,
  itemPositions,
}: DockItemProps) {
  const [isPressed, setIsPressed] = useState(false);
  const sizeAnim = useRef(new Animated.Value(baseItemSize)).current;

  useEffect(() => {
    const itemCenter = itemPositions[itemIndex];
    if (!itemCenter || touchX === Infinity) {
      Animated.spring(sizeAnim, {
        toValue: baseItemSize,
        useNativeDriver: false,
        damping: 12,
        stiffness: 150,
      }).start();
      return;
    }

    const distanceFromTouch = Math.abs(touchX - itemCenter);

    if (distanceFromTouch > distance) {
      Animated.spring(sizeAnim, {
        toValue: baseItemSize,
        useNativeDriver: false,
        damping: 12,
        stiffness: 150,
      }).start();
    } else {
      const scale = 1 - (distanceFromTouch / distance);
      const newSize = baseItemSize + (magnification - baseItemSize) * scale;
      Animated.spring(sizeAnim, {
        toValue: newSize,
        useNativeDriver: false,
        damping: 12,
        stiffness: 150,
      }).start();
    }
  }, [touchX, itemPositions, itemIndex, baseItemSize, magnification, distance, sizeAnim]);

  return (
    <Pressable
      onPress={onClick}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <Animated.View
        style={[
          styles.dockItem,
          {
            width: sizeAnim,
            height: sizeAnim,
            opacity: isPressed ? 0.7 : 1,
          },
        ]}
      >
        {React.Children.map(children, child =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ isPressed?: boolean }>, { isPressed })
            : child
        )}
      </Animated.View>
    </Pressable>
  );
}

function DockLabel({ children, isPressed }: { children: React.ReactNode; isPressed?: boolean }) {
  if (!isPressed) return null;

  return (
    <View style={styles.dockLabel}>
      <Text style={styles.dockLabelText}>{children}</Text>
    </View>
  );
}

function DockIcon({ children }: { children: React.ReactNode }) {
  return <View style={styles.dockIcon}>{children}</View>;
}

export default function Dock({
  items,
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  baseItemSize = 50,
}: DockProps) {
  const [touchX, setTouchX] = useState(Infinity);
  const [itemPositions, setItemPositions] = useState<number[]>([]);
  const itemRefs = useRef<(View | null)[]>([]);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    // Update item positions
    const updatePositions = () => {
      const promises = itemRefs.current.map((ref, index) => {
        return new Promise<number>((resolve) => {
          if (!ref) {
            resolve(0);
            return;
          }
          ref.measure((x, y, width, height, pageX, pageY) => {
            resolve(pageX + width / 2);
          });
        });
      });

      Promise.all(promises).then(positions => {
        setItemPositions(positions);
      });
    };

    const timer = setTimeout(updatePositions, 100);
    return () => clearTimeout(timer);
  }, [items.length]);

  const handleTouchMove = (event: any) => {
    const touch = event.nativeEvent.touches[0];
    if (touch) {
      setTouchX(touch.pageX);
    }
  };

  const handleTouchEnd = () => {
    setTouchX(Infinity);
  };

  return (
    <View style={styles.dockOuter}>
      <View
        style={[styles.dockPanel, { height: panelHeight }]}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => (
          <View
            key={index}
            ref={el => { itemRefs.current[index] = el; }}
            collapsable={false}
          >
            <DockItem
              onClick={item.onClick}
              touchX={touchX}
              baseItemSize={baseItemSize}
              magnification={magnification}
              distance={distance}
              itemIndex={index}
              itemPositions={itemPositions}
            >
              <DockIcon>{item.icon}</DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockOuter: {
    marginHorizontal: 8,
    maxWidth: '100%',
    alignItems: 'center',
  },
  dockPanel: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 16,
    borderRadius: 16,
    backgroundColor: '#060010',
    borderWidth: 1,
    borderColor: '#222',
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 0,
  },
  dockItem: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#060010',
    borderWidth: 1,
    borderColor: '#222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  dockIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLabel: {
    position: 'absolute',
    top: -24,
    left: '50%',
    transform: [{ translateX: -30 }],
    minWidth: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#060010',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  dockLabelText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});
