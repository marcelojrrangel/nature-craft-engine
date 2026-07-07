import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CrabNPC } from '../game/entities/CrabNPC';

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

describe('CrabNPC', () => {
  beforeEach(() => { createMockScene(); });
  afterEach(() => { vi.clearAllMocks(); });

  it('should create sprite at given position', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_0', x: 400, y: 500 }, 10);
    expect(mockScene.physics.add.sprite).toHaveBeenCalledWith(400, 500, 'crab_prof', 0);
    expect(crab.sprite).toBe(mockSprite);
    expect(crab.id).toBe('crab_0');
    expect(crab.homeX).toBe(400);
    expect(crab.homeY).toBe(500);
  });

  it('should start in idle state with health', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_1', x: 100, y: 200 }, 10);
    expect(crab.health.isAlive).toBe(true);
    expect(crab.health.current).toBe(10);
    expect(mockSprite.play).toHaveBeenCalledWith('crab_idle', true);
  });

  it('should use maxHp when initialHp is 0', () => {
    new CrabNPC(mockScene, { id: 'crab_2', x: 100, y: 200 }, 0);
    expect(mockSprite.play).toHaveBeenCalled();
  });

  it('should create animations on first creation', () => {
    new CrabNPC(mockScene, { id: 'crab_3', x: 100, y: 200 }, 10);
    expect(mockScene.anims.create).toHaveBeenCalledTimes(3);
    const keys = mockScene.anims.create.mock.calls.map((c: any[]) => c[0].key);
    expect(keys).toContain('crab_idle');
    expect(keys).toContain('crab_scuttle');
    expect(keys).toContain('crab_dead_anim');
  });

  it('should not recreate existing animations', () => {
    mockScene.anims.exists = vi.fn(() => true);
    new CrabNPC(mockScene, { id: 'crab_4', x: 100, y: 200 }, 10);
    expect(mockScene.anims.create).not.toHaveBeenCalled();
  });

  it('should set body size and offset', () => {
    new CrabNPC(mockScene, { id: 'crab_5', x: 100, y: 200 }, 10);
    expect(mockBody.setSize).toHaveBeenCalledWith(20, 10);
    expect(mockBody.setOffset).toHaveBeenCalledWith(6, 18);
    expect(mockBody.setCollideWorldBounds).toHaveBeenCalled();
  });

  it('should update depth and hpBar on update', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_6', x: 100, y: 200 }, 10);
    crab.update(100);
    expect(mockSprite.setDepth).toHaveBeenCalledWith(mockSprite.y);
  });

  it('should not update AI when dead', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_7', x: 100, y: 200 }, 10);
    crab.health.takeDamage(10);
    expect(crab.health.isAlive).toBe(false);
    const playCallsBefore = mockSprite.play.mock.calls.length;
    crab.update(100);
    expect(mockSprite.play.mock.calls.length).toBe(playCallsBefore);
  });

  it('should toggle state on timer expiry', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_8', x: 100, y: 200 }, 10);
    mockSprite.play.mockClear();
    crab.update(5000);
    expect(mockSprite.play).toHaveBeenCalledWith('crab_scuttle', true);
  });

  it('should move towards target when scuttling', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_9', x: 100, y: 200 }, 10);
    mockSprite.play.mockClear();
    crab.update(5000);
    expect(mockBody.setVelocity).toHaveBeenCalled();
  });

  it('should stop moving when idle', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_10', x: 100, y: 200 }, 10);
    Object.defineProperty(crab, 'state', { get: () => 'idle' });
    crab.update(100);
    expect(mockBody.setVelocity).toHaveBeenCalledWith(0, 0);
  });

  it('isInRange should check distance to sprite', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_11', x: 400, y: 500 }, 10);
    expect(crab.isInRange(400, 500, 10)).toBe(true);
    expect(crab.isInRange(600, 500, 10)).toBe(false);
  });

  it('isInRange should return false when dead', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_12', x: 400, y: 500 }, 10);
    crab.health.takeDamage(10);
    expect(crab.isInRange(400, 500, 10)).toBe(false);
  });

  it('takeDamage should delegate to health component', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_13', x: 400, y: 500 }, 10);
    const result = crab.takeDamage(3);
    expect(result).toBe(7);
    expect(crab.health.current).toBe(7);
  });

  it('collect should kill instantly', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_14', x: 400, y: 500 }, 10);
    crab.collect();
    expect(crab.health.isAlive).toBe(false);
    expect(mockSprite.disableBody).toHaveBeenCalledWith(true, false);
  });

  it('die should create stain and disable body', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_15', x: 400, y: 500 }, 10);
    crab.collect();
    expect(mockBody.enable).toBe(false);
    expect(mockSprite.disableBody).toHaveBeenCalledWith(true, false);
    expect(mockScene.add.graphics).toHaveBeenCalled();
  });

  it('destroy should clean up hpBar and sprite', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_16', x: 400, y: 500 }, 10);
    crab.destroy();
    expect(mockSprite.destroy).toHaveBeenCalled();
  });

  it('should pick wander targets within wanderRadius', () => {
    const crab = new CrabNPC(mockScene, { id: 'crab_17', x: 500, y: 500, wanderRadius: 70 }, 10);
    const target = (crab as any).pickTarget();
    expect(target.x).toBeGreaterThanOrEqual(500 - 70);
    expect(target.x).toBeLessThanOrEqual(500 + 70);
    expect(target.y).toBeGreaterThanOrEqual(500 - 70);
    expect(target.y).toBeLessThanOrEqual(500 + 70);
  });

  it('should use default wanderRadius when not specified', () => {
    const crab1 = new CrabNPC(mockScene, { id: 'crab_18', x: 500, y: 500 }, 10);
    const crab2 = new CrabNPC(mockScene, { id: 'crab_19', x: 500, y: 500, wanderRadius: 50 }, 10);
    const defTarget = (crab1 as any).pickTarget();
    const customTarget = (crab2 as any).pickTarget();
    expect(Math.abs(defTarget.x - 500)).toBeLessThanOrEqual(70);
    expect(Math.abs(customTarget.x - 500)).toBeLessThanOrEqual(50);
  });
});
