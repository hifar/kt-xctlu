import * as THREE from 'three';
import { EventBus } from './EventBus';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';
import type { GameEvent } from '../types';

export interface ISystem {
  update(delta: number, scene: THREE.Scene): void;
}

export class GameEngine {
  private static instance: GameEngine | null = null;

  renderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;
  clock: THREE.Clock = new THREE.Clock();
  eventBus: EventBus<GameEvent> = new EventBus<GameEvent>();
  inputManager: InputManager = new InputManager();
  sceneManager!: SceneManager;

  private systems: ISystem[] = [];
  private animationFrameId: number | null = null;
  private running = false;
  private canvas: HTMLCanvasElement | null = null;

  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  static resetInstance(): void {
    GameEngine.instance = null;
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    this.sceneManager = new SceneManager(this.eventBus);
    this.inputManager.init(canvas);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    if (!this.canvas) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  registerSystem(system: ISystem): void {
    this.systems.push(system);
  }

  unregisterSystem(system: ISystem): void {
    const idx = this.systems.indexOf(system);
    if (idx !== -1) this.systems.splice(idx, 1);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.loop();
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.clock.stop();
  }

  private loop = (): void => {
    if (!this.running) return;
    this.animationFrameId = requestAnimationFrame(this.loop);

    const delta = Math.min(this.clock.getDelta(), 0.1); // cap delta to prevent physics explosions during lag spikes
    const scene = this.sceneManager.getCurrentScene();
    if (scene) {
      for (const system of this.systems) {
        system.update(delta, scene);
      }
      this.renderer.render(scene, this.camera);
    }
  };

  dispose(): void {
    this.stop();
    this.inputManager.dispose();
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.eventBus.clear();
    GameEngine.resetInstance();
  }
}
