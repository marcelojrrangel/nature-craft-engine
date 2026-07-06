export class TimeCycleManager {
  timeOfDay = 0.25
  dayLength: number
  paused = false
  private elapsed = 0

  constructor(dayLength = 180000) {
    this.dayLength = dayLength
  }

  update(delta: number) {
    if (this.paused) return
    this.elapsed += delta
    this.timeOfDay = (this.elapsed % this.dayLength) / this.dayLength
  }

  setTime(value: number) {
    this.timeOfDay = Math.max(0, Math.min(1, value))
    this.elapsed = this.timeOfDay * this.dayLength
  }

  togglePause() { this.paused = !this.paused }

  get isNight(): boolean {
    return this.timeOfDay < 0.2 || this.timeOfDay > 0.8
  }

  get isDawnOrDusk(): boolean {
    return (this.timeOfDay >= 0.2 && this.timeOfDay < 0.35) || (this.timeOfDay >= 0.65 && this.timeOfDay <= 0.8)
  }

  private lerpColor(a: number, b: number, t: number): number {
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff
    const r = Math.round(ar + (br - ar) * t)
    const g = Math.round(ag + (bg - ag) * t)
    const b_ = Math.round(ab + (bb - ab) * t)
    return (r << 16) | (g << 8) | b_
  }

  getAmbientColor(): number {
    const t = this.timeOfDay
    if (t < 0.25) return this.lerpColor(0x0a0a1a, 0xcc8844, t / 0.25)
    if (t < 0.5) return this.lerpColor(0xcc8844, 0xffeedd, (t - 0.25) / 0.25)
    if (t < 0.75) return this.lerpColor(0xffeedd, 0x885533, (t - 0.5) / 0.25)
    return this.lerpColor(0x885533, 0x0a0a1a, (t - 0.75) / 0.25)
  }

  getPlayerLightConfig(): { radius: number; intensity: number; color: number } {
    const t = this.timeOfDay
    if (t < 0.25) {
      const p = t / 0.25
      return {
        radius: 180 + (100 - 180) * p,
        intensity: 2.0 + (1.0 - 2.0) * p,
        color: this.lerpColor(0xff8844, 0xffffff, p),
      }
    }
    if (t < 0.5) {
      return { radius: 100, intensity: 1.0, color: 0xffffff }
    }
    if (t < 0.75) {
      const p = (t - 0.5) / 0.25
      return {
        radius: 100 + (180 - 100) * p,
        intensity: 1.0 + (2.0 - 1.0) * p,
        color: this.lerpColor(0xffffff, 0xff8844, p),
      }
    }
    return { radius: 180, intensity: 2.0, color: 0xff8844 }
  }

  getWeatherWeight(): { clear: number; cloudy: number; rainy: number; stormy: number } {
    const dark = this.isNight || this.isDawnOrDusk ? 1.4 : 1.0
    return { clear: 30 * dark, cloudy: 25 * dark, rainy: 15 * dark, stormy: 5 * dark }
  }
}
