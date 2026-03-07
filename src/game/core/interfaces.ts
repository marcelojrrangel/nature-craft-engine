export interface IEntity {
  id: string;
  x: number;
  y: number;
  active: boolean;
  update(delta: number): void;
  destroy(): void;
}

export interface IHealth {
  current: number;
  max: number;
  isAlive: boolean;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  onDeath(callback: () => void): void;
}
