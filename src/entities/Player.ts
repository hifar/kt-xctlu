import * as THREE from 'three';
import { Entity } from './Entity';
import type { InputManager } from '../engine/InputManager';
import type { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import type { EventBus } from '../engine/EventBus';
import type { GameEvent } from '../types';

export type PlayerState = 'idle' | 'walking' | 'running';

export class Player extends Entity {
  walkSpeed = 4;
  runSpeed = 9;
  private inputManager: InputManager;
  private thirdPersonCamera: ThirdPersonCamera | null = null;
  private eventBus: EventBus<GameEvent>;
  private mixer: THREE.AnimationMixer | null = null;
  private animations: Map<string, THREE.AnimationAction> = new Map();
  private currentState: PlayerState = 'idle';
  private groundY = 0;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private gravity = -20;
  private isGrounded = true;

  private placeholderMesh: THREE.Mesh | null = null;

  constructor(id: string, name: string, input: InputManager, eventBus: EventBus<GameEvent>) {
    super(id, name);
    this.inputManager = input;
    this.eventBus = eventBus;
    this.createPlaceholder();
  }

  private createPlaceholder(): void {
    const geo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
    const mat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    this.placeholderMesh = new THREE.Mesh(geo, mat);
    this.placeholderMesh.position.y = 1.0;
    this.placeholderMesh.castShadow = true;
    this.object3D.add(this.placeholderMesh);
  }

  setModel(model: THREE.Group): void {
    if (this.placeholderMesh) {
      this.object3D.remove(this.placeholderMesh);
      this.placeholderMesh = null;
    }
    this.object3D.add(model);
    this.mixer = new THREE.AnimationMixer(model);
  }

  addAnimation(name: string, clip: THREE.AnimationClip): void {
    if (!this.mixer) return;
    const action = this.mixer.clipAction(clip);
    this.animations.set(name, action);
  }

  setThirdPersonCamera(camera: ThirdPersonCamera): void {
    this.thirdPersonCamera = camera;
  }

  private transitionAnimation(newState: PlayerState): void {
    if (newState === this.currentState) return;

    const prev = this.animations.get(this.currentState);
    const next = this.animations.get(newState);

    if (prev) prev.fadeOut(0.2);
    if (next) {
      next.reset().fadeIn(0.2).play();
    }
    this.currentState = newState;
    this.eventBus.emit('PLAYER_STATE_CHANGE', {
      state: newState,
      speed: newState === 'running' ? this.runSpeed : newState === 'walking' ? this.walkSpeed : 0,
    });
  }

  getState(): PlayerState {
    return this.currentState;
  }

  update(delta: number): void {
    super.update(delta);
    this.handleMovement(delta);
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  private handleMovement(delta: number): void {
    const input = this.inputManager;
    const isRunning = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight');
    const speed = isRunning ? this.runSpeed : this.walkSpeed;

    const forward = input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp');
    const backward = input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown');
    const left = input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft');
    const right = input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight');

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (forward) moveDir.z -= 1;
    if (backward) moveDir.z += 1;
    if (left) moveDir.x -= 1;
    if (right) moveDir.x += 1;

    const isMoving = moveDir.lengthSq() > 0;

    if (isMoving) {
      moveDir.normalize();

      // Orient movement relative to camera yaw
      const cameraYaw = this.thirdPersonCamera?.getYaw() ?? 0;
      moveDir.applyEuler(new THREE.Euler(0, cameraYaw, 0));

      // Rotate player to face movement direction
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      const currentAngle = this.object3D.rotation.y;
      // Normalize angle difference to [-PI, PI]
      let diff = targetAngle - currentAngle;
      diff = ((diff % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (diff > Math.PI) diff -= 2 * Math.PI;
      this.object3D.rotation.y += diff * Math.min(10 * delta, 1);

      this.velocity.x = moveDir.x * speed;
      this.velocity.z = moveDir.z * speed;
      this.transitionAnimation(isRunning ? 'running' : 'walking');
    } else {
      this.velocity.x *= 0.85;
      this.velocity.z *= 0.85;
      this.transitionAnimation('idle');
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y += this.gravity * delta;
    }

    this.object3D.position.x += this.velocity.x * delta;
    this.object3D.position.y += this.velocity.y * delta;
    this.object3D.position.z += this.velocity.z * delta;

    // Simple ground clamping
    if (this.object3D.position.y <= this.groundY) {
      this.object3D.position.y = this.groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    }
  }

  setGroundY(y: number): void {
    this.groundY = y;
  }
}
