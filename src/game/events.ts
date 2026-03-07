type GameEventMap = {
  joystickMove: { x: number; y: number };
  attack: undefined;
  interact: undefined;
  placeItem: { type: string; inventoryIndex: number };
};

type GameEventName = keyof GameEventMap;
type Listener<K extends GameEventName> = (payload: GameEventMap[K]) => void;

class TypedEventBus {
  private listeners: { [K in GameEventName]: Set<Listener<K>> } = {
    joystickMove: new Set(),
    attack: new Set(),
    interact: new Set(),
    placeItem: new Set(),
  };

  on<K extends GameEventName>(event: K, listener: Listener<K>) {
    if (!this.listeners[event]) return () => {};
    this.listeners[event].add(listener as Listener<any>);
    return () => this.off(event, listener);
  }

  off<K extends GameEventName>(event: K, listener: Listener<K>) {
    if (!this.listeners[event]) return;
    this.listeners[event].delete(listener as Listener<any>);
  }

  emit<K extends GameEventName>(event: K, payload: GameEventMap[K]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => {
      listener(payload);
    });
  }
}

export const gameEvents = new TypedEventBus();
