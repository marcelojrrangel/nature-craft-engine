import { useCallback, useRef, useSyncExternalStore } from 'react';
import { gameStore } from '../game/store';

interface GameSnapshot {
  inventory: typeof gameStore.inventory;
  equipment: typeof gameStore.equipment;
  hp: number;
  maxHp: number;
  showInventory: boolean;
  showCrafting: boolean;
  showEquipment: boolean;
}

let cachedSnapshot: GameSnapshot | null = null;
let snapshotVersion = 0;

function invalidateSnapshot() {
  snapshotVersion++;
  cachedSnapshot = null;
}

// Subscribe once to invalidate cache
gameStore.subscribe(invalidateSnapshot);

function getSnapshot(): GameSnapshot {
  if (!cachedSnapshot) {
    cachedSnapshot = {
      inventory: gameStore.inventory,
      equipment: gameStore.equipment,
      hp: gameStore.hp,
      maxHp: gameStore.maxHp,
      showInventory: gameStore.showInventory,
      showCrafting: gameStore.showCrafting,
      showEquipment: gameStore.showEquipment,
    };
  }
  return cachedSnapshot;
}

const subscribe = (cb: () => void) => gameStore.subscribe(cb);

export function useGameStore() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

// UI-only snapshot
let cachedUISnapshot: { showInventory: boolean; showCrafting: boolean; showEquipment: boolean } | null = null;
let uiVersion = 0;

function invalidateUI() {
  const prev = cachedUISnapshot;
  const next = {
    showInventory: gameStore.showInventory,
    showCrafting: gameStore.showCrafting,
    showEquipment: gameStore.showEquipment,
  };
  if (prev && prev.showInventory === next.showInventory && prev.showCrafting === next.showCrafting && prev.showEquipment === next.showEquipment) {
    return;
  }
  cachedUISnapshot = next;
  uiVersion++;
}

gameStore.subscribe(invalidateUI);

function getUISnapshot() {
  if (!cachedUISnapshot) {
    cachedUISnapshot = {
      showInventory: gameStore.showInventory,
      showCrafting: gameStore.showCrafting,
      showEquipment: gameStore.showEquipment,
    };
  }
  return cachedUISnapshot;
}

export function useGameUI() {
  return useSyncExternalStore(subscribe, getUISnapshot);
}
