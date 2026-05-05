import * as THREE from 'three';
import type { GameEvent } from '../types';
import type { EventBus } from './EventBus';

export class SceneManager {
  private scenes: Map<string, THREE.Scene> = new Map();
  private currentSceneId: string | null = null;
  private eventBus: EventBus<GameEvent>;

  constructor(eventBus: EventBus<GameEvent>) {
    this.eventBus = eventBus;
  }

  createScene(id: string): THREE.Scene {
    const scene = new THREE.Scene();
    this.scenes.set(id, scene);
    return scene;
  }

  getScene(id: string): THREE.Scene | undefined {
    return this.scenes.get(id);
  }

  getCurrentScene(): THREE.Scene | undefined {
    return this.currentSceneId ? this.scenes.get(this.currentSceneId) : undefined;
  }

  setCurrentScene(id: string): void {
    if (!this.scenes.has(id)) {
      throw new Error(`Scene "${id}" not found`);
    }
    this.currentSceneId = id;
    this.eventBus.emit('SCENE_LOADED', { sceneId: id });
  }

  removeScene(id: string): void {
    const scene = this.scenes.get(id);
    if (scene) {
      scene.clear();
      this.scenes.delete(id);
    }
  }
}
