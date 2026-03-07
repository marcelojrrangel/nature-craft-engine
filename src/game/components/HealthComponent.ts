import { IHealth } from '../core/interfaces';

export class HealthComponent implements IHealth {
  public current: number;
  public max: number;
  private deathCallbacks: (() => void)[] = [];

  constructor(initial: number, max: number) {
    this.current = initial;
    this.max = max;
  }

  get isAlive(): boolean {
    return this.current > 0;
  }

  takeDamage(amount: number): void {
    this.current = Math.max(0, this.current - amount);
    if (this.current <= 0) {
      this.triggerDeath();
    }
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + amount);
  }

  onDeath(callback: () => void): void {
    this.deathCallbacks.push(callback);
  }

  private triggerDeath() {
    this.deathCallbacks.forEach(cb => cb());
  }
}
