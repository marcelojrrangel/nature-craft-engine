let soundManager: Phaser.Sound.BaseSoundManager | null = null;

export function initSoundManager(sm: Phaser.Sound.BaseSoundManager) {
  soundManager = sm;
}

export function clearSoundManager() {
  soundManager = null;
}

export function playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
  if (!soundManager) return;
  try { soundManager.play(key, config); } catch { /* sound not loaded or error */ }
}

export function playRandomSound(keys: string[], config?: Phaser.Types.Sound.SoundConfig) {
  if (!keys.length || !soundManager) return;
  const key = keys[Math.floor(Math.random() * keys.length)];
  playSound(key, config);
}
