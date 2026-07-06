import Phaser from 'phaser'
import { playRandomSound } from './sound'

type WeatherState = 'clear' | 'cloudy' | 'rainy' | 'stormy'

const STATE_WEIGHTS: Record<WeatherState, number> = { clear: 40, cloudy: 30, rainy: 20, stormy: 10 }

export class WeatherManager {
  private scene: Phaser.Scene
  private rainEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null
  private state: WeatherState = 'clear'
  private targetState: WeatherState = 'clear'
  private transitionTimer = 0
  private nextTransitionAt: number
  private lastLightningTime = 0
  onLightningStrike: ((x: number, y: number) => void) | null = null
  private ambientDim = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.nextTransitionAt = Phaser.Math.Between(30000, 60000)
  }

  init() {
    this.rainEmitter = this.scene.add.particles(0, 0, 'p_rain', {
      x: { min: -100, max: 1900 },
      y: -20,
      speed: { min: 400, max: 700 },
      angle: { min: 80, max: 100 },
      gravityY: 300,
      scale: { start: { min: 0.8, max: 1.2 }, end: 0.4 },
      alpha: { start: 0.7, end: 0.1 },
      lifespan: { min: 1200, max: 1800 },
      frequency: -1,
      quantity: 2,
      emitting: false,
    })
    this.rainEmitter.setDepth(5000)
  }

  private rollWeather(): WeatherState {
    const weights: Record<WeatherState, number> = { ...STATE_WEIGHTS }
    if (this.state === 'stormy') {
      weights.stormy = 0
      weights.rainy = 60
      weights.clear = 15
      weights.cloudy = 25
    } else if (this.state === 'rainy') {
      weights.stormy = 15
      weights.clear = 20
      weights.cloudy = 25
    } else {
      weights.stormy = 5
    }
    const total = Object.values(weights).reduce((a, b) => a + b, 0)
    let roll = Math.random() * total
    for (const [s, w] of Object.entries(weights)) {
      roll -= w
      if (roll <= 0) return s as WeatherState
    }
    return 'clear'
  }

  update(delta: number) {
    this.transitionTimer += delta

    if (this.transitionTimer >= this.nextTransitionAt) {
      this.transitionTimer = 0
      this.nextTransitionAt = Phaser.Math.Between(30000, 60000)
      const newState = this.rollWeather()
      this.targetState = newState
      this.scene.tweens.addCounter({
        from: 0, to: 1, duration: 3000,
        onUpdate: (tween) => {
          const p = tween.getValue()
          if (p >= 0.5 && this.state !== this.targetState) {
            this.state = this.targetState
            this.updateEmitter()
          }
        },
      })
    }

    this.ambientDim = 0
    if (this.state === 'cloudy') this.ambientDim = 0.2
    else if (this.state === 'rainy') this.ambientDim = 0.35
    else if (this.state === 'stormy') this.ambientDim = 0.5

    if (this.state === 'stormy') {
      const now = Date.now()
      if (now - this.lastLightningTime > Phaser.Math.Between(5000, 15000)) {
        this.lastLightningTime = now
        this.triggerLightning()
      }
    }
  }

  private updateEmitter() {
    if (!this.rainEmitter) return
    if (this.state === 'rainy' || this.state === 'stormy') {
      const freq = this.state === 'stormy' ? 25 : 70
      this.rainEmitter.setFrequency(freq)
      this.rainEmitter.start()
    } else {
      this.rainEmitter.stop()
    }
  }

  private triggerLightning() {
    const cam = this.scene.cameras.main
    const camX = cam.scrollX, camY = cam.scrollY
    const camW = cam.width * cam.zoom, camH = cam.height * cam.zoom
    const strikeX = camX + Math.random() * camW
    const strikeY = camY + Math.random() * camH

    cam.flash(150, 255, 255, 255, true)
    cam.shake(400, 0.015)
    playRandomSound(['sfx_thunder_01', 'sfx_thunder_02', 'sfx_thunder_03'], { volume: 0.7, detune: Phaser.Math.Between(-100, 100) })

    const glow = this.scene.add.image(strikeX, strikeY, 'p_white')
      .setScale(3).setAlpha(1).setDepth(6000).setTint(0xffffcc)
    this.scene.tweens.add({
      targets: glow, alpha: 0, scale: 8, duration: 250,
      onComplete: () => glow.destroy(),
    })

    this.scene.time.delayedCall(200, () => {
      if (this.onLightningStrike) this.onLightningStrike(strikeX, strikeY)
    })

    if (Math.random() < 0.3) {
      this.scene.time.delayedCall(Phaser.Math.Between(300, 800), () => {
        this.scene.cameras.main.flash(80, 255, 255, 255, true)
      })
    }
  }

  getState(): WeatherState { return this.state }
  getAmbientDim(): number { return this.ambientDim }

  destroy() {
    if (this.rainEmitter) this.rainEmitter.destroy()
  }
}
