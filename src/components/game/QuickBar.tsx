import { useEffect } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';
import ItemIcon from './ItemIcon';

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

export default function QuickBar() {
  const { quickBar, selectedQuickBarIndex: selectedIndex } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= '1' && key <= '5') {
        gameStore.selectQuickBar(parseInt(key) - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSlotClick = (index: number) => {
    gameStore.selectQuickBar(index);
  };

  const handleSlotContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    gameStore.removeFromQuickBar(index);
  };

  const getSlotItem = (index: number) => {
    const invIndex = quickBar[index];
    if (invIndex === null) return null;
    return gameStore.inventory[invIndex];
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-auto">
      {quickBar.map((_, index) => {
        const slot = getSlotItem(index);
        const isSelected = index === selectedIndex;

        return (
          <div
            key={index}
            className={`game-slot w-12 h-12 relative cursor-pointer transition-all select-none ${
              isSelected ? 'ring-2 ring-offset-1 ring-yellow-400 scale-105' : ''
            }`}
            style={{ background: 'hsl(var(--card))' }}
            onClick={() => handleSlotClick(index)}
            onContextMenu={(e) => handleSlotContextMenu(e, index)}
          >
            {/* Slot Number - Always visible at top-left */}
            <span className="absolute top-0 left-0.5 text-[8px] font-bold text-muted-foreground bg-background/50 px-0.5 rounded leading-none z-10">
              {index + 1}
            </span>

            {slot?.item && (
              <>
                {ICONS.includes(slot.item.id) ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ItemIcon itemId={slot.item.id} size={28} />
                  </div>
                ) : (
                  <span className="text-xl absolute inset-0 flex items-center justify-center">
                    {slot.item.icon}
                  </span>
                )}
                {slot.quantity > 1 && (
                  <span
                    className="absolute bottom-0 right-0.5 text-[10px] game-pixel-text"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {slot.quantity}
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
