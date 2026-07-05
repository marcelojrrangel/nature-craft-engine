import { useState } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';
import { type Item } from '../../game/types';
import ItemIcon from './ItemIcon';

const ICONS = [
  'wood', 'twig', 'stone', 'fiber', 'seed', 'feather', 'pelt', 'crab_shell', 'arrow', 'campfire', 'food',
  'iron_ore', 'bronze_ore', 'gold_ore',
  'axe', 'pickaxe', 'shovel', 'knife', 'sword', 'bow',
  'iron_sword', 'iron_pickaxe', 'iron_axe', 'iron_bow',
  'helmet_rustic', 'gloves_rustic', 'boots_rustic',
  'iron_helmet', 'iron_chestplate', 'iron_boots',
  'bronze_helmet', 'bronze_chestplate', 'bronze_boots',
];

interface Props { onClose: () => void }

export default function InventoryModal({ onClose }: Props) {
  useGameStore();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, index: number } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ item: Item, x: number, y: number } | null>(null);

  const handleSlotClick = (index: number) => {
    setContextMenu(null);
    gameStore.useItem(index);
  };

  const handleRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (!gameStore.inventory[index].item) return;
    setContextMenu({ x: e.clientX, y: e.clientY, index });
  };

  const handleMouseEnter = (e: React.MouseEvent, item: Item | null) => {
    if (item) {
      setHoveredItem({ item, x: e.clientX, y: e.clientY });
    }
  };

  const assignToQuickBar = (quickBarIndex: number) => {
    if (contextMenu) {
      gameStore.assignToQuickBar(quickBarIndex, contextMenu.index);
      setContextMenu(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={() => { onClose(); setContextMenu(null); }}>
      <div className="game-modal w-80 max-w-[90vw] bg-background/60 backdrop-blur-md border-white/10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="game-pixel-text text-lg" style={{ color: 'hsl(var(--primary))' }}>🎒 Mochila</h2>
          <button className="game-btn game-btn-secondary text-sm" onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {gameStore.inventory.map((slot, i) => (
            <div
              key={i}
              className={`game-slot w-full aspect-square flex items-center justify-center relative cursor-pointer hover:bg-white/10 transition-colors ${slot.item ? 'bg-black/20 border-white/10' : 'bg-black/10 border-white/5'}`}
              onClick={() => handleSlotClick(i)}
              onContextMenu={(e) => handleRightClick(e, i)}
              onMouseEnter={(e) => handleMouseEnter(e, slot.item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {slot.item && (
                <>
                  {ICONS.includes(slot.item.id) ? (
                    <ItemIcon itemId={slot.item.id} size={32} />
                  ) : (
                    <span className="text-2xl drop-shadow-md">{slot.item.icon}</span>
                  )}
                  {slot.quantity > 1 && (
                    <span className="absolute bottom-0 right-1 text-[10px] font-bold game-pixel-text text-white">
                      {slot.quantity}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-black/20 rounded border border-white/5">
          <p className="text-[10px] opacity-60 leading-tight">
            Clique: Usar • Direito: Atalho • Mouse: Info
          </p>
        </div>
      </div>

      {/* TOOLTIP MODERNA */}
      {hoveredItem && !contextMenu && (
        <div 
          className="fixed z-[70] pointer-events-none bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-2xl animate-in fade-in zoom-in duration-150 min-w-[140px]"
          style={{ 
            top: hoveredItem.y + 15, 
            left: Math.min(hoveredItem.x + 15, window.innerWidth - 160) 
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{hoveredItem.item.icon}</span>
            <span className="font-bold text-sm text-white">{hoveredItem.item.name}</span>
          </div>
          <p className="text-[10px] text-white/70 leading-relaxed max-w-[180px]">
            {hoveredItem.item.description}
          </p>
          {hoveredItem.item.bonus && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Status Bônus:</p>
              {hoveredItem.item.bonus.hp && <p className="text-[10px] text-green-400">+{hoveredItem.item.bonus.hp} Saúde</p>}
              {hoveredItem.item.bonus.dmg && <p className="text-[10px] text-red-400">+{hoveredItem.item.bonus.dmg * 100}% Dano</p>}
              {hoveredItem.item.bonus.moveSpeed && <p className="text-[10px] text-blue-400">+{hoveredItem.item.bonus.moveSpeed * 100}% Velocidade</p>}
            </div>
          )}
        </div>
      )}

      {/* CONTEXT MENU (Barra de Acesso Rápido) */}
      {contextMenu && (
        <div 
          className="fixed z-[60] bg-background/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-1 w-40 animate-in fade-in zoom-in duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-2 border-b border-white/5 mb-1 text-center">
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-tighter text-primary">Atribuir Atalho</p>
          </div>
          {[0, 1, 2, 3, 4].map(idx => (
            <button
              key={idx}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-primary hover:text-white rounded transition-colors flex justify-between items-center group"
              onClick={() => assignToQuickBar(idx)}
            >
              <span>Slot {idx + 1}</span>
              <span className="opacity-0 group-hover:opacity-50 text-[10px]">Pos {idx + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
