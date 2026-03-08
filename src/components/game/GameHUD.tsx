import { useEffect, useState } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';

export default function GameHUD() {
  const stats = useGameStore();
  const [prevHp, setPrevHp] = useState(gameStore.hp);
  const [isHit, setIsHit] = useState(false);

  useEffect(() => {
    if (gameStore.hp < prevHp) {
      setIsHit(true);
      const timer = setTimeout(() => setIsHit(false), 400);
      setPrevHp(gameStore.hp);
      return () => clearTimeout(timer);
    } else {
      setPrevHp(gameStore.hp);
    }
  }, [gameStore.hp, prevHp]);

  const hpPercent = (gameStore.hp / stats.maxHp) * 100;
  const hpColor = hpPercent < 30 ? 'bg-destructive' : hpPercent < 60 ? 'bg-yellow-500' : 'bg-green-500';
  
  // Condição para estado crítico (abaixo de 30%)
  const isCritical = hpPercent < 30;

  const resourceIds = ['wood', 'stone', 'iron', 'bronze', 'gold'];
  const trackedResources = gameStore.inventory.reduce((acc, slot) => {
    if (slot.item && resourceIds.includes(slot.item.id)) {
      acc[slot.item.id] = (acc[slot.item.id] || 0) + slot.quantity;
    }
    return acc;
  }, {} as Record<string, number>);

  const resourceIcons: Record<string, string> = { wood: '🪵', stone: '🪨', iron: '⛓️', bronze: '🥉', gold: '📀' };

  return (
    <div className="fixed inset-0 pointer-events-none p-6 z-40 flex flex-col justify-between select-none">
      
      <style>{`
        @keyframes custom-shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
        .animate-hit { animation: custom-shake 0.1s ease-in-out 4; }
      `}</style>

      {/* TOPO: VIDA E RECURSOS */}
      <div className="flex justify-between items-start w-full">
        {/* Vida */}
        <div className={`flex flex-col gap-2 w-56 transition-all ${isHit ? 'animate-hit' : ''}`}>
          <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className="game-pixel-text text-[10px] text-white/70 tracking-widest">HP</span>
              <span className={`game-pixel-text text-xs ${isCritical ? 'text-destructive animate-pulse' : 'text-white'}`}>
                {Math.floor(gameStore.hp)}/{stats.maxHp}
              </span>
            </div>
            <div className="h-3.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div 
                className={`h-full transition-all duration-500 ease-out ${hpColor}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monitor de Recursos */}
        <div className="flex gap-2 items-center">
          {resourceIds.map(id => {
            const count = trackedResources[id] || 0;
            if (count === 0 && id !== 'wood' && id !== 'stone') return null;
            return (
              <div key={id} className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-lg">
                <span className="text-base drop-shadow-md">{resourceIcons[id]}</span>
                <span className="game-pixel-text text-[10px] text-white font-bold">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* INFERIOR: QUICKBAR E LEGENDA */}
      <div className="flex flex-col items-center gap-6 mb-2">
        <div className="flex gap-3 p-3 bg-black/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
          {gameStore.quickBar.map((invIndex, i) => {
            const slot = invIndex !== null ? gameStore.inventory[invIndex] : null;
            const isSelected = gameStore.selectedQuickBarIndex === i;
            return (
              <div
                key={i}
                onClick={() => gameStore.selectQuickBar(i)}
                className={`w-14 h-14 flex items-center justify-center relative rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${isSelected ? 'border-primary bg-primary/30 scale-110 shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}
                `}
              >
                <span className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-background border border-white/20 rounded-md flex items-center justify-center text-[10px] game-pixel-text text-white/60 shadow-lg">
                  {i + 1}
                </span>
                {slot?.item ? <span className="text-3xl drop-shadow-xl">{slot.item.icon}</span> : <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />}
              </div>
            );
          })}
        </div>

        <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-xl">
          <p className="game-pixel-text text-[10px] text-white/80 tracking-[0.15em] flex gap-4">
            <span className="text-primary font-bold">[I]</span> INV <span className="text-primary font-bold">[Q]</span> EQUIP <span className="text-primary font-bold">[C]</span> CRAFT <span className="text-primary font-bold">[K]</span> SKILLS <span className="text-white/40">|</span> <span className="text-secondary font-bold font-sans">ESPAÇO</span> ATACAR
          </p>
        </div>
      </div>

    </div>
  );
}
