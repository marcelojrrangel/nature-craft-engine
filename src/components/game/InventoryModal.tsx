import { useState } from 'react';
import { gameStore } from '../../game/store';

interface Props { onClose: () => void }

export default function InventoryModal({ onClose }: Props) {
  const inventory = gameStore.inventory;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);

  const handleDoubleClick = (index: number) => {
    const slot = inventory[index];
    if (!slot.item) return;
    const firstEmptySlot = gameStore.quickBar.findIndex((s) => s === null);
    if (firstEmptySlot !== -1) {
      gameStore.assignToQuickBar(firstEmptySlot, index);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (inventory[index].item) {
      setContextMenu({ x: e.clientX, y: e.clientY, index });
    }
  };

  const assignToSlot = (slotIndex: number) => {
    if (contextMenu) {
      gameStore.assignToQuickBar(slotIndex, contextMenu.index);
      setContextMenu(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.7)' }}
      onClick={() => { onClose(); setContextMenu(null); }}>
      <div className="game-modal w-80 max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="game-pixel-text text-sm" style={{ color: 'hsl(var(--primary))' }}>🎒 Inventário</h2>
          <button className="game-btn game-btn-secondary text-sm" onClick={onClose}>✕</button>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {inventory.map((slot, i) => (
            <div
              key={i}
              className="game-slot w-14 h-14 cursor-pointer relative"
              title={slot.item?.description}
              onDoubleClick={() => handleDoubleClick(i)}
              onContextMenu={(e) => handleContextMenu(e, i)}
              onClick={() => {
                if (slot.item && !slot.item.stackable) {
                  gameStore.equip('mainHand', i);
                }
              }}
            >
              {slot.item && (
                <>
                  <span className="text-2xl absolute inset-0 flex items-center justify-center">
                    {slot.item.icon}
                  </span>
                  {slot.quantity > 1 && (
                    <span className="absolute bottom-0 right-0.5 text-[10px] game-pixel-text"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {slot.quantity}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Duplo clique para alocar · Botão direito para escolher slot
        </p>
      </div>

      {contextMenu && (
        <div
          className="fixed z-[60] bg-card border rounded-md shadow-md py-1 min-w-[120px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-xs font-semibold border-b" style={{ color: 'hsl(var(--foreground))' }}>
            Alocar no Slot
          </div>
          {[0, 1, 2, 3, 4].map((slotIdx) => (
            <button
              key={slotIdx}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
              style={{ color: 'hsl(var(--foreground))' }}
              onClick={() => assignToSlot(slotIdx)}
            >
              Slot {slotIdx + 1}
              {gameStore.quickBar[slotIdx] !== null && ' (ocupado)'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
