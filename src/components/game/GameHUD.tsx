import { useEffect, useState } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';
import { useIsMobile } from '../../hooks/use-mobile';
import ItemIcon from './ItemIcon';
import { ITEMS } from '../../game/types';

const RESOURCE_IDS = ['wood', 'stone', 'fiber', 'iron_ore', 'bronze_ore', 'gold_ore'];
const ICONS = [
  'wood', 'twig', 'stone', 'fiber', 'seed', 'feather', 'pelt', 'crab_shell', 'arrow', 'campfire', 'food',
  'iron_ore', 'bronze_ore', 'gold_ore',
  'axe', 'pickaxe', 'shovel', 'knife', 'sword', 'bow',
  'iron_sword', 'iron_pickaxe', 'iron_axe', 'iron_bow',
  'bronze_sword', 'bronze_pickaxe', 'bronze_axe', 'bronze_bow',
  'gold_sword', 'gold_pickaxe', 'gold_axe', 'gold_bow',
  'helmet_rustic', 'gloves_rustic', 'boots_rustic',
  'iron_helmet', 'iron_chestplate', 'iron_boots',
  'bronze_helmet', 'bronze_chestplate', 'bronze_boots',
  'gold_helmet', 'gold_chestplate', 'gold_boots',
  'chicken_meat', 'rabbit_meat', 'crab_meat',
  'cooked_chicken', 'cooked_rabbit', 'cooked_crab',
];

