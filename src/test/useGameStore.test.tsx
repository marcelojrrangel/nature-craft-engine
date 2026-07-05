import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore, useGameUI } from '../hooks/useGameStore';
import { gameStore } from '../game/store';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
window.alert = vi.fn();

describe('useGameStore', () => {
  beforeEach(() => {
    gameStore.resetSave();
    gameStore.hp = 100;
  });

  it('should return initial state snapshot', () => {
    const { result } = renderHook(() => useGameStore());
    expect(result.current).toHaveProperty('inventory');
    expect(result.current).toHaveProperty('equipment');
    expect(result.current).toHaveProperty('hp');
    expect(result.current).toHaveProperty('showInventory');
    expect(result.current.hp).toBe(100);
  });

  it('should reflect store changes after notify', () => {
    const { result, rerender } = renderHook(() => useGameStore());
    act(() => {
      gameStore.receiveDamage(20);
    });
    rerender();
    expect(result.current.hp).toBe(80);
  });

  it('should toggle inventory visibility', () => {
    const { result, rerender } = renderHook(() => useGameUI());
    expect(result.current.showInventory).toBe(false);
    act(() => {
      gameStore.toggleInventory();
    });
    rerender();
    expect(result.current.showInventory).toBe(true);
  });
});
