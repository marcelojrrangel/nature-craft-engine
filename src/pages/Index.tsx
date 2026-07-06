import { lazy, Suspense } from 'react';
import GameHUD from '../components/game/GameHUD';
import InventoryModal from '../components/game/InventoryModal';
import EquipmentModal from '../components/game/EquipmentModal';
import CraftingModal from '../components/game/CraftingModal';
import SkillsModal from '../components/game/SkillsModal';
import CheatPanel from '../components/game/CheatPanel';
import Joystick from '../components/game/Joystick';
import MobileControls from '../components/game/MobileControls';
import Minimap from '../components/game/Minimap';
import { ErrorBoundary } from '../components/ui/error-boundary';
import { useIsMobile } from '../hooks/use-mobile';
import { gameStore } from '../game/store';
import { useGameUI } from '../hooks/useGameStore';

const PhaserGame = lazy(() => import('../game/PhaserGame'));

const Index = () => {
  const ui = useGameUI();
  const isMobile = useIsMobile();

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
      <ErrorBoundary label="Minimap">
        <Minimap />
      </ErrorBoundary>
      {isMobile && (
        <>
          <div className="fixed bottom-4 left-4 z-50">
            <Joystick />
          </div>
          <MobileControls />
        </>
      )}
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
            station={gameStore.currentStation} 
          />
        </ErrorBoundary>
      )}
      {ui.showSkills && (
        <ErrorBoundary label="SkillsModal">
          <SkillsModal onClose={() => gameStore.toggleSkills()} />
        </ErrorBoundary>
      )}
      {import.meta.env.DEV && ui.showCheatPanel && (
        <CheatPanel onClose={() => gameStore.toggleCheatPanel()} />
      )}
    </div>
  );
};

export default Index;
