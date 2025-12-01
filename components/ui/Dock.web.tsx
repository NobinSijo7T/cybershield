import React, { CSSProperties, useEffect, useRef, useState } from 'react';

type SpringOptions = {
  mass?: number;
  stiffness?: number;
  damping?: number;
};

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
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: number;
  baseItemSize: number;
  magnification: number;
  distance: number;
  itemIndex: number;
  itemPositions: number[];
};

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  baseItemSize,
  magnification,
  distance,
  itemIndex,
  itemPositions,
}: DockItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [size, setSize] = useState(baseItemSize);

  useEffect(() => {
    const itemCenter = itemPositions[itemIndex];
    if (!itemCenter) {
      setSize(baseItemSize);
      return;
    }

    const distanceFromMouse = Math.abs(mouseX - itemCenter);
    
    if (distanceFromMouse > distance) {
      setSize(baseItemSize);
    } else {
      const scale = 1 - (distanceFromMouse / distance);
      const newSize = baseItemSize + (magnification - baseItemSize) * scale;
      setSize(newSize);
    }
  }, [mouseX, itemPositions, itemIndex, baseItemSize, magnification, distance]);

  const itemStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    transition: 'width 0.2s ease, height 0.2s ease',
    ...styles.dockItem,
  };

  return (
    <div
      style={itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={onClick}
      className={className}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ isHovered?: boolean }>, { isHovered })
          : child
      )}
    </div>
  );
}

function DockLabel({ children, className = '', isHovered }: { children: React.ReactNode; className?: string; isHovered?: boolean }) {
  if (!isHovered) return null;

  const labelStyle: CSSProperties = {
    ...styles.dockLabel,
    animation: 'fadeIn 0.2s ease',
  };

  return (
    <div className={className} role="tooltip" style={labelStyle}>
      {children}
    </div>
  );
}

function DockIcon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div style={styles.dockIcon} className={className}>{children}</div>;
}

export default function Dock({
  items,
  className = '',
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  baseItemSize = 50,
}: DockProps) {
  const [mouseX, setMouseX] = useState(Infinity);
  const [itemPositions, setItemPositions] = useState<number[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!panelRef.current) return;

    const updatePositions = () => {
      const positions = itemRefs.current.map(ref => {
        if (!ref) return 0;
        const rect = ref.getBoundingClientRect();
        return rect.left + rect.width / 2;
      });
      setItemPositions(positions);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [items.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMouseX(e.clientX);
  };

  const handleMouseLeave = () => {
    setMouseX(Infinity);
  };

  const panelStyle: CSSProperties = {
    ...styles.dockPanel,
    height: `${panelHeight}px`,
  };

  return (
    <div style={styles.dockOuter} className="dock-outer">
      <div
        ref={panelRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
        style={panelStyle}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <div key={index} ref={el => { itemRefs.current[index] = el; }}>
            <DockItem
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseX}
              baseItemSize={baseItemSize}
              magnification={magnification}
              distance={distance}
              itemIndex={index}
              itemPositions={itemPositions}
            >
              <DockIcon>{item.icon}</DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 0); }
          to { opacity: 1; transform: translate(-50%, -10px); }
        }
      `}</style>
    </div>
  );
}

// Inline styles for better compatibility with React Native Web
const styles: Record<string, CSSProperties> = {
  dockOuter: {
    margin: '0 0.5rem',
    display: 'flex',
    maxWidth: '100%',
    alignItems: 'center',
  },
  dockPanel: {
    position: 'absolute',
    bottom: '0.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'flex-end',
    width: 'fit-content',
    gap: '1rem',
    borderRadius: '1rem',
    backgroundColor: '#060010',
    border: '1px solid #222',
    padding: '0 0.5rem 0.5rem',
  },
  dockItem: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    backgroundColor: '#060010',
    border: '1px solid #222',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    cursor: 'pointer',
    outline: 'none',
  },
  dockIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLabel: {
    position: 'absolute',
    top: '-1.5rem',
    left: '50%',
    width: 'fit-content',
    whiteSpace: 'pre',
    borderRadius: '0.375rem',
    border: '1px solid #222',
    backgroundColor: '#060010',
    padding: '0.125rem 0.5rem',
    fontSize: '0.75rem',
    color: '#fff',
    transform: 'translate(-50%, -10px)',
  },
};

