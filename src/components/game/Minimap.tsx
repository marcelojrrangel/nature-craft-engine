import { useEffect, useRef } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';

const MAP_W = 100;
const MAP_H = 100;
const TILE = 16;
const MAP_PIXELS_W = MAP_W * TILE;
const MAP_PIXELS_H = MAP_H * TILE;
const MINIMAP_SCALE = 0.08;
const MINIMAP_W = Math.floor(MAP_PIXELS_W * MINIMAP_SCALE);
const MINIMAP_H = Math.floor(MAP_PIXELS_H * MINIMAP_SCALE);

export default function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playerX, playerY } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, MINIMAP_W, MINIMAP_H);

      // Draw safe zone (center)
      const safeZoneX = (MAP_PIXELS_W / 2) * MINIMAP_SCALE;
      const safeZoneY = (MAP_PIXELS_H / 2) * MINIMAP_SCALE;
      const safeZoneRadius = 100 * MINIMAP_SCALE;
      ctx.beginPath();
      ctx.arc(safeZoneX, safeZoneY, safeZoneRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw workbench
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(safeZoneX - 2, safeZoneY - 2, 4, 4);

      // Draw player
      const px = playerX * MINIMAP_SCALE;
      const py = playerY * MINIMAP_SCALE;
      ctx.fillStyle = '#00FF00';
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    render();
    const interval = setInterval(render, 100);

    return () => clearInterval(interval);
  }, [playerX, playerY]);

  return (
    <div className="relative bg-black/50 backdrop-blur-md rounded-lg border border-white/10 shadow-lg">
      <canvas
        ref={canvasRef}
        width={MINIMAP_W}
        height={MINIMAP_H}
        className="rounded-lg"
      />
      <div className="absolute bottom-1 right-1 text-[6px] text-white/50" style={{ fontFamily: '"Press Start 2P", monospace' }}>
        {MAP_W}x{MAP_H}
      </div>
    </div>
  );
}
