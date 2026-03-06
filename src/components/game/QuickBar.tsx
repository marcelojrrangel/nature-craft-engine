import { useEffect } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';

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
            {slot?.item ? (
              <>
                <span className="text-xl absolute inset-0 flex items-center justify-center">
                  {slot.item.icon}
                </span>
                {slot.quantity > 1 && (
                  <span
                    className="absolute bottom-0 right-0.5 text-[10px] game-pixel-text"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {slot.quantity}
                  </span>
                )}
              </>
            ) : (
              <span
                className="absolute inset-0 flex items-center justify-center text-[10px] game-pixel-text"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {index + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
