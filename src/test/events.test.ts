import { describe, it, expect, vi } from 'vitest';
import { gameEvents } from '../game/events';

describe('TypedEventBus', () => {
  it('should register and emit events', () => {
    const spy = vi.fn();
    gameEvents.on('attack', spy);
    gameEvents.emit('attack', undefined);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should pass payload to listeners', () => {
    const spy = vi.fn();
    gameEvents.on('joystickMove', spy);
    gameEvents.emit('joystickMove', { x: 50, y: -30 });
    expect(spy).toHaveBeenCalledWith({ x: 50, y: -30 });
  });

  it('should allow multiple listeners on same event', () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    gameEvents.on('interact', spy1);
    gameEvents.on('interact', spy2);
    gameEvents.emit('interact', undefined);
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  it('should unregister listener via off()', () => {
    const spy = vi.fn();
    gameEvents.on('placeItem', spy);
    gameEvents.off('placeItem', spy);
    gameEvents.emit('placeItem', { type: 'campfire', inventoryIndex: 0 });
    expect(spy).not.toHaveBeenCalled();
  });

  it('should unregister listener via returned unsubscribe function', () => {
    const spy = vi.fn();
    const unsubscribe = gameEvents.on('attack', spy);
    unsubscribe();
    gameEvents.emit('attack', undefined);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should handle placeItem payload correctly', () => {
    const spy = vi.fn();
    gameEvents.on('placeItem', spy);
    gameEvents.emit('placeItem', { type: 'campfire', inventoryIndex: 2 });
    expect(spy).toHaveBeenCalledWith({ type: 'campfire', inventoryIndex: 2 });
  });

  it('should not throw when emitting unregistered event', () => {
    expect(() => {
      gameEvents.emit('attack', undefined);
    }).not.toThrow();
  });
});
