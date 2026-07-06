import { useState, useMemo } from 'react';
import { gameStore } from '../../game/store';
import { useGameStore } from '../../hooks/useGameStore';
import { ITEMS, SKILLS_CONFIG, MAX_SKILL_LEVEL } from '../../game/types';
import ItemIcon from './ItemIcon';

const ITEM_IDS = Object.keys(ITEMS).sort();

const ICONS_LIST = [
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

type Tab = 'items' | 'stats' | 'skills' | 'world';

export default function CheatPanel({ onClose }: { onClose: () => void }) {
  useGameStore();
  const [tab, setTab] = useState<Tab>('items');
  const [search, setSearch] = useState('');
  const [qty, setQty] = useState(64);
  const [hpInput, setHpInput] = useState(String(gameStore.hp));
  const [teleportX, setTeleportX] = useState(String(Math.floor(gameStore.playerX)));
  const [teleportY, setTeleportY] = useState(String(Math.floor(gameStore.playerY)));

  const filteredItems = useMemo(() => {
    if (!search.trim()) return ITEM_IDS;
    const lower = search.toLowerCase();
    return ITEM_IDS.filter(id => {
      const item = ITEMS[id as keyof typeof ITEMS];
      return item && (item.id.toLowerCase().includes(lower) || item.name.toLowerCase().includes(lower) || item.description.toLowerCase().includes(lower));
    });
  }, [search]);

  const handleTeleport = () => {
    const x = parseInt(teleportX, 10);
    const y = parseInt(teleportY, 10);
    if (!isNaN(x) && !isNaN(y)) {
      gameStore.playerX = x;
      gameStore.playerY = y;
      gameStore.notify('world');
    }
  };

  const handleResetWorld = () => {
    gameStore.resourceStates = {};
    gameStore.chickenStates = {};
    gameStore.crabStates = {};
    gameStore.bearStates = {};
    gameStore.rabbitStates = {};
    gameStore.placedItems = [];
    gameStore.respawnQueue = [];
    gameStore.notify('world');
    window.location.reload();
  };

  const tabClass = (t: Tab) =>
    `px-3 py-1.5 text-[9px] rounded-lg border transition-colors cursor-pointer ${tab === t ? 'bg-primary/20 border-primary text-primary' : 'bg-black/40 border-white/10 text-white/60 hover:border-white/30'}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-black/90 border border-white/20 rounded-2xl shadow-2xl w-[600px] max-w-[95vw] max-h-[85vh] flex flex-col" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <span className="text-primary text-[10px] tracking-wider">ADMIN PANEL</span>
          <span className="text-[8px] text-white/40">DEV MODE</span>
        </div>

        <div className="flex gap-1.5 p-2.5 border-b border-white/5 bg-black/30">
          <button className={tabClass('items')} onClick={() => setTab('items')}>ITENS</button>
          <button className={tabClass('stats')} onClick={() => setTab('stats')}>STATS</button>
          <button className={tabClass('skills')} onClick={() => setTab('skills')}>SKILLS</button>
          <button className={tabClass('world')} onClick={() => setTab('world')}>MUNDO</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 min-h-[200px]">
          {tab === 'items' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Buscar item..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-[9px] text-white/80 outline-none focus:border-primary/50"
                />
                <select
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="bg-black/60 border border-white/20 rounded-lg px-2 py-1.5 text-[9px] text-white/80 outline-none"
                >
                  <option value={1}>x1</option>
                  <option value={10}>x10</option>
                  <option value={64}>x64</option>
                  <option value={999}>x999</option>
                </select>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-[300px] overflow-y-auto p-1">
                {filteredItems.map(id => {
                  const item = ITEMS[id as keyof typeof ITEMS];
                  if (!item) return null;
                  return (
                    <button
                      key={id}
                      title={`${item.name} (${id})`}
                      onClick={() => gameStore.cheatAddItem(id, qty)}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/50 transition-all cursor-pointer"
                    >
                      {ICONS_LIST.includes(id) ? (
                        <ItemIcon itemId={id} size={24} />
                      ) : (
                        <span className="text-sm">{item.icon}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => gameStore.cheatGiveAll()} className="flex-1 px-2 py-1.5 bg-yellow-600/30 border border-yellow-600/50 rounded-lg text-[8px] text-yellow-400 hover:bg-yellow-600/50">DAR TODOS</button>
                <button onClick={() => gameStore.cheatClearInventory()} className="px-2 py-1.5 bg-red-600/30 border border-red-600/50 rounded-lg text-[8px] text-red-400 hover:bg-red-600/50">LIMPAR INV</button>
              </div>
            </div>
          )}

          {tab === 'stats' && (
            <div className="flex flex-col gap-4 p-2">
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-white/70 w-20">HP</span>
                <input
                  type="range"
                  min={0}
                  max={gameStore.maxHp}
                  value={gameStore.hp}
                  onChange={e => gameStore.cheatSetHp(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-[9px] text-white w-12 text-right">{Math.floor(gameStore.hp)}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[9px] text-white/70 w-20">Set HP</span>
                <input
                  type="number"
                  value={hpInput}
                  onChange={e => setHpInput(e.target.value)}
                  onBlur={() => { const v = parseInt(hpInput, 10); if (!isNaN(v)) gameStore.cheatSetHp(v); }}
                  className="flex-1 bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-[9px] text-white/80 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[9px] text-white/70 w-20">Max HP</span>
                <input
                  type="number"
                  value={gameStore.maxHp}
                  onChange={e => { gameStore.maxHp = Math.max(1, Number(e.target.value)); gameStore.notify('player'); }}
                  className="flex-1 bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-[9px] text-white/80 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[9px] text-white/70 w-20">GOD MODE</span>
                <button
                  onClick={() => gameStore.toggleGodMode()}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] transition-all ${gameStore.godMode ? 'bg-green-600/40 border-green-500 text-green-400' : 'bg-red-600/30 border-red-600/50 text-red-400'}`}
                >
                  {gameStore.godMode ? 'ATIVADO' : 'DESATIVADO'}
                </button>
              </div>
            </div>
          )}

          {tab === 'skills' && (
            <div className="flex flex-col gap-2 p-1">
              {Object.entries(SKILLS_CONFIG).map(([id, config]) => {
                const skill = gameStore.skills[id];
                const level = skill?.level || 0;
                return (
                  <div key={id} className="flex items-center gap-2 bg-black/40 rounded-lg border border-white/5 p-2">
                    <span className="text-sm w-6">{config.icon}</span>
                    <span className="text-[8px] text-white/70 w-24 truncate">{config.name}</span>
                    <input
                      type="range"
                      min={0}
                      max={MAX_SKILL_LEVEL}
                      value={level}
                      onChange={e => gameStore.cheatSetSkill(id, Number(e.target.value))}
                      className="flex-1 accent-primary max-w-[200px]"
                    />
                    <span className="text-[9px] text-white w-8 text-right">{level}/{MAX_SKILL_LEVEL}</span>
                    <button
                      onClick={() => gameStore.cheatSetSkill(id, MAX_SKILL_LEVEL)}
                      className="px-1.5 py-0.5 bg-primary/20 border border-primary/30 rounded text-[7px] text-primary"
                    >
                      MAX
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'world' && (
            <div className="flex flex-col gap-3 p-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-white/70 w-20">Teleporte</span>
                <input
                  type="number"
                  value={teleportX}
                  onChange={e => setTeleportX(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-[9px] text-white/80 outline-none w-20"
                  placeholder="X"
                />
                <input
                  type="number"
                  value={teleportY}
                  onChange={e => setTeleportY(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-[9px] text-white/80 outline-none w-20"
                  placeholder="Y"
                />
                <button onClick={handleTeleport} className="px-2 py-1.5 bg-blue-600/30 border border-blue-600/50 rounded-lg text-[8px] text-blue-400 hover:bg-blue-600/50">IR</button>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] text-white/40 mb-1">COORDENADAS ATUAIS: {Math.floor(gameStore.playerX)}, {Math.floor(gameStore.playerY)}</span>
                <button onClick={() => { gameStore.save(); }} className="px-3 py-1.5 bg-green-600/30 border border-green-600/50 rounded-lg text-[9px] text-green-400 hover:bg-green-600/50 text-left">SALVAR JOGO</button>
                <button onClick={() => { gameStore.load(); window.location.reload(); }} className="px-3 py-1.5 bg-blue-600/30 border border-blue-600/50 rounded-lg text-[9px] text-blue-400 hover:bg-blue-600/50 text-left">CARREGAR JOGO</button>
                <button onClick={() => { if (confirm('Resetar todo o progresso?')) { gameStore.resetSave(); window.location.reload(); } }} className="px-3 py-1.5 bg-red-600/30 border border-red-600/50 rounded-lg text-[9px] text-red-400 hover:bg-red-600/50 text-left">RESETAR JOGO</button>
                <button onClick={handleResetWorld} className="px-3 py-1.5 bg-orange-600/30 border border-orange-600/50 rounded-lg text-[9px] text-orange-400 hover:bg-orange-600/50 text-left">RESETAR MUNDO (recursos + NPCs)</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-3 border-t border-white/10">
          <span className="text-[7px] text-white/30">{gameStore.godMode && '☠️ GOD MODE ATIVO'}</span>
          <button onClick={onClose} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-[9px] text-white/70 hover:bg-white/20">FECHAR</button>
        </div>
      </div>
    </div>
  );
}
