import { useState } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';
import { RECIPES, type CraftStation, type InventorySlot } from '../../game/types';
import ItemIcon from './ItemIcon';

const ICONS = [
  'wood', 'twig', 'stone', 'fiber', 'seed', 'feather', 'pelt', 'crab_shell', 'arrow', 'campfire', 'food',
  'iron_ore', 'bronze_ore', 'gold_ore',
  'axe', 'pickaxe', 'shovel', 'knife', 'sword', 'bow',
  'iron_sword', 'iron_pickaxe', 'iron_axe', 'iron_bow',
  'helmet_rustic', 'gloves_rustic', 'boots_rustic',
  'iron_helmet', 'iron_chestplate', 'iron_boots',
  'bronze_helmet', 'bronze_chestplate', 'bronze_boots',
];

interface Props { 
  onClose: () => void;
  station?: CraftStation;
}

export default function CraftingModal({ onClose, station = 'workbench' }: Props) {
  const store = useGameStore();
  const [lastCrafted, setLastCrafted] = useState<string | null>(null);

  const handleCraft = (recipeId: string) => {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    if (gameStore.craft(recipe)) {
      setLastCrafted(recipeId);
      setTimeout(() => setLastCrafted(null), 300);
    }
  };

  const filteredRecipes = RECIPES.filter(r => 
    r.station === station || 
    r.station === 'none' || 
    (!r.station && station === 'workbench')
  );
  
  const title = station === 'campfire' ? '🔥 Culinária' : '🔨 Mesa de Trabalho';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={() => { onClose(); }}>
      <div className="game-modal w-80 max-w-[90vw] bg-background/60 backdrop-blur-md border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="game-pixel-text text-sm" style={{ color: 'hsl(var(--secondary))' }}>{title}</h2>
          <button className="game-btn game-btn-secondary text-sm" onClick={onClose}>✕</button>
        </div>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {filteredRecipes.length === 0 ? (
            <p className="text-center py-4 text-xs opacity-50">Nenhuma receita disponível aqui.</p>
          ) : (
            filteredRecipes.map(recipe => {
              const canCraft = gameStore.canCraft(recipe);
              const isJustCrafted = lastCrafted === recipe.id;

              const countItem = (itemId: string) => {
                return store.inventory.reduce((sum: number, s: InventorySlot) => s.item?.id === itemId ? sum + s.quantity : sum, 0);
              };

              return (
                <div key={recipe.id} className={`game-slot p-3 flex items-start gap-3 transition-all duration-300 bg-black/20 border-white/5 ${isJustCrafted ? 'border-primary ring-1 ring-primary/30 scale-[1.02]' : ''}`}>
                  {ICONS.includes(recipe.result.id) ? (
                    <ItemIcon itemId={recipe.result.id} size={32} />
                  ) : (
                    <span className="text-2xl drop-shadow-md">{recipe.result.icon}</span>
                  )}
                  <div className="flex-1">
                    <div className="game-body-text font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                      {recipe.name}
                    </div>
                    <div className="text-[10px] mb-1 opacity-70" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {recipe.description}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {recipe.ingredients.map((ing, i) => {
                        const has = countItem(ing.item.id);
                        const enough = has >= ing.quantity;
                        return (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded border border-white/5"
                            style={{
                              background: enough ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: enough ? '#4ade80' : '#ef4444',
                            }}>
                            {ing.item.icon} {has}/{ing.quantity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    className={`game-btn text-xs min-w-[60px] h-8 transition-all duration-150 ${
                      isJustCrafted ? 'bg-primary text-white' : canCraft ? 'game-btn-primary' : 'bg-white/5 text-white/30'
                    }`}
                    disabled={!canCraft && !isJustCrafted}
                    onClick={() => handleCraft(recipe.id)}>
                    {isJustCrafted ? '✨' : 'Criar'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
