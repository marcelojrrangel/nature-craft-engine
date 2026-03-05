import { useGameStore } from '../../hooks/useGameStore';
import { gameStore } from '../../game/store';
import Joystick from './Joystick';
import { gameEvents } from '../../game/events';

export default function GameHUD() {
  const state = useGameStore();

  // Quick bar: first 5 inventory slots
  const quickBar = gameStore.inventory.slice(0, 5);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top bar: HP + resources */}
      <div className="flex items-start justify-between p-3 pointer-events-auto">
        {/* HP Bar */}
        <div className="flex flex-col gap-1">
          <div className="game-pixel-text text-[10px]" style={{ color: 'hsl(var(--foreground))' }}>
            HP
          </div>
          <div className="game-bar w-32">
            <div
              className="game-bar-fill"
              style={{
                width: `${(state.hp / state.maxHp) * 100}%`,
                background: 'hsl(var(--game-hp))',
              }}
            />
          </div>
        </div>

        {/* Resource counters */}
        <div className="flex gap-3">
          {['wood', 'stone', 'fiber'].map(id => (
            <div key={id} className="flex items-center gap-1 px-2 py-1 rounded"
              style={{ background: 'hsl(var(--card) / 0.8)' }}>
              <span className="text-lg">{id === 'wood' ? '🪵' : id === 'stone' ? '🪨' : '🌿'}</span>
              <span className="game-body-text" style={{ color: 'hsl(var(--foreground))' }}>
                {gameStore.countItem(id)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick bar at bottom center */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-auto">
        {quickBar.map((slot, i) => (
          <div key={i} className="game-slot w-12 h-12">
            {slot.item && (
              <>
                <span className="text-xl">{slot.item.icon}</span>
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

      {/* Bottom left: Joystick */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <Joystick />
      </div>

      {/* Bottom right: Action buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 pointer-events-auto">
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl active:scale-90 transition-transform"
          style={{ background: 'hsl(var(--destructive) / 0.8)' }}
          onPointerDown={() => gameEvents.emit('attack', undefined)}
        >
          ⚔️
        </button>
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl active:scale-90 transition-transform"
          style={{ background: 'hsl(var(--accent) / 0.8)' }}
          onPointerDown={() => gameEvents.emit('interact', undefined)}
        >
          🤚
        </button>
      </div>

      {/* Top-right: Menu buttons */}
      <div className="absolute top-3 right-3 flex gap-2 pointer-events-auto">
        <button className="game-btn game-btn-secondary text-sm" onClick={() => gameStore.toggleInventory()}>
          🎒 [I]
        </button>
        <button className="game-btn game-btn-secondary text-sm" onClick={() => gameStore.toggleEquipment()}>
          🛡️ [Q]
        </button>
        <button className="game-btn game-btn-secondary text-sm" onClick={() => gameStore.toggleCrafting()}>
          🔨 [C]
        </button>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] game-pixel-text"
        style={{ color: 'hsl(var(--muted-foreground))' }}>
        WASD/Setas mover · Espaço atacar · E interagir
      </div>
    </div>
  );
}
