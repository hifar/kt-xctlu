import * as THREE from 'three';
import type { InputManager } from '../engine/InputManager';

export interface ThirdPersonCameraConfig {
  distance: number;
  height: number;
  sensitivity: number;
  lerpFactor: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

const DEFAULT_CONFIG: ThirdPersonCameraConfig = {
  distance: 6,
  height: 2.5,
  sensitivity: 0.003,
  lerpFactor: 8,
  minPolarAngle: 0.2,
  maxPolarAngle: Math.PI / 2.2,
};

export class ThirdPersonCamera {
  private camera: THREE.PerspectiveCamera;
  private input: InputManager;
  private target: THREE.Object3D | null = null;
  private config: ThirdPersonCameraConfig;

  private yaw = 0;
  private pitch = 0.3;

  private currentPosition: THREE.Vector3 = new THREE.Vector3();
  private targetLookAt: THREE.Vector3 = new THREE.Vector3();

  constructor(
    camera: THREE.PerspectiveCamera,
    input: InputManager,
    config: Partial<ThirdPersonCameraConfig> = {}
  ) {
    this.camera = camera;
    this.input = input;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setTarget(target: THREE.Object3D): void {
    this.target = target;
    this.currentPosition.copy(target.position);
    this.currentPosition.y += this.config.height;
    this.currentPosition.z += this.config.distance;
    this.camera.position.copy(this.currentPosition);
  }

  getYaw(): number {
    return this.yaw;
  }

  update(delta: number): void {
    if (!this.target) return;

    const mouseDelta = this.input.getMouseDelta();
    this.yaw -= mouseDelta.x * this.config.sensitivity;
    this.pitch -= mouseDelta.y * this.config.sensitivity;
    this.pitch = THREE.MathUtils.clamp(
      this.pitch,
      this.config.minPolarAngle,
      this.config.maxPolarAngle
    );

    // Compute desired camera position in spherical coords around target
    const { distance, height } = this.config;
    const offsetX = distance * Math.sin(this.yaw) * Math.cos(this.pitch);
    const offsetY = distance * Math.sin(this.pitch) + height;
    const offsetZ = distance * Math.cos(this.yaw) * Math.cos(this.pitch);

    const targetPos = this.target.position;
    const desiredPos = new THREE.Vector3(
      targetPos.x + offsetX,
      targetPos.y + offsetY,
      targetPos.z + offsetZ
    );

    const lerpSpeed = this.config.lerpFactor * delta;
    this.currentPosition.lerp(desiredPos, Math.min(lerpSpeed, 1));
    this.camera.position.copy(this.currentPosition);

    this.targetLookAt.lerp(
      new THREE.Vector3(targetPos.x, targetPos.y + 1.0, targetPos.z),
      Math.min(lerpSpeed, 1)
    );
    this.camera.lookAt(this.targetLookAt);
  }
}
