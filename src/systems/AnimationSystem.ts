import * as THREE from 'three';
import type { ISystem } from '../engine/GameEngine';

export class AnimationSystem implements ISystem {
  private mixers: THREE.AnimationMixer[] = [];

  registerMixer(mixer: THREE.AnimationMixer): void {
    this.mixers.push(mixer);
  }

  unregisterMixer(mixer: THREE.AnimationMixer): void {
    const idx = this.mixers.indexOf(mixer);
    if (idx !== -1) this.mixers.splice(idx, 1);
  }

  update(delta: number, _scene: THREE.Scene): void {
    for (const mixer of this.mixers) {
      mixer.update(delta);
    }
  }
}
