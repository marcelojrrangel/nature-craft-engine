import { useState } from 'react';
import { gameStore } from '../../game/store';
import { SKILLS_CONFIG, SKILL_XP_PER_LEVEL, MAX_SKILL_LEVEL } from '../../game/types';

interface Props { onClose: () => void }

export default function SkillsModal({ onClose }: Props) {
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
      onClick={() => { onClose(); setConfirmUnlearn(null); }}>
      <div className="game-modal w-96 max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="game-pixel-text text-lg" style={{ color: 'hsl(var(--primary))' }}>📖 Habilidades</h2>
          <button className="game-btn game-btn-secondary text-sm" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-3">
          {toolTypes.map((toolType) => {
            const config = SKILLS_CONFIG[toolType];
            const skill = gameStore.getSkill(toolType);
            const level = skill?.level || 0;
            const xp = skill?.xp || 0;
            const progress = (xp / SKILL_XP_PER_LEVEL) * 100;
            const bonusPercent = Math.round(level * config.bonusPerLevel * 100);

            return (
              <div key={toolType} className="p-3 rounded-md" style={{ background: 'hsl(var(--card))' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <div className="game-pixel-text text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                        {config.name}
                      </div>
                      <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Nível {level}/{MAX_SKILL_LEVEL}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`game-btn text-xs px-2 py-1 ${confirmUnlearn === toolType ? 'bg-red-500 text-white' : 'game-btn-secondary'}`}
                    onClick={() => handleUnlearn(toolType)}
                    disabled={level === 0}
                    style={{ opacity: level === 0 ? 0.5 : 1 }}
                  >
                    {confirmUnlearn === toolType ? 'Confirmar?' : 'Desaprender'}
                  </button>
                </div>

                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      background: level >= MAX_SKILL_LEVEL ? 'hsl(var(--primary))' : 'hsl(var(--accent))'
                    }}
                  />
                </div>

                <div className="flex justify-between mt-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <span>{config.description}</span>
                  <span className="game-pixel-text">+{bonusPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Use ferramentas e armas para ganhar XP e subir de nível
        </p>
      </div>
    </div>
  );
}
