import { describe, it, expect, vi } from 'vitest';
import { HealthComponent } from '../game/components/HealthComponent';

describe('HealthComponent', () => {
  it('should initialize with correct values', () => {
    const health = new HealthComponent(10, 20);
    expect(health.current).toBe(10);
    expect(health.max).toBe(20);
    expect(health.isAlive).toBe(true);
  });

  it('should take damage correctly', () => {
    const health = new HealthComponent(10, 10);
    health.takeDamage(4);
    expect(health.current).toBe(6);
  });

  it('should not have negative health', () => {
    const health = new HealthComponent(5, 10);
    health.takeDamage(10);
    expect(health.current).toBe(0);
    expect(health.isAlive).toBe(false);
  });

  it('should heal up to max health', () => {
    const health = new HealthComponent(5, 10);
    health.heal(3);
    expect(health.current).toBe(8);
    health.heal(10);
    expect(health.current).toBe(10);
  });

  it('should trigger death callback when health reaches zero', () => {
    const health = new HealthComponent(10, 10);
    const deathSpy = vi.fn();
    health.onDeath(deathSpy);
    
    health.takeDamage(5);
    expect(deathSpy).not.toHaveBeenCalled();
    
    health.takeDamage(5);
    expect(deathSpy).toHaveBeenCalledTimes(1);
  });
});