export default function GameHUD() {
  const stats = useGameStore();
  const isMobile = useIsMobile();
  const [prevHp, setPrevHp] = useState(gameStore.hp);
  const [isHit, setIsHit] = useState(false);
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);

  useEffect(() => {
    if (gameStore.hp < prevHp) {
      setIsHit(true);
      const timer = setTimeout(() => setIsHit(false), 400);
      setPrevHp(gameStore.hp);
      return () => clearTimeout(timer);
    } else {
      setPrevHp(gameStore.hp);
    }
  }, [prevHp]);

  const hpPercent = (gameStore.hp / stats.maxHp) * 100;
  const hpColor = hpPercent < 30 ? 'bg-destructive' : hpPercent < 60 ? 'bg-yellow-500' : 'bg-green-500';
  const isCritical = hpPercent < 30;

  const trackedResources = gameStore.inventory.reduce((acc, slot) => {
    if (slot.item && RESOURCE_IDS.includes(slot.item.id)) {
      acc[slot.item.id] = (acc[slot.item.id] || 0) + slot.quantity;
    }
    return acc;
  }, {} as Record<string, number>);

  const currentTool = gameStore.getSelectedQuickBarItem();

  return (
    <div className="fixed inset-0 pointer-events-none p-2 sm:p-4 z-40 flex flex-col justify-between select-none">

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

      <div className="flex items-start justify-between w-full gap-1">
        <div className={`flex flex-col gap-1 sm:gap-2 transition-all ${isHit ? 'animate-hit' : ''}`}>
          <div className="bg-black/60 backdrop-blur-md p-2 sm:p-3 rounded-xl border border-white/10 shadow-2xl min-w-[120px] sm:min-w-[200px]">
            <div className="flex justify-between items-center mb-1 px-1">
              <span className="text-[8px] sm:text-[10px] text-white/70 tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace" }}>HP</span>
              <span className={`text-[9px] sm:text-xs ${isCritical ? 'text-destructive animate-pulse' : 'text-white'}`} style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {Math.floor(gameStore.hp)}/{stats.maxHp}
              </span>
            </div>
            <div className="h-2 sm:h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner relative">
              <div
                className={`h-full transition-all duration-500 ease-out ${hpColor}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {currentTool && (
            <div className="bg-black/50 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 sm:gap-2 shadow-lg">
              <span className="text-sm sm:text-base">{currentTool.icon}</span>
              <span className="text-[7px] sm:text-[9px] text-white/60 truncate max-w-[60px] sm:max-w-none" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {currentTool.name}
              </span>
              <span className="text-[7px] sm:text-[9px] text-primary/80 ml-0.5 sm:ml-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {gameStore.getStats().attackDamage.toFixed(0)} DMG
              </span>
            </div>
          )}
        </div>

        <div className="relative flex gap-1 items-start flex-wrap justify-end max-w-[180px] sm:max-w-[320px]">
          {RESOURCE_IDS.map(id => {
            const count = trackedResources[id] || 0;
            const item = ITEMS[id as keyof typeof ITEMS];
            return (
              <div
                key={id}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border flex items-center gap-1 sm:gap-1.5 shadow-lg transition-opacity cursor-help ${count > 0 ? 'bg-black/50 backdrop-blur-md border-white/10' : 'bg-black/30 border-white/5'}`}
                onMouseEnter={() => setHoveredResource(id)}
                onMouseLeave={() => setHoveredResource(null)}
              >
                {ICONS.includes(id) ? (
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 ${count === 0 ? 'opacity-40' : ''}`}>
                    <ItemIcon itemId={id} size={20} />
                  </div>
                ) : (
                  <span className={`text-xs sm:text-sm ${count === 0 ? 'opacity-40' : ''}`}>
                    {id === 'wood' ? '🪵' : id === 'stone' ? '🪨' : id === 'iron' ? '⛓️' : id === 'bronze' ? '🥉' : '📀'}
                  </span>
                )}
                <span className={`text-[8px] sm:text-[10px] font-bold ${count > 0 ? 'text-white' : 'text-white/30'}`} style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tooltip para recursos */}
        {hoveredResource && ITEMS[hoveredResource as keyof typeof ITEMS] && (
          <div
            className="absolute top-full right-0 mt-2 z-50 bg-black/90 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-xl min-w-[150px]"
            style={{ pointerEvents: 'none' }}
          >
            <div className="flex items-center gap-2 mb-1">
              {ICONS.includes(hoveredResource) ? (
                <ItemIcon itemId={hoveredResource} size={24} />
              ) : (
                <span className="text-xl">{ITEMS[hoveredResource as keyof typeof ITEMS].icon}</span>
              )}
              <span className="text-xs font-bold text-white" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {ITEMS[hoveredResource as keyof typeof ITEMS].name}
              </span>
            </div>
            <p className="text-[9px] text-white/70 leading-tight">{ITEMS[hoveredResource as keyof typeof ITEMS].description}</p>
          </div>
        )}
      </div>

      <div className={`flex flex-col items-center gap-2 sm:gap-3 mb-0 sm:mb-1 ${isMobile ? 'mb-20' : ''}`}>
        <div className="flex gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-black/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
          {gameStore.quickBar.map((invIndex, i) => {
            const slot = invIndex !== null ? gameStore.inventory[invIndex] : null;
            const isSelected = gameStore.selectedQuickBarIndex === i;
            return (
              <div
                key={i}
                onClick={() => gameStore.selectQuickBar(i)}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center relative rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${isSelected ? 'border-primary bg-primary/20 scale-110 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}
                `}
              >
                <span className={`absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 rounded-md flex items-center justify-center text-[6px] sm:text-[8px] border shadow-lg
                  ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-white/20 text-white/60'}
                `} style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  {i + 1}
                </span>
                {slot?.item ? (
                  <>
                    {ICONS.includes(slot.item.id) ? (
                      <ItemIcon itemId={slot.item.id} size={32} />
                    ) : (
                      <span className="text-xl sm:text-2xl drop-shadow-xl">{slot.item.icon}</span>
                    )}
                    {slot.item.stackable && slot.quantity > 1 && (
                      <span className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 text-[6px] sm:text-[8px] text-white/80 bg-black/60 px-0.5 sm:px-1 rounded" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                        {slot.quantity}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                )}
              </div>
            );
          })}
        </div>

        {!isMobile && (
          <div className="bg-black/60 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/10 shadow-xl">
            <p className="text-[9px] text-white/70 tracking-[0.15em] flex gap-3" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              <span className="text-primary">I</span> INV
              <span className="text-primary">Q</span> EQUIP
              <span className="text-primary">C</span> CRAFT
              <span className="text-primary">K</span> SKILLS
              <span className="text-white/30">|</span>
              <span className="text-secondary">SPACE</span> ATK
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
