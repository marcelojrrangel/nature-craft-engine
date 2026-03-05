import { gameStore } from '../../game/store';
import type { EquipSlot } from '../../game/types';

interface Props { onClose: () => void }

const SLOT_LABELS: Record<EquipSlot, { label: string; icon: string }> = {
  head: { label: 'Cabeça', icon: '🪖' },
  hands: { label: 'Mãos', icon: '🧤' },
  legs: { label: 'Pernas', icon: '👖' },
  accessory: { label: 'Acessório', icon: '💍' },
  mainHand: { label: 'Mão Principal', icon: '🖐️' },
};

export default function EquipmentModal({ onClose }: Props) {
  const equip = gameStore.equipment;
  const slots = Object.entries(SLOT_LABELS) as [EquipSlot, { label: string; icon: string }][];
  const stats = gameStore.getStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.7)' }}
      onClick={onClose}>
      <div className="game-modal w-72" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="game-pixel-text text-sm" style={{ color: 'hsl(var(--primary))' }}>🛡️ Equipamento</h2>
          <button className="game-btn game-btn-secondary text-sm" onClick={onClose}>✕</button>
        </div>
        <div className="flex flex-col gap-2">
          {slots.map(([slot, meta]) => {
            const equipped = equip[slot];
            return (
              <div key={slot} className="game-slot h-14 px-3 flex items-center gap-3 cursor-pointer"
                onClick={() => equipped.item && gameStore.unequip(slot)}>
                <span className="text-xl w-8 text-center">{meta.icon}</span>
                <div className="flex-1">
                  <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{meta.label}</div>
                  {equipped.item ? (
                    <div className="game-body-text" style={{ color: 'hsl(var(--foreground))' }}>
                      {equipped.item.icon} {equipped.item.name}
                    </div>
                  ) : (
                    <div className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Vazio</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Stats */}
        <div className="mt-3 pt-2 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="game-pixel-text text-[9px] mb-1" style={{ color: 'hsl(var(--secondary))' }}>STATS</div>
          <div className="game-body-text text-sm grid grid-cols-2 gap-1" style={{ color: 'hsl(var(--foreground))' }}>
            <span>⛏️ Min: {stats.miningSpeed.toFixed(1)}x</span>
            <span>🪓 Corte: {stats.choppingSpeed.toFixed(1)}x</span>
            <span>🏃 Vel: {stats.moveSpeed.toFixed(1)}x</span>
          </div>
        </div>
        <p className="mt-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Clique para desequipar</p>
      </div>
    </div>
  );
}
