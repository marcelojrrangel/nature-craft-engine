import { useSyncExternalStore } from 'react';
import { gameStore } from '../game/store';

// Module-level cached snapshots to satisfy useSyncExternalStore's referential equality requirement

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
  };
}

function buildUISnapshot() {
  return {
    showInventory: gameStore.showInventory,
    showCrafting: gameStore.showCrafting,
    showEquipment: gameStore.showEquipment,
    showSkills: gameStore.showSkills,
  };
}

// Invalidate on store change
gameStore.subscribe(() => {
  _mainSnapshot = buildMainSnapshot();
  _uiSnapshot = buildUISnapshot();
});

const subscribe = (cb: () => void) => gameStore.subscribe(cb);

export function useGameStore() {
  return useSyncExternalStore(subscribe, () => _mainSnapshot);
}

export function useGameUI() {
  return useSyncExternalStore(subscribe, () => _uiSnapshot);
}
