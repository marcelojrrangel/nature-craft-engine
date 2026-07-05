import React from 'react';

interface ItemIconProps {
  itemId: string;
  size?: number;
}

const ICONS: Record<string, React.ReactNode> = {
  wood: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="4" y="6" width="8" height="4" fill="#8B5E3C" />
      <rect x="6" y="4" width="4" height="2" fill="#A0522D" />
    </svg>
  ),
  stone: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="4" y="4" width="8" height="8" fill="#888888" />
      <rect x="6" y="6" width="4" height="4" fill="#999999" />
    </svg>
  ),
  fiber: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="4" width="4" height="8" fill="#228B22" />
      <rect x="8" y="6" width="2" height="4" fill="#32CD32" />
    </svg>
  ),
  iron_ore: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="4" y="4" width="8" height="8" fill="#6B5B4F" />
      <rect x="6" y="6" width="4" height="4" fill="#8B7355" />
    </svg>
  ),
  bronze_ore: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="4" y="4" width="8" height="8" fill="#8B6B4A" />
      <rect x="6" y="6" width="4" height="4" fill="#A67C52" />
    </svg>
  ),
  gold_ore: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="4" y="4" width="8" height="8" fill="#9A8B5A" />
      <rect x="6" y="6" width="4" height="4" fill="#C4A044" />
    </svg>
  ),
  axe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="4" width="4" height="2" fill="#8B4513" />
      <rect x="10" y="6" width="4" height="4" fill="#A0522D" />
    </svg>
  ),
  pickaxe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="4" width="4" height="2" fill="#8B4513" />
      <polygon points="10,2 14,8 10,14" fill="#A0A0A0" />
    </svg>
  ),
  sword: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="8" y="4" width="2" height="8" fill="#C0C0C0" />
      <rect x="6" y="6" width="2" height="4" fill="#808080" />
    </svg>
  ),
  bow: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <circle cx="8" cy="8" r="6" fill="#8B4513" />
      <circle cx="8" cy="8" r="4" fill="#D2691E" />
    </svg>
  ),
};

export default function ItemIcon({ itemId, size = 32 }: ItemIconProps) {
  const icon = ICONS[itemId];

  if (icon) {
    return (
      <div style={{ width: size, height: size }} className="drop-shadow-md">
        {icon}
      </div>
    );
  }

  return null;
}
