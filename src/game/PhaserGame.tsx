import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#1a2a1a',
      input: {
        keyboard: true,
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: [BootScene, MainScene],
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Ensure canvas gets focus for keyboard input
    const focusCanvas = () => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        canvas.setAttribute('tabindex', '0');
        canvas.style.outline = 'none';
        canvas.focus();
      }
    };

    // Try immediately and after a short delay (scene loading)
    setTimeout(focusCanvas, 100);
    setTimeout(focusCanvas, 500);

    // Re-focus canvas when clicking anywhere on the game area
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't steal focus from UI buttons
      if (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.game-modal')) return;
      focusCanvas();
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
