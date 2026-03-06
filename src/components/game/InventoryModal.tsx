import { useState } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';

interface Props { onClose: () => void }

export default function InventoryModal({ onClose }: Props) {
  const { inventory, quickBar } = useGameStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);

  const handleDoubleClick = (inventoryIndex: number) => {
    const slot = inventory[inventoryIndex];
    if (!slot.item) return;

    // If already in quickBar, remove it
    const existingSlot = quickBar.indexOf(inventoryIndex);
    if (existingSlot !== -1) {
      gameStore.removeFromQuickBar(existingSlot);
      return;
    }

    // Find first empty slot
    const firstEmptySlot = quickBar.findIndex((s) => s === null);
    if (firstEmptySlot !== -1) {
      gameStore.assignToQuickBar(firstEmptySlot, inventoryIndex);
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
          {inventory.map((slot, i) => {
            const isInQuickBar = quickBar.includes(i);
            return (
              <div
                key={i}
                className={`game-slot w-14 h-14 cursor-pointer relative transition-all ${
                  isInQuickBar ? 'ring-2 ring-primary ring-inset border-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : ''
                }`}
                title={slot.item?.description}
                onDoubleClick={() => handleDoubleClick(i)}
                onContextMenu={(e) => handleContextMenu(e, i)}
              >
                {slot.item && (
                  <>
                    <span className={`text-2xl absolute inset-0 flex items-center justify-center ${isInQuickBar ? 'scale-110' : ''}`}>
                      {slot.item.icon}
                    </span>
                    {slot.quantity > 1 && (
                      <span className="absolute bottom-0 right-0.5 text-[10px] game-pixel-text"
                        style={{ color: 'hsl(var(--foreground))' }}>
                        {slot.quantity}
                      </span>
                    )}
                    {isInQuickBar && (
                      <span className="absolute top-0 left-0.5 text-[8px] font-bold text-primary bg-background/80 px-0.5 rounded">
                        {quickBar.indexOf(i) + 1}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] leading-tight" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Duplo clique: Adicionar/Remover da Barra Rápida<br/>
          Botão direito: Escolher slot específico
        </p>
      </div>

      {contextMenu && (
        <div
          className="fixed z-[60] bg-card border rounded-md shadow-md py-1 min-w-[120px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-[10px] font-semibold border-b uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Alocar no Slot
          </div>
          {[0, 1, 2, 3, 4].map((slotIdx) => (
            <button
              key={slotIdx}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors flex justify-between items-center"
              style={{ color: 'hsl(var(--foreground))' }}
              onClick={() => assignToSlot(slotIdx)}
            >
              <span>Slot {slotIdx + 1}</span>
              {quickBar[slotIdx] !== null && <span className="text-[10px] opacity-50">(ocupado)</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
