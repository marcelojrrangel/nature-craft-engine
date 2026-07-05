import { useEffect, useRef, useState } from 'react';
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
  const { playerX, playerY, worldTick } = useGameStore();
  const [position, setPosition] = useState({ x: 20, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

      // Draw resources
      const resources = gameStore.resources || [];
      resources.forEach(res => {
        if (!res.active) return;
        const x = res.x * MINIMAP_SCALE;
        const y = res.y * MINIMAP_SCALE;
        let color = '#888888';
        if (res.resourceType === 'tree' || res.resourceType === 'dead_tree') color = '#228B22';
        else if (res.resourceType === 'bush') color = '#32CD32';
        else if (res.resourceType === 'rock' || res.resourceType === 'small_rock') color = '#808080';
        else if (res.resourceType === 'iron_ore') color = '#8B7355';
        else if (res.resourceType === 'bronze_ore') color = '#CD853F';
        else if (res.resourceType === 'gold_ore') color = '#FFD700';
        ctx.fillStyle = color;
        ctx.fillRect(x - 1, y - 1, 2, 2);
      });

      // Draw NPCs
      const npcs = [
        ...(gameStore.chickens || []),
        ...(gameStore.crabs || []),
        ...(gameStore.bears || []),
        ...(gameStore.rabbits || []),
      ];
      npcs.forEach(npc => {
        if (!npc.sprite || !npc.sprite.active) return;
        const x = npc.sprite.x * MINIMAP_SCALE;
        const y = npc.sprite.y * MINIMAP_SCALE;
        let color = '#FFA500';
        if (npc.id?.includes('bear')) color = '#FF4500';
        else if (npc.id?.includes('rabbit')) color = '#F5F5DC';
        else if (npc.id?.includes('chicken')) color = '#FFFFFF';
        else if (npc.id?.includes('crab')) color = '#FF6347';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw placed items (campfires, etc)
      const placedItems = gameStore.placedItems || [];
      placedItems.forEach(item => {
        const x = item.x * MINIMAP_SCALE;
        const y = item.y * MINIMAP_SCALE;
        let color = '#FF4500';
        if (item.type === 'campfire') color = '#FF4500';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

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
  }, [playerX, playerY, worldTick]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed bg-black/50 backdrop-blur-md rounded-lg border border-white/10 shadow-lg cursor-move select-none"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 50,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 bg-black/30">
        <span className="text-[8px] text-white/70" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          MAPA
        </span>
        <span className="text-[6px] text-white/50" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          {MAP_W}x{MAP_H}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_W}
        height={MINIMAP_H}
        className="rounded-b-lg"
      />
    </div>
  );
}
