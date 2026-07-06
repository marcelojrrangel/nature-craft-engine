import Phaser from 'phaser'
import { gameStore } from './store'
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
    const view = this.scene.cameras.main.worldView
    const GRASS_MIN = 80
    const GRASS_MAX = 1520
    const strikeX = Phaser.Math.Clamp(
      view.x + Math.random() * view.width, GRASS_MIN, GRASS_MAX,
    )
    const strikeY = Phaser.Math.Clamp(
      view.y + Math.random() * view.height, GRASS_MIN, GRASS_MAX,
    )

    this.showLightningWarning(strikeX, strikeY)
  }

  private showLightningWarning(x: number, y: number) {
    gameStore.lightningWarning = { x, y }
    gameStore.notify('world')

    const indicator = this.scene.add.circle(x, y, 36, 0x000000, 0.35).setDepth(4999)
    const ring = this.scene.add.circle(x, y, 40, 0x000000, 0)
      .setStrokeStyle(1.5, 0xff4444, 0.4).setDepth(4999)

    this.scene.tweens.add({
      targets: [indicator, ring],
      alpha: { from: 1, to: 0.5 },
      scale: { from: 1, to: 1.12 },
      duration: 400,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.scene.tweens.add({
          targets: [indicator, ring],
          alpha: 0, scale: 1.3, duration: 300,
          onComplete: () => {
            indicator.destroy()
            ring.destroy()
            this.executeLightningStrike(x, y)
          },
        })
      },
    })
  }

  private executeLightningStrike(x: number, y: number) {
    gameStore.lightningWarning = null
    gameStore.notify('world')

    this.drawLightningBolt(x, y)

    const cam = this.scene.cameras.main
    cam.flash(150, 255, 255, 255, true)
    cam.shake(400, 0.015)
    playRandomSound(['sfx_thunder_01', 'sfx_thunder_02', 'sfx_thunder_03'], { volume: 0.7, detune: Phaser.Math.Between(-100, 100) })

    const glow = this.scene.add.image(x, y, 'p_white')
      .setScale(3).setAlpha(1).setDepth(6000).setTint(0xffffcc)
    this.scene.tweens.add({
      targets: glow, alpha: 0, scale: 8, duration: 250,
      onComplete: () => glow.destroy(),
    })

    this.scene.time.delayedCall(200, () => {
      if (this.onLightningStrike) this.onLightningStrike(x, y)
    })

    if (Math.random() < 0.3) {
      this.scene.time.delayedCall(Phaser.Math.Between(300, 800), () => {
        this.scene.cameras.main.flash(80, 255, 255, 255, true)
      })
    }
  }

  private drawLightningBolt(x: number, y: number) {
    const cam = this.scene.cameras.main
    const startY = cam.scrollY - 60
    const segments = Phaser.Math.Between(9, 14)
    const segLength = (y - startY) / segments
    const maxOffset = 50

    const gfx = this.scene.add.graphics().setDepth(6001)

    const drawZigzag = (
      g: Phaser.GameObjects.Graphics,
      sx: number, sy: number,
      ex: number, ey: number,
      segs: number, offset: number,
      width: number, color: number, alpha: number,
    ) => {
      g.lineStyle(width, color, alpha)
      g.beginPath()
      g.moveTo(sx, sy)
      const segLen = (ey - sy) / segs
      let cx = sx, cy = sy
      for (let i = 0; i < segs; i++) {
        cy += segLen
        cx = sx + Phaser.Math.Between(-offset, offset)
        g.lineTo(cx, cy)
      }
      g.strokePath()
    }

    // Main bolt
    drawZigzag(gfx, x, startY, x, y, segments, maxOffset, 3, 0xffffff, 1)

    // Branch 1
    if (Math.random() < 0.6) {
      const splitAt = Phaser.Math.Between(3, segments - 2)
      const by = startY + splitAt * segLength
      const bx = x + Phaser.Math.Between(-maxOffset, maxOffset)
      const branchSegs = Phaser.Math.Between(2, 4)
      const branchEndX = bx + Phaser.Math.Between(-40, 40)
      const branchEndY = by + branchSegs * segLength * 0.6
      drawZigzag(gfx, bx, by, branchEndX, branchEndY, branchSegs, 25, 1.5, 0xaaaaff, 0.5)
    }

    // Branch 2 (shorter)
    if (Math.random() < 0.35) {
      const splitAt = Phaser.Math.Between(4, segments - 3)
      const by = startY + splitAt * segLength
      const bx = x + Phaser.Math.Between(-maxOffset, maxOffset)
      const branchSegs = Phaser.Math.Between(1, 3)
      const branchEndX = bx + Phaser.Math.Between(-30, 30)
      const branchEndY = by + branchSegs * segLength * 0.5
      drawZigzag(gfx, bx, by, branchEndX, branchEndY, branchSegs, 18, 1, 0xaaaaff, 0.35)
    }

    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 200,
      onComplete: () => gfx.destroy(),
    })
  }

  getState(): WeatherState { return this.state }
  getAmbientDim(): number { return this.ambientDim }

  forceState(newState: WeatherState) {
    this.state = newState
    this.targetState = newState
    this.transitionTimer = 0
    this.nextTransitionAt = Phaser.Math.Between(30000, 60000)
    this.updateEmitter()
  }

  forceLightning() {
    this.triggerLightning()
  }

  destroy() {
    if (this.rainEmitter) this.rainEmitter.destroy()
  }
}
