import { useState } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';
import { RECIPES, type CraftStation } from '../../game/types';

interface Props { 
  onClose: () => void;
  station?: CraftStation;
}

export default function CraftingModal({ onClose, station = 'workbench' }: Props) {
  useGameStore();
  const [lastCrafted, setLastCrafted] = useState<string | null>(null);

  const handleCraft = (recipeId: string) => {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    if (gameStore.craft(recipe)) {
      setLastCrafted(recipeId);
      setTimeout(() => setLastCrafted(null), 300);
    }
  };

  // Filter recipes by station. Recipes with station 'none' show everywhere.
  const filteredRecipes = RECIPES.filter(r => 
    r.station === station || 
    r.station === 'none' || 
    (!r.station && station === 'workbench') // Fallback for old recipes
  );
  
  const title = station === 'campfire' ? '🔥 Culinária' : '🔨 Mesa de Trabalho';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.7)' }}
      onClick={() => { onClose(); }}>
      <div className="game-modal w-80 max-w-[90vw]" onClick={e => e.stopPropagation()}>
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

              return (
                <div key={recipe.id} className={`game-slot p-3 flex items-start gap-3 transition-all duration-300 ${isJustCrafted ? 'border-primary ring-1 ring-primary/30' : ''}`}>
                  <span className="text-2xl">{recipe.result.icon}</span>
                  <div className="flex-1">
                    <div className="game-body-text font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      {recipe.name}
                    </div>
                    <div className="text-xs mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {recipe.description}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {recipe.ingredients.map((ing, i) => {
                        const has = gameStore.countItem(ing.item.id);
                        const enough = has >= ing.quantity;
                        return (
                          <span key={i} className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              background: enough ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--destructive) / 0.2)',
                              color: enough ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                            }}>
                            {ing.item.icon} {has}/{ing.quantity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    className={`game-btn text-sm min-w-[60px] transition-all duration-150 ${
                      isJustCrafted ? 'scale-110 bg-primary text-white' : canCraft ? 'game-btn-primary' : ''
                    }`}
                    style={
                      !isJustCrafted && !canCraft 
                        ? { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
                        : {}
                    }
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
