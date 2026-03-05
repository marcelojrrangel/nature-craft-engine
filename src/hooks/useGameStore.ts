import { useSyncExternalStore } from 'react';
import { gameStore } from '../game/store';

export function useGameStore() {
  const snap = useSyncExternalStore(
    (cb) => gameStore.subscribe(cb),
    () => ({
      inventory: gameStore.inventory,
      equipment: gameStore.equipment,
      hp: gameStore.hp,
      maxHp: gameStore.maxHp,
      showInventory: gameStore.showInventory,
      showCrafting: gameStore.showCrafting,
      showEquipment: gameStore.showEquipment,
    })
  );
  // Force re-render by returning a new object reference each time
  return { ...snap };
}

// Separate hook that only subscribes to UI state for modals
export function useGameUI() {
  return useSyncExternalStore(
    (cb) => gameStore.subscribe(cb),
    () => ({
      showInventory: gameStore.showInventory,
      showCrafting: gameStore.showCrafting,
      showEquipment: gameStore.showEquipment,
    })
  );
}
