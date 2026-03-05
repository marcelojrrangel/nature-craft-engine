import { useState, useCallback } from 'react';
import PhaserGame from '../game/PhaserGame';
import GameHUD from '../components/game/GameHUD';
import InventoryModal from '../components/game/InventoryModal';
import EquipmentModal from '../components/game/EquipmentModal';
import CraftingModal from '../components/game/CraftingModal';
import { gameStore } from '../game/store';
import { useGameUI } from '../hooks/useGameStore';

const Index = () => {
  const ui = useGameUI();

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: 'hsl(var(--background))' }}>
      <PhaserGame />
      <GameHUD />
      {ui.showInventory && <InventoryModal onClose={() => gameStore.toggleInventory()} />}
      {ui.showEquipment && <EquipmentModal onClose={() => gameStore.toggleEquipment()} />}
      {ui.showCrafting && <CraftingModal onClose={() => gameStore.toggleCrafting()} />}
    </div>
  );
};

export default Index;
