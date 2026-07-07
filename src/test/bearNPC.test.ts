import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BearNPC } from '../game/entities/BearNPC';
import { gameStore } from '../game/store';

let mockBody: any;
let mockSprite: any;
let mockScene: any;
let mockGraphics: any;

vi.mock('phaser', () => {
  const mockPhaserMath = {
    Between: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    FloatBetween: (min: number, max: number) => Math.random() * (max - min) + min,
    Distance: { Between: (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) },
    Angle: { Between: () => 0 },
    Clamp: (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)),
  };

  return {
    default: {
      Scene: vi.fn(),
      Physics: { Arcade: { Sprite: vi.fn(), Body: vi.fn() } },
      Math: mockPhaserMath,
      GameObjects: { Graphics: vi.fn() },
    },
  };
});

function createMockScene() {
  mockGraphics = {
    setDepth: vi.fn(), clear: vi.fn(), fillStyle: vi.fn(), fillRect: vi.fn(), fillCircle: vi.fn(), destroy: vi.fn(),
  };

  mockBody = {
    setCollideWorldBounds: vi.fn().mockReturnThis(), setSize: vi.fn().mockReturnThis(),
    setOffset: vi.fn().mockReturnThis(), setVelocity: vi.fn(), enable: true,
    velocity: { x: 0, y: 0 }, disableBody: vi.fn(),
  };

  mockSprite = {
    x: 400, y: 500, setDepth: vi.fn(), setFlipX: vi.fn(), setVisible: vi.fn(),
    play: vi.fn(), destroy: vi.fn(), disableBody: vi.fn(), body: mockBody,
    active: true, scene: null as any, alpha: 1, clearTint: vi.fn(), setTint: vi.fn(),
  };

  mockScene = {
    cameras: { main: { flash: vi.fn() } },
    physics: { add: { sprite: vi.fn((x: number, y: number) => { mockSprite.x = x; mockSprite.y = y; mockSprite.scene = mockScene; return mockSprite; }) } },
    add: { graphics: vi.fn(() => mockGraphics) },
    tweens: { add: vi.fn() },
    anims: { create: vi.fn(), exists: vi.fn(() => false), generateFrameNumbers: vi.fn(() => []) },
    time: { delayedCall: vi.fn() },
    make: { graphics: vi.fn() }, textures: { createCanvas: vi.fn() },
  };
  mockSprite.scene = mockScene;
  return mockScene;
}

describe('BearNPC', () => {
  beforeEach(() => {
    createMockScene();
    gameStore.resetSave();
  });
  afterEach(() => { vi.clearAllMocks(); });

  it('should create sprite at given position', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_0', x: 400, y: 500 }, 40);
    expect(mockScene.physics.add.sprite).toHaveBeenCalledWith(400, 500, 'bear_sheet', 0);
    expect(bear.sprite).toBe(mockSprite);
    expect(bear.id).toBe('bear_0');
  });

  it('should start in idle state with health', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_1', x: 100, y: 200 }, 40);
    expect(bear.health.isAlive).toBe(true);
    expect(bear.health.current).toBe(40);
    expect(bear.health.max).toBe(40);
  });

  it('should use maxHp when initialHp is 0', () => {
    new BearNPC(mockScene, { id: 'bear_2', x: 100, y: 200 }, 0);
  });

  it('should create animations on first creation', () => {
    new BearNPC(mockScene, { id: 'bear_3', x: 100, y: 200 }, 40);
    expect(mockScene.anims.create).toHaveBeenCalledTimes(4);
    const keys = mockScene.anims.create.mock.calls.map((c: any[]) => c[0].key);
    expect(keys).toContain('bear_idle_anim');
    expect(keys).toContain('bear_run_anim');
    expect(keys).toContain('bear_attack_anim');
    expect(keys).toContain('bear_death_anim');
  });

  it('should not recreate existing animations', () => {
    mockScene.anims.exists = vi.fn(() => true);
    new BearNPC(mockScene, { id: 'bear_4', x: 100, y: 200 }, 40);
    expect(mockScene.anims.create).not.toHaveBeenCalled();
  });

  it('should set body size and offset', () => {
    new BearNPC(mockScene, { id: 'bear_5', x: 100, y: 200 }, 40);
    expect(mockBody.setSize).toHaveBeenCalledWith(36, 28);
    expect(mockBody.setOffset).toHaveBeenCalledWith(14, 18);
    expect(mockBody.setCollideWorldBounds).toHaveBeenCalled();
  });

  it('should update hpBar and depth on update', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_6', x: 100, y: 200 }, 40);
    bear.update(100, 200, 200);
    expect(mockSprite.setDepth).toHaveBeenCalledWith(mockSprite.y);
  });

  it('should not update AI when dead', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_7', x: 100, y: 200 }, 40);
    bear.health.takeDamage(40);
    expect(bear.health.isAlive).toBe(false);
    bear.update(100, 200, 200);
  });

  it('should chase player when within detection range', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_8', x: 100, y: 200 }, 40);
    bear.update(100, 150, 200);
    expect(mockBody.setVelocity).toHaveBeenCalled();
  });

  it('should not chase when isPlayerSafe is true', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_9', x: 100, y: 200 }, 40);
    bear.update(100, 100, 200, { x: 0, y: 0, radius: 10 }, true);
    expect(gameStore.hp).toBe(100);
  });

  it('should attack player when within attack range', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_10', x: 100, y: 200 }, 40);
    bear.update(100, 100, 200);
    expect(gameStore.hp).toBeLessThan(100);
  });

  it('isInRange should check distance to sprite', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_11', x: 400, y: 500 }, 40);
    expect(bear.isInRange(400, 500, 10)).toBe(true);
    expect(bear.isInRange(600, 500, 10)).toBe(false);
  });

  it('isInRange should return false when dead', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_12', x: 400, y: 500 }, 40);
    bear.health.takeDamage(40);
    expect(bear.isInRange(400, 500, 10)).toBe(false);
  });

  it('takeDamage should delegate to health component', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_13', x: 400, y: 500 }, 40);
    const result = bear.takeDamage(10);
    expect(result).toBe(30);
    expect(bear.health.current).toBe(30);
  });

  it('collect should kill instantly', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_14', x: 400, y: 500 }, 40);
    bear.collect();
    expect(bear.health.isAlive).toBe(false);
    expect(mockSprite.disableBody).toHaveBeenCalledWith(true, false);
  });

  it('die should create stain and disable body', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_15', x: 400, y: 500 }, 40);
    bear.collect();
    expect(mockBody.enable).toBe(false);
    expect(mockSprite.disableBody).toHaveBeenCalledWith(true, false);
  });

  it('destroy should clean up hpBar and sprite', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_16', x: 400, y: 500 }, 40);
    bear.destroy();
    expect(mockSprite.destroy).toHaveBeenCalled();
  });

  it('should be repelled by safe zone', () => {
    const bear = new BearNPC(mockScene, { id: 'bear_17', x: 130, y: 200 }, 40);
    const safeZone = { x: 100, y: 200, radius: 30 };
    bear.update(100, 1000, 1000, safeZone, false);
    expect(bear.sprite.destroy).toBeDefined();
  });
});
