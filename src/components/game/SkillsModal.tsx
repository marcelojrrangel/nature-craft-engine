import { useState } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';
import { SKILLS_CONFIG, MAX_SKILL_LEVEL } from '../../game/types';

interface Props { onClose: () => void }

export default function SkillsModal({ onClose }: Props) {
  useGameStore();
  const [confirmUnlearn, setConfirmUnlearn] = useState<string | null>(null);

  const handleUnlearn = (toolType: string) => {
    if (confirmUnlearn === toolType) {
      gameStore.unlearnSkill(toolType);
      setConfirmUnlearn(null);
    } else {
      setConfirmUnlearn(toolType);
    }
  };

  const toolTypes = Object.keys(SKILLS_CONFIG);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.7)' }}
      onClick={() => { onClose(); }}>
      <div className="game-modal w-80 max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="game-pixel-text text-lg" style={{ color: 'hsl(var(--primary))' }}>📖 Habilidades</h2>
          <button className="game-btn game-btn-secondary text-sm" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {toolTypes.map((toolType) => {
            const config = SKILLS_CONFIG[toolType];
            const skill = gameStore.getSkill(toolType);
            const level = skill?.level || 0;
            const currentXp = skill?.xp || 0;
            const neededXp = gameStore.getXPForLevel(level);
            const progress = level >= MAX_SKILL_LEVEL ? 100 : (currentXp / neededXp) * 100;

            return (
              <div key={toolType} className="game-slot p-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <div>
                      <div className="game-body-text font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                        {config.name}
                      </div>
                      <div className="text-[10px] opacity-70" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Nível {level} {level >= MAX_SKILL_LEVEL && '(MÁX)'}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="text-[10px] text-destructive hover:underline"
                    onClick={() => handleUseFromMenu(toolType)}
                    onDoubleClick={() => handleUnlearn(toolType)}
                    title="Clique duplo para resetar (Perda total de XP)"
                  >
                    {confirmUnlearn === toolType ? 'Confirmar?' : 'Reset'}
                  </button>
                </div>

                <div className="relative h-4 bg-muted rounded-full overflow-hidden border border-border">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white mix-blend-difference">
                    {level >= MAX_SKILL_LEVEL ? 'GRADUADO' : `${Math.floor(currentXp)} / ${neededXp} XP`}
                  </div>
                </div>
                <p className="text-[10px] mt-1 opacity-60 leading-tight">
                  {config.description} (+{(level * config.bonusPerLevel * 100).toFixed(0)}%)
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[10px] text-center opacity-50">
          Ganhe XP realizando ações com a ferramenta correspondente.
        </p>
      </div>
    </div>
  );
}

// Small helper to handle the reset confirmation timeout
function handleUseFromMenu(toolType: string) {
  // Logic already handled in component via state
}
