import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { gameStore } from '../game/store';
import QuestsModal from '../components/game/QuestsModal';
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

function clickAvailableTab() {
  fireEvent.click(screen.getByText(/Disponíveis \(\d+\)/));
}

describe('QuestsModal', () => {
  beforeEach(() => {
    gameStore.resetSave();
    gameStore.quests = {};
  });

  it('should render modal title', () => {
    gameStore.initQuests();
    render(<QuestsModal onClose={() => {}} />);
    expect(screen.getByText('📜 Missões')).toBeTruthy();
  });

  it('should show available quests in Disponiveis tab', () => {
    gameStore.initQuests();
    render(<QuestsModal onClose={() => {}} />);
    clickAvailableTab();
    expect(screen.getByText(/Primeira Caça/)).toBeTruthy();
  });

  it('should show Aceitar button for available quests', () => {
    gameStore.initQuests();
    render(<QuestsModal onClose={() => {}} />);
    clickAvailableTab();
    const buttons = screen.getAllByText('Aceitar');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should accept quest when clicking Aceitar', () => {
    gameStore.initQuests();
    render(<QuestsModal onClose={() => {}} />);
    clickAvailableTab();
    const acceptButton = screen.getAllByText('Aceitar')[0];
    fireEvent.click(acceptButton);
    const activeQuests = Object.values(gameStore.quests).filter(q => q.status === 'active');
    expect(activeQuests.length).toBe(1);
  });

  it('should show active quests tab', () => {
    gameStore.initQuests();
    gameStore.acceptQuest('first_hunt');
    render(<QuestsModal onClose={() => {}} />);
    const activeTab = screen.getByText(/Em Andamento/);
    fireEvent.click(activeTab);
    expect(screen.getByText(/Primeira Caça/)).toBeTruthy();
  });

  it('should show empty state when no active quests', () => {
    gameStore.initQuests();
    render(<QuestsModal onClose={() => {}} />);
    expect(screen.getByText(/Nenhuma missão ativa/)).toBeTruthy();
  });

  it('should show empty state when no available quests', () => {
    gameStore.quests = {};
    render(<QuestsModal onClose={() => {}} />);
    const availableTab = screen.getByText(/Disponíveis \(\d+\)/);
    fireEvent.click(availableTab);
    expect(screen.getByText(/Nenhuma missão disponível/)).toBeTruthy();
  });

  it('should show completed quests tab', () => {
    gameStore.initQuests();
    gameStore.acceptQuest('first_hunt');
    gameStore.updateQuestObjective('kill', 'chicken', 3);
    render(<QuestsModal onClose={() => {}} />);
    const completedTab = screen.getByText(/Concluídas \(\d+\)/);
    fireEvent.click(completedTab);
    expect(screen.getByText(/Primeira Caça/)).toBeTruthy();
  });

  it('should show reward info for available quests', () => {
    gameStore.initQuests();
    render(<QuestsModal onClose={() => {}} />);
    clickAvailableTab();
    const elements = screen.queryAllByText(/XP/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should call onClose when clicking close button', () => {
    const onClose = vi.fn();
    gameStore.initQuests();
    render(<QuestsModal onClose={onClose} />);
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should show quest objectives with progress', () => {
    gameStore.initQuests();
    gameStore.acceptQuest('first_hunt');
    gameStore.updateQuestObjective('kill', 'chicken', 2);
    render(<QuestsModal onClose={() => {}} />);
    expect(screen.getByText(/2\/3/)).toBeTruthy();
  });
});
