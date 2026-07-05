import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthComponent } from '../game/components/HealthComponent';
import { HealthBarRenderer } from '../game/components/HealthBarRenderer';

vi.mock('phaser', () => {
  const mockGraphics = {
    setDepth: vi.fn(),
    clear: vi.fn(),
    fillStyle: vi.fn(),
    fillRect: vi.fn(),
    destroy: vi.fn(),
  };

  return {
    default: {
      Scene: vi.fn(),
      Math: {
        Clamp: (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)),
      },
    },
  };
});

function createMockScene() {
  const mockGraphics = {
    setDepth: vi.fn(),
    clear: vi.fn(),
    fillStyle: vi.fn(),
    fillRect: vi.fn(),
    destroy: vi.fn(),
  };
  const mockAdd = { graphics: vi.fn(() => mockGraphics) };
  const scene = { add: mockAdd, graphicsRef: mockGraphics };
  return scene as any;
}

describe('HealthBarRenderer', () => {
  let health: HealthComponent;
  let renderer: HealthBarRenderer;
  const target = { x: 100, y: 200 };

  beforeEach(() => {
    health = new HealthComponent(100, 100);
    const scene = createMockScene();
    renderer = new HealthBarRenderer(scene, health, target, 20, false);
  });

  it('should construct and create graphics', () => {
    expect(renderer).toBeInstanceOf(HealthBarRenderer);
  });

  it('should not draw when health is full and not always visible', () => {
    const graphics = (renderer as any).graphics;
    renderer.update();
    expect(graphics.clear).toHaveBeenCalled();
    expect(graphics.fillStyle).not.toHaveBeenCalled();
  });

  it('should draw when health is not full', () => {
    health.takeDamage(30);
    const graphics = (renderer as any).graphics;
    renderer.update();
    expect(graphics.clear).toHaveBeenCalled();
    expect(graphics.fillStyle).toHaveBeenCalled();
    expect(graphics.fillRect).toHaveBeenCalled();
  });

  it('should not draw when dead', () => {
    health.takeDamage(100);
    const graphics = (renderer as any).graphics;
    renderer.update();
    expect(graphics.clear).toHaveBeenCalled();
    expect(graphics.fillStyle).not.toHaveBeenCalled();
  });

  it('should draw when always visible even if full', () => {
    const scene = createMockScene();
    const alwaysVisibleRenderer = new HealthBarRenderer(scene, health, target, 20, true);
    const graphics = scene.graphicsRef;
    alwaysVisibleRenderer.update();
    expect(graphics.fillStyle).toHaveBeenCalled();
  });

  it('should clean up on destroy', () => {
    const graphics = (renderer as any).graphics;
    renderer.destroy();
    expect(graphics.clear).toHaveBeenCalled();
    expect(graphics.destroy).toHaveBeenCalled();
  });

  it('should use green color when health > 60%', () => {
    health.takeDamage(10);
    const graphics = (renderer as any).graphics;
    renderer.update();
    const callArgs = graphics.fillStyle.mock.calls;
    const healthFillCall = [...callArgs].reverse().find((c: number[]) => c[0] !== 0x000000);
    expect(healthFillCall).toBeDefined();
    if (healthFillCall) expect(healthFillCall[0]).toBe(0x2ecc71);
  });

  it('should use yellow color when health between 30% and 60%', () => {
    health.takeDamage(50);
    const graphics = (renderer as any).graphics;
    renderer.update();
    const callArgs = graphics.fillStyle.mock.calls;
    const healthFillCall = [...callArgs].reverse().find((c: number[]) => c[0] !== 0x000000);
    expect(healthFillCall).toBeDefined();
    if (healthFillCall) expect(healthFillCall[0]).toBe(0xf1c40f);
  });

  it('should use red color when health < 30%', () => {
    health.takeDamage(80);
    const graphics = (renderer as any).graphics;
    renderer.update();
    const callArgs = graphics.fillStyle.mock.calls;
    const healthFillCall = [...callArgs].reverse().find((c: number[]) => c[0] !== 0x000000);
    expect(healthFillCall).toBeDefined();
    if (healthFillCall) expect(healthFillCall[0]).toBe(0xe74c3c);
  });
});
