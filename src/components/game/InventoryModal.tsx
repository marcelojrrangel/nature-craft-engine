import { gameStore } from '../../game/store';

interface Props { onClose: () => void }

export default function InventoryModal({ onClose }: Props) {
  const inventory = gameStore.inventory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.7)' }}
      onClick={onClose}>
      <div className="game-modal w-80 max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="game-pixel-text text-sm" style={{ color: 'hsl(var(--primary))' }}>🎒 Inventário</h2>
          <button className="game-btn game-btn-secondary text-sm" onClick={onClose}>✕</button>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {inventory.map((slot, i) => (
            <div key={i} className="game-slot w-14 h-14 cursor-pointer"
              title={slot.item?.description}
              onClick={() => {
                if (slot.item && !slot.item.stackable) {
                  gameStore.equip('mainHand', i);
                }
              }}>
              {slot.item && (
                <>
                  <span className="text-2xl">{slot.item.icon}</span>
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
          Clique em uma ferramenta para equipar na mão
        </p>
      </div>
    </div>
  );
}
