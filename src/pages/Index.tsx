import { lazy, Suspense } from 'react';
import GameHUD from '../components/game/GameHUD';
import InventoryModal from '../components/game/InventoryModal';
import EquipmentModal from '../components/game/EquipmentModal';
import CraftingModal from '../components/game/CraftingModal';
import SkillsModal from '../components/game/SkillsModal';
import { ErrorBoundary } from '../components/ui/error-boundary';
import { gameStore } from '../game/store';
import { useGameUI } from '../hooks/useGameStore';

const PhaserGame = lazy(() => import('../game/PhaserGame'));

const Index = () => {
  const ui = useGameUI();

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: 'hsl(var(--background))' }}>
      <ErrorBoundary label="PhaserGame">
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <PhaserGame />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary label="GameHUD">
        <GameHUD />
      </ErrorBoundary>
      {ui.showInventory && (
        <ErrorBoundary label="InventoryModal">
          <InventoryModal onClose={() => gameStore.toggleInventory()} />
        </ErrorBoundary>
      )}
      {ui.showEquipment && (
        <ErrorBoundary label="EquipmentModal">
          <EquipmentModal onClose={() => gameStore.toggleEquipment()} />
        </ErrorBoundary>
      )}
      {ui.showCrafting && (
        <ErrorBoundary label="CraftingModal">
          <CraftingModal 
            onClose={() => gameStore.toggleCrafting()} 
            station={(gameStore as any).currentStation || 'workbench'} 
          />
        </ErrorBoundary>
      )}
      {ui.showSkills && (
        <ErrorBoundary label="SkillsModal">
          <SkillsModal onClose={() => gameStore.toggleSkills()} />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default Index;
