import { useState } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';
import { RECIPES } from '../../game/types';

interface Props { onClose: () => void }

export default function CraftingModal({ onClose }: Props) {
  useGameStore();
  const [msg, setMsg] = useState('');

  const handleCraft = (recipeId: string) => {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    if (gameStore.craft(recipe)) {
      setMsg(`✅ ${recipe.name} criado!`);
      setTimeout(() => setMsg(''), 1500);
    } else {
      setMsg('❌ Materiais insuficientes');
      setTimeout(() => setMsg(''), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.7)' }}
      onClick={() => { onClose(); }}>
      <div className="game-modal w-80 max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="game-pixel-text text-sm" style={{ color: 'hsl(var(--secondary))' }}>🔨 Mesa de Trabalho</h2>
          <button className="game-btn game-btn-secondary text-sm" onClick={onClose}>✕</button>
        </div>

        <div className="flex flex-col gap-2">
          {RECIPES.map(recipe => {
            const canCraft = gameStore.canCraft(recipe);
            return (
              <div key={recipe.id} className="game-slot p-3 flex items-start gap-3">
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
                  className={`game-btn text-sm ${canCraft ? 'game-btn-primary' : ''}`}
                  style={canCraft ? {} : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                  disabled={!canCraft}
                  onClick={() => handleCraft(recipe.id)}>
                  Criar
                </button>
              </div>
            );
          })}
        </div>

        {msg && (
          <div className="mt-2 text-center game-body-text" style={{ color: 'hsl(var(--foreground))' }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
