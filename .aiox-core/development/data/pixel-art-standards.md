# Pixel Art Standards — Nature Craft Engine

## Grid
- **Tile size:** 16x16 pixels
- **Character base:** 64x64 pixels (4 tiles tall)
- **NPCs:** 32x32 to 64x64 depending on entity

## Palette Guidelines
- Limit of 16-32 colors per sprite
- Use hue shifting for shading (not just brightness)
- Avoid pure black (#000000) — use dark alternatives
- Skin tones, foliage, stone, and wood each have defined ramps

## Style Rules
- **Line weight:** 1px lines, 2px for outlines on important elements
- **Anti-aliasing:** Manual, not automatic
- **Dithering:** Only for textures (stone, fur), not for gradients
- **Bandring:** Zero tolerance — no parallel lines of same color

## Spritesheet Format
- File naming: `{Type}_{Description}-Sheet.png`
- Frames organized left-to-right, then top-to-bottom
- Frame 0 = idle/default pose
- Consistent padding between frames (2-4px)
- Transparency preserved (no background color)

## Animation Frame Rates
- Idle: 4-6 fps (subtle movement)
- Walk: 8-10 fps
- Run: 10-12 fps
- Attack: 10-15 fps (snappy)
- Death: 6-8 fps (slow)
