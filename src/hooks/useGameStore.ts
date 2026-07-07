import { useSyncExternalStore } from 'react';
import { gameStore } from '../game/store';

let _mainSnapshot = buildMainSnapshot();
let _uiSnapshot = buildUISnapshot();

function buildMainSnapshot() {
  return {
    inventory: gameStore.inventory,
    equipment: gameStore.equipment,
    hp: gameStore.hp,
    maxHp: gameStore.maxHp,
    showInventory: gameStore.showInventory,
    showCrafting: gameStore.showCrafting,
    showEquipment: gameStore.showEquipment,
    showSkills: gameStore.showSkills,
    quickBar: gameStore.quickBar,
    selectedQuickBarIndex: gameStore.selectedQuickBarIndex,
    playerX: gameStore.playerX,
    playerY: gameStore.playerY,
    playerDir: gameStore.playerDir,
    worldTick: gameStore.worldTick,
    quests: gameStore.quests,
    questNotification: gameStore.questNotification,
  };
}

function buildUISnapshot() {
  return {
    showInventory: gameStore.showInventory,
    showCrafting: gameStore.showCrafting,
    showEquipment: gameStore.showEquipment,
    showSkills: gameStore.showSkills,
    showCheatPanel: gameStore.showCheatPanel,
    showQuests: gameStore.showQuests,
    questNotification: gameStore.questNotification,
  };
}

function invalidateMain() { _mainSnapshot = buildMainSnapshot(); }
function invalidateUI() { _uiSnapshot = buildUISnapshot(); }

gameStore.subscribe('inventory', invalidateMain);
gameStore.subscribe('equipment', invalidateMain);
gameStore.subscribe('player', invalidateMain);
gameStore.subscribe('world', invalidateMain);
gameStore.subscribe('ui', invalidateUI);

const subscribeMain = (cb: () => void) => {
  const unsubs = [
    gameStore.subscribe('inventory', cb),
    gameStore.subscribe('equipment', cb),
    gameStore.subscribe('player', cb),
    gameStore.subscribe('world', cb),
  ];
  return () => unsubs.forEach(u => u());
};

const subscribeUI = (cb: () => void) => gameStore.subscribe('ui', cb);

export function useGameStore() {
  return useSyncExternalStore(subscribeMain, () => _mainSnapshot);
}

export function useGameUI() {
  return useSyncExternalStore(subscribeUI, () => _uiSnapshot);
}
