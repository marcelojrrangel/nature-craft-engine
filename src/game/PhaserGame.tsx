import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Evita múltiplas inicializações no React Strict Mode
    if (gameRef.current) return;
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO, // Deixa o Phaser escolher o melhor disponível
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#050505',
      pixelArt: true,
      antialias: false,
      autoFocus: true,
      input: {
        keyboard: true,
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: [BootScene, MainScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        powerPreference: 'high-performance',
        batchSize: 4096
      }
    };

    try {
      gameRef.current = new Phaser.Game(config);
    } catch (e) {
      console.error('Falha ao iniciar Phaser:', e);
    }

    const focusCanvas = () => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        canvas.setAttribute('tabindex', '0');
        canvas.style.outline = 'none';
        canvas.focus();
      }
    };

    setTimeout(focusCanvas, 100);
    setTimeout(focusCanvas, 500);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.game-modal')) return;
      focusCanvas();
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden" />;
}
