import { gameEvents } from '../../game/events';

export default function MobileControls() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-auto">
      <button
        className="w-14 h-14 rounded-full bg-primary/30 border-2 border-primary/50 flex items-center justify-center text-white text-xs active:scale-90 transition-transform select-none touch-none"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
        onPointerDown={(e) => { e.preventDefault(); gameEvents.emit('attack', undefined); }}
      >
        ATK
      </button>
      <button
        className="w-14 h-14 rounded-full bg-accent/30 border-2 border-accent/50 flex items-center justify-center text-white text-xs active:scale-90 transition-transform select-none touch-none"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
        onPointerDown={(e) => { e.preventDefault(); gameEvents.emit('interact', undefined); }}
      >
        USE
      </button>
    </div>
  );
}
