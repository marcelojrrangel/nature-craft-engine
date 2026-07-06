# Phaser Animation Guide — Nature Craft Engine

## Sprite Loading (BootScene)
```ts
this.load.spritesheet('textureKey', 'path/to/sheet.png', {
  frameWidth: 64,
  frameHeight: 64
});
```

## Animation Creation (MainScene)
```ts
this.anims.create({
  key: 'entity_animation_state',
  frames: this.anims.generateFrameNumbers('textureKey', {
    start: 0,
    end: 3
  }),
  frameRate: 8,
  repeat: -1
});
```

## Entity Animation Pattern
Each entity in `src/game/entities/` follows this pattern:
1. Constants for frame indices per animation state
2. `createAnimations(scene: Phaser.Scene)` static method
3. `updateAnimation()` instance method called in update loop
4. Directional awareness (up/down/left/right variants)

## Entity Template
```ts
export class SomeNPC extends Phaser.Physics.Arcade.Sprite {
  static createAnimations(scene: Phaser.Scene) {
    scene.anims.create({ key: 'some_idle', frames: [...], frameRate: 6, repeat: -1 });
    scene.anims.create({ key: 'some_walk', frames: [...], frameRate: 8, repeat: -1 });
    scene.anims.create({ key: 'some_death', frames: [...], frameRate: 6, repeat: 0 });
  }
}
```

## Notes
- Always use `repeat: -1` for looping (idle, walk) and `repeat: 0` for one-shot (attack, death)
- Check `sys.isActive()` before any animation call to avoid null reference on scene transitions
- Death animation typically ends with `setVisible(false)` or fade out tween
