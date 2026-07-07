import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { gameStore } from '../game/store';
import { ITEMS } from '../game/types';
import GameHUD from '../components/game/GameHUD';
import React from 'react';

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

vi.mock('../hooks/use-mobile', () => ({ useIsMobile: () => false }));

describe('GameHUD', () => {
  beforeEach(() => {
    gameStore.resetSave();
    gameStore.hp = 100;
  });

  it('should render HP bar with current value', () => {
    render(<GameHUD />);
    expect(screen.getByText('100/100')).toBeTruthy();
  });

  it('should update HP display when damaged', () => {
    gameStore.hp = 70;
    render(<GameHUD />);
    const hpTexts = screen.getAllByText(/70/);
    expect(hpTexts.length).toBeGreaterThan(0);
  });

  it('should render quickbar slot number 5', () => {
    render(<GameHUD />);
    const slot5 = screen.getByText('5');
    expect(slot5).toBeTruthy();
  });

  it('should show key bindings hint on desktop', () => {
    render(<GameHUD />);
    expect(screen.getByText(/INV/)).toBeTruthy();
    expect(screen.getByText(/EQUIP/)).toBeTruthy();
  });

  it('should show selected tool info', () => {
    gameStore.addItem(ITEMS.axe, 1);
    gameStore.assignToQuickBar(0, 0);
    render(<GameHUD />);
    expect(screen.getByText(/DMG/)).toBeTruthy();
  });

  it('should show quest notification toast', () => {
    (gameStore as any).questNotification = { message: '📋 Primeira Caça: 1/3 Galinhas', type: 'progress' };
    render(<GameHUD />);
    expect(screen.getByText(/Primeira Caça/)).toBeTruthy();
  });

  it('should show active quest tracker', () => {
    gameStore.initQuests();
    gameStore.acceptQuest('first_hunt');
    render(<GameHUD />);
    const tracker = screen.getAllByText(/Primeira Caça/);
    expect(tracker.length).toBeGreaterThan(0);
  });

  it('should show quest completion notification', () => {
    (gameStore as any).questNotification = { message: '🏆 Primeira Caça concluída!', type: 'complete' };
    render(<GameHUD />);
    expect(screen.getByText(/concluída/)).toBeTruthy();
  });

  it('should render without errors', () => {
    render(<GameHUD />);
    expect(screen.getByText('HP')).toBeTruthy();
  });
});
