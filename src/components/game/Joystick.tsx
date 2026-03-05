import { useCallback, useRef, useState } from 'react';
import { gameEvents } from '../../game/events';

export default function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const maxDist = 36;

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
    setPos({ x: dx, y: dy });
    // Send to game
    const nx = dx / maxDist;
    const ny = dy / maxDist;
    gameEvents.emit('joystickMove', { x: nx, y: ny });
  }, []);

  const handleEnd = useCallback(() => {
    setPos({ x: 0, y: 0 });
    setActive(false);
    gameEvents.emit('joystickMove', { x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={baseRef}
      className="w-28 h-28 rounded-full border-2 flex items-center justify-center relative select-none touch-none"
      style={{
        borderColor: 'hsl(var(--border))',
        background: 'hsl(var(--muted) / 0.4)',
      }}
      onPointerDown={(e) => {
        setActive(true);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        handleMove(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => { if (active) handleMove(e.clientX, e.clientY); }}
      onPointerUp={handleEnd}
      onPointerCancel={handleEnd}
    >
      <div
        className="w-12 h-12 rounded-full transition-transform"
        style={{
          background: 'hsl(var(--primary) / 0.7)',
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          boxShadow: '0 0 10px hsl(var(--primary) / 0.4)',
        }}
      />
    </div>
  );
}
