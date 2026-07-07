import { useState } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';
import { QUESTS, type QuestDef, type Item } from '../../game/types';
import { ITEMS } from '../../game/types';

interface Props { onClose: () => void }

export default function QuestsModal({ onClose }: Props) {
  useGameStore();
  const [tab, setTab] = useState<'active' | 'available' | 'completed'>('active');

  const getCounts = () => {
    const qs = gameStore.quests;
    return {
      active: Object.values(qs).filter(q => q.status === 'active').length,
      available: Object.values(qs).filter(q => q.status === 'available').length,
      completed: Object.values(qs).filter(q => q.status === 'completed').length,
    };
  };

  const counts = getCounts();
  const tabs = [
    { id: 'active' as const, label: `Em Andamento (${counts.active})` },
    { id: 'available' as const, label: `Disponíveis (${counts.available})` },
    { id: 'completed' as const, label: `Concluídas (${counts.completed})` },
  ];

  const filtered = Object.values(gameStore.quests).filter(q => q.status === tab);

  const getDef = (id: string) => QUESTS.find(d => d.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={() => { onClose(); }}>
      <div className="game-modal w-96 max-w-[90vw] bg-background/60 backdrop-blur-md border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="game-pixel-text text-sm" style={{ color: 'hsl(var(--primary))' }}>📜 Missões</h2>
          <button className="game-btn game-btn-secondary text-sm" onClick={onClose}>✕</button>
        </div>

        <div className="flex gap-1 mb-3">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`flex-1 text-[9px] py-1.5 rounded border transition-all ${
                tab === t.id
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-black/20 border-white/10 text-white/50 hover:text-white/80'
              }`}
              style={{ fontFamily: "'Press Start 2P', monospace" }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs opacity-50" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              {tab === 'active' ? 'Nenhuma missão ativa.' : tab === 'available' ? 'Nenhuma missão disponível.' : 'Nenhuma missão concluída.'}
            </p>
          ) : (
            filtered.map(q => {
              const def = getDef(q.id);
              if (!def) return null;
              const isComplete = q.status === 'completed';
              const progress = q.objectives.reduce((sum, obj) => sum + Math.min(obj.current, obj.quantity), 0);
              const total = q.objectives.reduce((sum, obj) => sum + obj.quantity, 0);

              return (
                <div key={q.id} className={`game-slot p-3 border ${isComplete ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-black/20'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="game-body-text font-bold text-xs" style={{ color: isComplete ? '#4ade80' : 'hsl(var(--foreground))' }}>
                        {def.title}
                      </h3>
                      <p className="text-[9px] mt-0.5 opacity-60 leading-tight" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {def.description}
                      </p>
                    </div>
                    {q.status === 'available' && (
                      <button
                        className="game-btn game-btn-primary text-[9px] px-2 py-1"
                        onClick={() => gameStore.acceptQuest(q.id)}
                      >
                        Aceitar
                      </button>
                    )}
                    {isComplete && <span className="text-sm">✅</span>}
                  </div>

                  {!isComplete && (
                    <div className="space-y-1 mt-2">
                      {q.objectives.map((obj, i) => {
                        const done = obj.current >= obj.quantity;
                        const pct = Math.min(100, (obj.current / obj.quantity) * 100);
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-[8px] mb-0.5">
                              <span className={done ? 'text-green-400' : 'text-white/70'}>
                                {done ? '✓' : '○'} {obj.targetName}
                              </span>
                              <span className={done ? 'text-green-400' : 'text-white/50'}>
                                {Math.min(obj.current, obj.quantity)}/{obj.quantity}
                              </span>
                            </div>
                            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!isComplete && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-[8px] text-yellow-400/80">
                        🎁 {def.reward.xp ? `${def.reward.xp} XP` : ''}
                        {def.reward.items?.map(ri => {
                          const item = ITEMS[ri.itemId as keyof typeof ITEMS];
                          return item ? `, ${ri.quantity}x ${item.icon}${item.name}` : '';
                        }).join('')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
