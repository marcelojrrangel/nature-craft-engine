import React from 'react';

interface ItemIconProps {
  itemId: string;
  size?: number;
}

const ICONS: Record<string, React.ReactNode> = {
  // Resources - Enhanced with details
  wood: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="5" width="10" height="6" fill="#8B5E3C" />
      <rect x="4" y="6" width="8" height="4" fill="#A0522D" />
      <rect x="5" y="3" width="6" height="2" fill="#CD853F" />
      <rect x="6" y="7" width="2" height="2" fill="#DEB887" />
      <rect x="10" y="8" width="1" height="1" fill="#DEB887" />
    </svg>
  ),
  twig: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="2" y="7" width="12" height="2" fill="#D2B48C" />
      <rect x="3" y="6" width="10" height="4" fill="#DEB887" />
      <rect x="1" y="8" width="2" height="1" fill="#BC8F8F" />
      <rect x="13" y="8" width="2" height="1" fill="#BC8F8F" />
      <rect x="7" y="6" width="2" height="4" fill="#C4A484" />
    </svg>
  ),
  stone: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="3" width="10" height="10" fill="#808080" />
      <rect x="4" y="4" width="8" height="8" fill="#A9A9A9" />
      <rect x="5" y="5" width="4" height="4" fill="#C0C0C0" />
      <rect x="10" y="6" width="2" height="2" fill="#D3D3D3" />
      <rect x="6" y="10" width="2" height="2" fill="#D3D3D3" />
      <rect x="5" y="5" width="1" height="1" fill="#808080" />
    </svg>
  ),
  fiber: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="5" y="2" width="6" height="12" fill="#228B22" />
      <rect x="6" y="3" width="4" height="10" fill="#32CD32" />
      <rect x="7" y="4" width="2" height="8" fill="#90EE90" />
      <rect x="8" y="5" width="1" height="6" fill="#98FB98" />
      <rect x="6" y="7" width="1" height="2" fill="#00FF00" />
      <rect x="9" y="10" width="1" height="2" fill="#00FF00" />
    </svg>
  ),
  seed: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="8" rx="5" ry="6" fill="#8B4513" />
      <ellipse cx="8" cy="8" rx="3" ry="4" fill="#A0522D" />
      <rect x="7" y="2" width="2" height="3" fill="#228B22" />
      <rect x="6" y="3" width="4" height="2" fill="#32CD32" />
      <rect x="7" y="8" width="2" height="1" fill="#CD853F" />
    </svg>
  ),
  feather: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="8" rx="2" ry="6" fill="#F5F5DC" />
      <ellipse cx="8" cy="8" rx="1" ry="5" fill="#FFF8DC" />
      <rect x="7" y="2" width="2" height="12" fill="#DEB887" />
      <rect x="7" y="3" width="1" height="10" fill="#FFE4B5" />
      <rect x="5" y="6" width="2" height="1" fill="#F5F5DC" />
      <rect x="9" y="6" width="2" height="1" fill="#F5F5DC" />
      <rect x="5" y="9" width="2" height="1" fill="#F5F5DC" />
      <rect x="9" y="9" width="2" height="1" fill="#F5F5DC" />
    </svg>
  ),
  pelt: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="4" width="10" height="8" fill="#8B4513" />
      <rect x="4" y="5" width="8" height="6" fill="#A0522D" />
      <rect x="5" y="6" width="6" height="4" fill="#CD853F" />
      <rect x="6" y="7" width="1" height="1" fill="#DEB887" />
      <rect x="9" y="7" width="1" height="1" fill="#DEB887" />
      <rect x="7" y="9" width="1" height="1" fill="#DEB887" />
      <rect x="8" y="8" width="1" height="1" fill="#8B4513" />
    </svg>
  ),
  crab_shell: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="8" rx="6" ry="5" fill="#FF6347" />
      <ellipse cx="8" cy="8" rx="4" ry="3" fill="#FF7F50" />
      <ellipse cx="8" cy="8" rx="2" ry="2" fill="#FFB6C1" />
      <rect x="2" y="7" width="2" height="2" fill="#FF6347" />
      <rect x="12" y="7" width="2" height="2" fill="#FF6347" />
      <rect x="7" y="5" width="2" height="1" fill="#FFB6C1" />
      <rect x="7" y="10" width="2" height="1" fill="#FFB6C1" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="2" y="7" width="10" height="2" fill="#8B4513" />
      <rect x="3" y="6" width="8" height="4" fill="#A0522D" />
      <polygon points="12,5 15,8 12,11" fill="#A9A9A9" />
      <polygon points="13,6 14,8 13,10" fill="#C0C0C0" />
      <rect x="1" y="8" width="3" height="1" fill="#DEB887" />
      <rect x="1" y="7" width="2" height="1" fill="#D2B48C" />
    </svg>
  ),
  campfire: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="4" y="11" width="8" height="3" fill="#8B4513" />
      <rect x="5" y="12" width="6" height="2" fill="#A0522D" />
      <polygon points="6,11 8,4 10,11" fill="#FF4500" />
      <polygon points="7,10 8,5 9,10" fill="#FF6347" />
      <polygon points="5,11 6,6 7,11" fill="#FFA500" />
      <polygon points="9,11 10,6 11,11" fill="#FFA500" />
      <rect x="7" y="8" width="2" height="3" fill="#FF0000" />
    </svg>
  ),
  food: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <circle cx="8" cy="9" r="5" fill="#FF0000" />
      <circle cx="8" cy="9" r="3" fill="#FF6347" />
      <circle cx="7" cy="8" r="1" fill="#FF7F50" />
      <rect x="7" y="2" width="2" height="3" fill="#228B22" />
      <rect x="6" y="3" width="4" height="2" fill="#32CD32" />
      <rect x="8" y="3" width="1" height="2" fill="#90EE90" />
    </svg>
  ),

  // Ores - Enhanced
  iron_ore: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="3" width="10" height="10" fill="#6B5B4F" />
      <rect x="4" y="4" width="8" height="8" fill="#8B7355" />
      <rect x="5" y="5" width="6" height="6" fill="#A0826D" />
      <rect x="6" y="6" width="4" height="4" fill="#B8957A" />
      <rect x="7" y="7" width="2" height="2" fill="#C4A885" />
      <rect x="5" y="5" width="1" height="1" fill="#DEB887" />
      <rect x="10" y="10" width="1" height="1" fill="#DEB887" />
    </svg>
  ),
  bronze_ore: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="3" width="10" height="10" fill="#8B6B4A" />
      <rect x="4" y="4" width="8" height="8" fill="#A67C52" />
      <rect x="5" y="5" width="6" height="6" fill="#B88A5A" />
      <rect x="6" y="6" width="4" height="4" fill="#CD853F" />
      <rect x="7" y="7" width="2" height="2" fill="#DEB887" />
      <rect x="5" y="5" width="1" height="1" fill="#FFD700" />
      <rect x="10" y="10" width="1" height="1" fill="#FFD700" />
    </svg>
  ),
  gold_ore: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="3" width="10" height="10" fill="#9A8B5A" />
      <rect x="4" y="4" width="8" height="8" fill="#C4A044" />
      <rect x="5" y="5" width="6" height="6" fill="#D4AF37" />
      <rect x="6" y="6" width="4" height="4" fill="#FFD700" />
      <rect x="7" y="7" width="2" height="2" fill="#FFEC8B" />
      <rect x="5" y="5" width="1" height="1" fill="#FFFACD" />
      <rect x="10" y="10" width="1" height="1" fill="#FFFACD" />
      <rect x="8" y="5" width="1" height="1" fill="#FFFACD" />
    </svg>
  ),

  // Tools - Enhanced
  axe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="3" width="4" height="10" fill="#8B4513" />
      <rect x="7" y="4" width="2" height="8" fill="#A0522D" />
      <rect x="10" y="4" width="5" height="4" fill="#696969" />
      <rect x="11" y="5" width="3" height="2" fill="#808080" />
      <rect x="12" y="6" width="1" height="1" fill="#A9A9A9" />
      <rect x="8" y="5" width="1" height="1" fill="#CD853F" />
    </svg>
  ),
  pickaxe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="4" width="4" height="8" fill="#8B4513" />
      <rect x="7" y="5" width="2" height="6" fill="#A0522D" />
      <polygon points="2,2 6,8 2,14" fill="#696969" />
      <polygon points="14,2 10,8 14,14" fill="#696969" />
      <polygon points="3,3 5,8 3,13" fill="#808080" />
      <polygon points="13,3 11,8 13,13" fill="#808080" />
      <rect x="8" y="6" width="1" height="1" fill="#CD853F" />
    </svg>
  ),
  shovel: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="7" y="4" width="2" height="8" fill="#8B4513" />
      <rect x="8" y="5" width="1" height="6" fill="#A0522D" />
      <ellipse cx="8" cy="3" rx="4" ry="2" fill="#696969" />
      <ellipse cx="8" cy="3" rx="3" ry="1" fill="#808080" />
      <rect x="7" y="2" width="2" height="1" fill="#A9A9A9" />
      <rect x="8" y="6" width="1" height="1" fill="#CD853F" />
    </svg>
  ),
  knife: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="2" y="7" width="8" height="2" fill="#8B4513" />
      <rect x="3" y="6" width="7" height="4" fill="#A0522D" />
      <rect x="10" y="6" width="4" height="4" fill="#C0C0C0" />
      <rect x="11" y="7" width="3" height="2" fill="#D3D3D3" />
      <polygon points="14,6 15,8 14,10" fill="#A9A9A9" />
      <rect x="8" y="7" width="1" height="1" fill="#CD853F" />
    </svg>
  ),
  sword: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="7" y="2" width="2" height="10" fill="#C0C0C0" />
      <rect x="8" y="3" width="1" height="8" fill="#D3D3D3" />
      <rect x="6" y="4" width="4" height="2" fill="#A9A9A9" />
      <rect x="6" y="8" width="4" height="2" fill="#A9A9A9" />
      <rect x="7" y="12" width="2" height="2" fill="#8B4513" />
      <rect x="8" y="13" width="1" height="1" fill="#A0522D" />
      <rect x="8" y="5" width="1" height="1" fill="#FFFFFF" />
    </svg>
  ),
  bow: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="8" rx="2" ry="6" fill="#8B4513" />
      <ellipse cx="8" cy="8" rx="1" ry="5" fill="#A0522D" />
      <rect x="6" y="2" width="1" height="12" fill="#CD853F" />
      <rect x="9" y="2" width="1" height="12" fill="#CD853F" />
      <line x1="6" y1="2" x2="6" y2="14" stroke="#D3D3D3" strokeWidth="1" />
      <line x1="10" y1="2" x2="10" y2="14" stroke="#D3D3D3" strokeWidth="1" />
      <rect x="7" y="7" width="2" height="1" fill="#DEB887" />
    </svg>
  ),

  // Metal Tools
  iron_sword: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="7" y="2" width="2" height="10" fill="#4A4A4A" />
      <rect x="8" y="3" width="1" height="8" fill="#696969" />
      <rect x="6" y="4" width="4" height="2" fill="#2F4F4F" />
      <rect x="6" y="8" width="4" height="2" fill="#2F4F4F" />
      <rect x="7" y="12" width="2" height="2" fill="#8B4513" />
      <rect x="8" y="13" width="1" height="1" fill="#A0522D" />
      <rect x="8" y="5" width="1" height="1" fill="#A9A9A9" />
      <rect x="7" y="9" width="1" height="1" fill="#A9A9A9" />
    </svg>
  ),
  iron_pickaxe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="4" width="4" height="8" fill="#8B4513" />
      <rect x="7" y="5" width="2" height="6" fill="#A0522D" />
      <polygon points="2,2 6,8 2,14" fill="#4A4A4A" />
      <polygon points="14,2 10,8 14,14" fill="#4A4A4A" />
      <polygon points="3,3 5,8 3,13" fill="#696969" />
      <polygon points="13,3 11,8 13,13" fill="#696969" />
      <rect x="8" y="6" width="1" height="1" fill="#CD853F" />
      <rect x="4" y="7" width="1" height="1" fill="#A9A9A9" />
      <rect x="11" y="7" width="1" height="1" fill="#A9A9A9" />
    </svg>
  ),
  iron_axe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="3" width="4" height="10" fill="#8B4513" />
      <rect x="7" y="4" width="2" height="8" fill="#A0522D" />
      <rect x="10" y="4" width="5" height="4" fill="#4A4A4A" />
      <rect x="11" y="5" width="3" height="2" fill="#696969" />
      <rect x="12" y="6" width="1" height="1" fill="#A9A9A9" />
      <rect x="8" y="5" width="1" height="1" fill="#CD853F" />
      <rect x="10" y="5" width="1" height="1" fill="#2F4F4F" />
    </svg>
  ),
  iron_bow: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="8" rx="2" ry="6" fill="#4A4A4A" />
      <ellipse cx="8" cy="8" rx="1" ry="5" fill="#696969" />
      <rect x="6" y="2" width="1" height="12" fill="#A9A9A9" />
      <rect x="9" y="2" width="1" height="12" fill="#A9A9A9" />
      <line x1="6" y1="2" x2="6" y2="14" stroke="#D3D3D3" strokeWidth="1" />
      <line x1="10" y1="2" x2="10" y2="14" stroke="#D3D3D3" strokeWidth="1" />
      <rect x="7" y="7" width="2" height="1" fill="#2F4F4F" />
    </svg>
  ),
  bronze_sword: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="7" y="2" width="2" height="10" fill="#A0522D" />
      <rect x="8" y="3" width="1" height="8" fill="#CD853F" />
      <rect x="6" y="4" width="4" height="2" fill="#8B4513" />
      <rect x="6" y="8" width="4" height="2" fill="#8B4513" />
      <rect x="7" y="12" width="2" height="2" fill="#8B4513" />
      <rect x="8" y="13" width="1" height="1" fill="#A0522D" />
      <rect x="8" y="5" width="1" height="1" fill="#DEB887" />
      <rect x="7" y="9" width="1" height="1" fill="#DEB887" />
    </svg>
  ),
  bronze_pickaxe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="4" width="4" height="8" fill="#8B4513" />
      <rect x="7" y="5" width="2" height="6" fill="#A0522D" />
      <polygon points="2,2 6,8 2,14" fill="#A0522D" />
      <polygon points="14,2 10,8 14,14" fill="#A0522D" />
      <polygon points="3,3 5,8 3,13" fill="#CD853F" />
      <polygon points="13,3 11,8 13,13" fill="#CD853F" />
      <rect x="8" y="6" width="1" height="1" fill="#DEB887" />
      <rect x="4" y="7" width="1" height="1" fill="#DEB887" />
      <rect x="11" y="7" width="1" height="1" fill="#DEB887" />
    </svg>
  ),
  bronze_axe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="3" width="4" height="10" fill="#8B4513" />
      <rect x="7" y="4" width="2" height="8" fill="#A0522D" />
      <rect x="10" y="4" width="5" height="4" fill="#A0522D" />
      <rect x="11" y="5" width="3" height="2" fill="#CD853F" />
      <rect x="12" y="6" width="1" height="1" fill="#DEB887" />
      <rect x="8" y="5" width="1" height="1" fill="#DEB887" />
      <rect x="10" y="5" width="1" height="1" fill="#8B4513" />
    </svg>
  ),
  bronze_bow: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="8" rx="2" ry="6" fill="#A0522D" />
      <ellipse cx="8" cy="8" rx="1" ry="5" fill="#CD853F" />
      <rect x="6" y="2" width="1" height="12" fill="#DEB887" />
      <rect x="9" y="2" width="1" height="12" fill="#DEB887" />
      <line x1="6" y1="2" x2="6" y2="14" stroke="#F5DEB3" strokeWidth="1" />
      <line x1="10" y1="2" x2="10" y2="14" stroke="#F5DEB3" strokeWidth="1" />
      <rect x="7" y="7" width="2" height="1" fill="#8B4513" />
    </svg>
  ),
  gold_sword: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="7" y="2" width="2" height="10" fill="#DAA520" />
      <rect x="8" y="3" width="1" height="8" fill="#FFD700" />
      <rect x="6" y="4" width="4" height="2" fill="#B8860B" />
      <rect x="6" y="8" width="4" height="2" fill="#B8860B" />
      <rect x="7" y="12" width="2" height="2" fill="#8B4513" />
      <rect x="8" y="13" width="1" height="1" fill="#A0522D" />
      <rect x="8" y="5" width="1" height="1" fill="#FFF8DC" />
      <rect x="7" y="9" width="1" height="1" fill="#FFF8DC" />
    </svg>
  ),
  gold_pickaxe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="4" width="4" height="8" fill="#8B4513" />
      <rect x="7" y="5" width="2" height="6" fill="#A0522D" />
      <polygon points="2,2 6,8 2,14" fill="#DAA520" />
      <polygon points="14,2 10,8 14,14" fill="#DAA520" />
      <polygon points="3,3 5,8 3,13" fill="#FFD700" />
      <polygon points="13,3 11,8 13,13" fill="#FFD700" />
      <rect x="8" y="6" width="1" height="1" fill="#FFF8DC" />
      <rect x="4" y="7" width="1" height="1" fill="#FFF8DC" />
      <rect x="11" y="7" width="1" height="1" fill="#FFF8DC" />
    </svg>
  ),
  gold_axe: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="6" y="3" width="4" height="10" fill="#8B4513" />
      <rect x="7" y="4" width="2" height="8" fill="#A0522D" />
      <rect x="10" y="4" width="5" height="4" fill="#DAA520" />
      <rect x="11" y="5" width="3" height="2" fill="#FFD700" />
      <rect x="12" y="6" width="1" height="1" fill="#FFF8DC" />
      <rect x="8" y="5" width="1" height="1" fill="#FFF8DC" />
      <rect x="10" y="5" width="1" height="1" fill="#B8860B" />
    </svg>
  ),
  gold_bow: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="8" rx="2" ry="6" fill="#DAA520" />
      <ellipse cx="8" cy="8" rx="1" ry="5" fill="#FFD700" />
      <rect x="6" y="2" width="1" height="12" fill="#FFF8DC" />
      <rect x="9" y="2" width="1" height="12" fill="#FFF8DC" />
      <line x1="6" y1="2" x2="6" y2="14" stroke="#FFFACD" strokeWidth="1" />
      <line x1="10" y1="2" x2="10" y2="14" stroke="#FFFACD" strokeWidth="1" />
      <rect x="7" y="7" width="2" height="1" fill="#B8860B" />
    </svg>
  ),

  // Rustic Armor
  helmet_rustic: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="6" ry="5" fill="#8B4513" />
      <ellipse cx="8" cy="9" rx="4" ry="3" fill="#A0522D" />
      <rect x="6" y="4" width="4" height="5" fill="#CD853F" />
      <rect x="7" y="5" width="2" height="3" fill="#DEB887" />
      <rect x="5" y="8" width="6" height="2" fill="#DEB887" />
      <rect x="6" y="5" width="1" height="1" fill="#F5DEB3" />
    </svg>
  ),
  gloves_rustic: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="4" y="8" width="3" height="6" fill="#8B4513" />
      <rect x="9" y="8" width="3" height="6" fill="#8B4513" />
      <rect x="5" y="9" width="2" height="4" fill="#A0522D" />
      <rect x="10" y="9" width="2" height="4" fill="#A0522D" />
      <rect x="6" y="5" width="4" height="4" fill="#CD853F" />
      <rect x="7" y="6" width="2" height="2" fill="#DEB887" />
      <rect x="7" y="7" width="1" height="1" fill="#F5DEB3" />
    </svg>
  ),
  boots_rustic: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="8" width="5" height="6" fill="#8B4513" />
      <rect x="8" y="8" width="5" height="6" fill="#8B4513" />
      <rect x="4" y="9" width="4" height="4" fill="#A0522D" />
      <rect x="9" y="9" width="4" height="4" fill="#A0522D" />
      <rect x="5" y="6" width="6" height="3" fill="#CD853F" />
      <rect x="6" y="7" width="4" height="1" fill="#DEB887" />
      <rect x="7" y="8" width="1" height="1" fill="#F5DEB3" />
    </svg>
  ),

  // Metal Armor
  iron_helmet: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="6" ry="5" fill="#4A4A4A" />
      <ellipse cx="8" cy="9" rx="4" ry="3" fill="#696969" />
      <rect x="6" y="4" width="4" height="5" fill="#808080" />
      <rect x="7" y="5" width="2" height="3" fill="#A9A9A9" />
      <rect x="5" y="8" width="6" height="2" fill="#A9A9A9" />
      <rect x="6" y="5" width="1" height="1" fill="#C0C0C0" />
      <rect x="9" y="5" width="1" height="1" fill="#C0C0C0" />
    </svg>
  ),
  iron_chestplate: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="4" y="4" width="8" height="10" fill="#4A4A4A" />
      <rect x="5" y="5" width="6" height="8" fill="#696969" />
      <rect x="6" y="6" width="4" height="6" fill="#808080" />
      <rect x="7" y="7" width="2" height="4" fill="#A9A9A9" />
      <rect x="6" y="8" width="1" height="1" fill="#C0C0C0" />
      <rect x="9" y="8" width="1" height="1" fill="#C0C0C0" />
      <rect x="7" y="9" width="1" height="1" fill="#D3D3D3" />
    </svg>
  ),
  iron_boots: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="8" width="5" height="6" fill="#4A4A4A" />
      <rect x="8" y="8" width="5" height="6" fill="#4A4A4A" />
      <rect x="4" y="9" width="4" height="4" fill="#696969" />
      <rect x="9" y="9" width="4" height="4" fill="#696969" />
      <rect x="5" y="6" width="6" height="3" fill="#808080" />
      <rect x="6" y="7" width="4" height="1" fill="#A9A9A9" />
      <rect x="7" y="8" width="1" height="1" fill="#C0C0C0" />
    </svg>
  ),
  bronze_helmet: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="6" ry="5" fill="#8B6B4A" />
      <ellipse cx="8" cy="9" rx="4" ry="3" fill="#A67C52" />
      <rect x="6" y="4" width="4" height="5" fill="#CD853F" />
      <rect x="7" y="5" width="2" height="3" fill="#DEB887" />
      <rect x="5" y="8" width="6" height="2" fill="#DEB887" />
      <rect x="6" y="5" width="1" height="1" fill="#FFD700" />
      <rect x="9" y="5" width="1" height="1" fill="#FFD700" />
    </svg>
  ),
  bronze_chestplate: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="4" y="4" width="8" height="10" fill="#8B6B4A" />
      <rect x="5" y="5" width="6" height="8" fill="#A67C52" />
      <rect x="6" y="6" width="4" height="6" fill="#CD853F" />
      <rect x="7" y="7" width="2" height="4" fill="#DEB887" />
      <rect x="6" y="8" width="1" height="1" fill="#FFD700" />
      <rect x="9" y="8" width="1" height="1" fill="#FFD700" />
      <rect x="7" y="9" width="1" height="1" fill="#FFEC8B" />
    </svg>
  ),
  bronze_boots: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="8" width="5" height="6" fill="#8B6B4A" />
      <rect x="8" y="8" width="5" height="6" fill="#8B6B4A" />
      <rect x="4" y="9" width="4" height="4" fill="#A67C52" />
      <rect x="9" y="9" width="4" height="4" fill="#A67C52" />
      <rect x="5" y="6" width="6" height="3" fill="#CD853F" />
      <rect x="6" y="7" width="4" height="1" fill="#DEB887" />
      <rect x="7" y="8" width="1" height="1" fill="#FFD700" />
    </svg>
  ),
  gold_helmet: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="6" ry="5" fill="#B8860B" />
      <ellipse cx="8" cy="9" rx="4" ry="3" fill="#DAA520" />
      <rect x="6" y="4" width="4" height="5" fill="#FFD700" />
      <rect x="7" y="5" width="2" height="3" fill="#FFF8DC" />
      <rect x="5" y="8" width="6" height="2" fill="#FFF8DC" />
      <rect x="6" y="5" width="1" height="1" fill="#FFFACD" />
    </svg>
  ),
  gold_chestplate: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="4" width="10" height="10" fill="#B8860B" />
      <rect x="4" y="5" width="8" height="8" fill="#DAA520" />
      <rect x="5" y="6" width="6" height="4" fill="#FFD700" />
      <rect x="6" y="5" width="4" height="8" fill="#FFF8DC" />
      <rect x="7" y="6" width="2" height="6" fill="#FFFACD" />
      <rect x="5" y="5" width="1" height="1" fill="#FFD700" />
    </svg>
  ),
  gold_boots: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="3" y="8" width="5" height="6" fill="#B8860B" />
      <rect x="8" y="8" width="5" height="6" fill="#B8860B" />
      <rect x="4" y="9" width="4" height="4" fill="#DAA520" />
      <rect x="9" y="9" width="4" height="4" fill="#DAA520" />
      <rect x="5" y="6" width="6" height="3" fill="#FFD700" />
      <rect x="6" y="7" width="4" height="1" fill="#FFF8DC" />
      <rect x="7" y="8" width="1" height="1" fill="#FFFACD" />
    </svg>
  ),

  // Food Items
  chicken_meat: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="4" ry="6" fill="#F5C6A0" />
      <ellipse cx="8" cy="9" rx="3" ry="5" fill="#FAD6B5" />
      <ellipse cx="8" cy="5" rx="2" ry="1.5" fill="#E8A87C" />
      <rect x="7" y="1" width="2" height="3" fill="#D4956B" />
      <rect x="7" y="11" width="2" height="4" fill="#DEB887" />
    </svg>
  ),
  rabbit_meat: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="3" ry="5" fill="#D4956B" />
      <ellipse cx="8" cy="9" rx="2" ry="4" fill="#E8A87C" />
      <rect x="7" y="1" width="2" height="3" fill="#C4845B" />
      <circle cx="8" cy="13" r="2" fill="#F5C6A0" />
    </svg>
  ),
  crab_meat: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="3" ry="4" fill="#FF9999" />
      <ellipse cx="8" cy="9" rx="2" ry="3" fill="#FFB3B3" />
      <rect x="3" y="9" width="3" height="1.5" fill="#FF6666" />
      <rect x="10" y="9" width="3" height="1.5" fill="#FF6666" />
      <rect x="7" y="12" width="2" height="3" fill="#FFCCCC" />
    </svg>
  ),
  cooked_chicken: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="4" ry="5" fill="#CD853F" />
      <ellipse cx="8" cy="9" rx="3" ry="4" fill="#DEB887" />
      <ellipse cx="8" cy="6" rx="2" ry="1.5" fill="#8B5E3C" />
      <rect x="7" y="1" width="2" height="3" fill="#A0522D" />
      <rect x="7" y="12" width="2" height="3" fill="#8B5E3C" />
      <circle cx="10" cy="4" r="0.8" fill="#FF6347" />
    </svg>
  ),
  cooked_rabbit: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="3" ry="4" fill="#B8860B" />
      <ellipse cx="8" cy="9" rx="2" ry="3" fill="#DAA520" />
      <rect x="7" y="1" width="2" height="3" fill="#8B6914" />
      <circle cx="8" cy="13" r="2" fill="#B8860B" />
      <circle cx="11" cy="5" r="0.8" fill="#FF4500" />
    </svg>
  ),
  cooked_crab: (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <ellipse cx="8" cy="9" rx="3" ry="3.5" fill="#DC143C" />
      <ellipse cx="8" cy="9" rx="2" ry="2.5" fill="#FF4500" />
      <rect x="3" y="9" width="3" height="1.5" fill="#B22222" />
      <rect x="10" y="9" width="3" height="1.5" fill="#B22222" />
      <rect x="7" y="11" width="2" height="2.5" fill="#FF6347" />
      <circle cx="5" cy="7" r="0.6" fill="#FFD700" />
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
