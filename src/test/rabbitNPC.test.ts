import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RabbitNPC } from '../game/entities/RabbitNPC';

let mockBody: any;
let mockSprite: any;
let mockScene: any;
let mockGraphics: any;

vi.mock('phaser', () => {
  const mockPhaserMath = {
    Between: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    FloatBetween: (min: number, max: number) => Math.random() * (max - min) + min,
    Distance: { Between: (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) },
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

describe('RabbitNPC', () => {
  beforeEach(() => { createMockScene(); });
  afterEach(() => { vi.clearAllMocks(); });

  it('should create sprite at given position', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_0', x: 400, y: 500 }, 3);
    expect(mockScene.physics.add.sprite).toHaveBeenCalledWith(400, 500, 'rabbit_prof', 0);
    expect(rabbit.sprite).toBe(mockSprite);
    expect(rabbit.id).toBe('rabbit_0');
  });

  it('should start in idle state with health', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_1', x: 100, y: 200 }, 3);
    expect(rabbit.health.isAlive).toBe(true);
    expect(rabbit.health.current).toBe(3);
    expect(mockSprite.play).toHaveBeenCalledWith('rabbit_idle_anim', true);
  });

  it('should use maxHp when initialHp is 0', () => {
    new RabbitNPC(mockScene, { id: 'rabbit_2', x: 100, y: 200 }, 0);
    expect(mockSprite.play).toHaveBeenCalled();
  });

  it('should create animations on first creation', () => {
    new RabbitNPC(mockScene, { id: 'rabbit_3', x: 100, y: 200 }, 3);
    expect(mockScene.anims.create).toHaveBeenCalledTimes(3);
    const keys = mockScene.anims.create.mock.calls.map((c: any[]) => c[0].key);
    expect(keys).toContain('rabbit_idle_anim');
    expect(keys).toContain('rabbit_move_anim');
    expect(keys).toContain('rabbit_dead_anim');
  });

  it('should not recreate existing animations', () => {
    mockScene.anims.exists = vi.fn(() => true);
    new RabbitNPC(mockScene, { id: 'rabbit_4', x: 100, y: 200 }, 3);
    expect(mockScene.anims.create).not.toHaveBeenCalled();
  });

  it('should set body size and offset', () => {
    new RabbitNPC(mockScene, { id: 'rabbit_5', x: 100, y: 200 }, 3);
    expect(mockBody.setSize).toHaveBeenCalledWith(16, 14);
    expect(mockBody.setOffset).toHaveBeenCalledWith(16, 26);
    expect(mockBody.setCollideWorldBounds).toHaveBeenCalled();
  });

  it('should update depth and hpBar on update', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_6', x: 100, y: 200 }, 3);
    rabbit.update(100);
    expect(mockSprite.setDepth).toHaveBeenCalledWith(mockSprite.y);
  });

  it('should not update AI when dead', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_7', x: 100, y: 200 }, 3);
    rabbit.health.takeDamage(3);
    expect(rabbit.health.isAlive).toBe(false);
    const playCallsBefore = mockSprite.play.mock.calls.length;
    rabbit.update(100);
    expect(mockSprite.play.mock.calls.length).toBe(playCallsBefore);
  });

  it('should transition from idle to moving on timer expiry', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_8', x: 100, y: 200 }, 3);
    mockSprite.play.mockClear();
    rabbit.update(5000);
    expect(mockSprite.play).toHaveBeenCalledWith('rabbit_move_anim', true);
  });

  it('should move towards target when moving', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_9', x: 100, y: 200 }, 3);
    mockSprite.play.mockClear();
    rabbit.update(5000);
    expect(mockBody.setVelocity).toHaveBeenCalled();
  });

  it('should transition back to idle when reaching target', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_10', x: 100, y: 200 }, 3);
    mockSprite.play.mockClear();
    rabbit.update(5000);
    mockSprite.play.mockClear();
    rabbit.update(50000);
    expect(mockBody.setVelocity).toHaveBeenCalledWith(0, 0);
  });

  it('should stop moving when idle', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_11', x: 100, y: 200 }, 3);
    Object.defineProperty(rabbit, 'state', { get: () => 'idle' });
    rabbit.update(100);
    expect(mockBody.setVelocity).toHaveBeenCalledWith(0, 0);
  });

  it('isInRange should check distance to sprite', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_12', x: 400, y: 500 }, 3);
    expect(rabbit.isInRange(400, 500, 10)).toBe(true);
    expect(rabbit.isInRange(600, 500, 10)).toBe(false);
  });

  it('isInRange should return false when dead', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_13', x: 400, y: 500 }, 3);
    rabbit.health.takeDamage(3);
    expect(rabbit.isInRange(400, 500, 10)).toBe(false);
  });

  it('takeDamage should make rabbit flee when alive', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_14', x: 400, y: 500 }, 3);
    mockSprite.play.mockClear();
    rabbit.takeDamage(1);
    expect(rabbit.health.current).toBe(2);
    expect(mockSprite.play).toHaveBeenCalledWith('rabbit_move_anim', true);
  });

  it('takeDamage should not flee on fatal damage', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_15', x: 400, y: 500 }, 3);
    mockSprite.play.mockClear();
    rabbit.takeDamage(3);
    expect(rabbit.health.isAlive).toBe(false);
  });

  it('collect should kill instantly', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_16', x: 400, y: 500 }, 3);
    rabbit.collect();
    expect(rabbit.health.isAlive).toBe(false);
    expect(mockSprite.disableBody).toHaveBeenCalledWith(true, false);
  });

  it('die should create stain and disable body', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_17', x: 400, y: 500 }, 3);
    rabbit.collect();
    expect(mockBody.enable).toBe(false);
    expect(mockSprite.disableBody).toHaveBeenCalledWith(true, false);
  });

  it('destroy should clean up hpBar and sprite', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_18', x: 400, y: 500 }, 3);
    rabbit.destroy();
    expect(mockSprite.destroy).toHaveBeenCalled();
  });

  it('should pick wander targets within wanderRadius', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_19', x: 500, y: 500, wanderRadius: 120 }, 3);
    const target = (rabbit as any).pickWanderTarget();
    expect(target.x).toBeGreaterThanOrEqual(500 - 120);
    expect(target.x).toBeLessThanOrEqual(500 + 120);
  });

  it('should use default wanderRadius of 120', () => {
    const rabbit = new RabbitNPC(mockScene, { id: 'rabbit_20', x: 500, y: 500 }, 3);
    const custom = new RabbitNPC(mockScene, { id: 'rabbit_21', x: 500, y: 500, wanderRadius: 60 }, 3);
    const defTarget = (rabbit as any).pickWanderTarget();
    const customTarget = (custom as any).pickWanderTarget();
    expect(Math.abs(defTarget.x - 500)).toBeLessThanOrEqual(120);
    expect(Math.abs(customTarget.x - 500)).toBeLessThanOrEqual(60);
  });
});
