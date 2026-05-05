import * as THREE from 'three';
import { Entity } from './Entity';
import type { EventBus } from '../engine/EventBus';
import type { GameEvent } from '../types';
import type { InteractableEntity, IEntity } from '../types/entity';

export type NPCState = 'IDLE' | 'PATROL' | 'INTERACT';

export class NPC extends Entity implements InteractableEntity {
  interactRange = 3;
  dialogLines: string[] = ['Hello, traveler!'];
  private state: NPCState = 'IDLE';
  private patrolPath: THREE.Vector3[] = [];
  private patrolIndex = 0;
  private patrolSpeed = 1.5;
  private idleTimer = 0;
  private idleDuration = 2;
  private eventBus: EventBus<GameEvent>;
  private mixer: THREE.AnimationMixer | null = null;

  constructor(id: string, name: string, eventBus: EventBus<GameEvent>) {
    super(id, name);
    this.eventBus = eventBus;
  }

  setPatrolPath(waypoints: THREE.Vector3[]): void {
    this.patrolPath = waypoints;
    if (waypoints.length > 0) {
      this.state = 'PATROL';
    }
  }

  setMixer(mixer: THREE.AnimationMixer): void {
    this.mixer = mixer;
  }

  getState(): NPCState {
    return this.state;
  }

  onInteract(player: IEntity): void {
    if (this.state === 'INTERACT') return;
    this.state = 'INTERACT';
    // Face the player
    const dir = new THREE.Vector3()
      .subVectors(player.object3D.position, this.object3D.position)
      .normalize();
    this.object3D.rotation.y = Math.atan2(dir.x, dir.z);
    this.eventBus.emit('INTERACTION_START', {
      entityId: this.id,
      dialogLines: this.dialogLines,
    });
  }

  endInteraction(): void {
    this.state = this.patrolPath.length > 0 ? 'PATROL' : 'IDLE';
    this.eventBus.emit('INTERACTION_END', {});
  }

  getInteractMessage(): string {
    return `Talk to ${this.name}`;
  }

  update(delta: number): void {
    super.update(delta);
    if (this.mixer) this.mixer.update(delta);

    switch (this.state) {
      case 'IDLE':
        this.idleTimer += delta;
        if (this.idleTimer >= this.idleDuration && this.patrolPath.length > 0) {
          this.idleTimer = 0;
          this.state = 'PATROL';
        }
        break;
      case 'PATROL':
        this.updatePatrol(delta);
        break;
      case 'INTERACT':
        // Stay still while interacting
        break;
    }
  }

  private updatePatrol(delta: number): void {
    if (this.patrolPath.length === 0) {
      this.state = 'IDLE';
      return;
    }

    const target = this.patrolPath[this.patrolIndex];
    const current = this.object3D.position;
    const dir = new THREE.Vector3(
      target.x - current.x,
      0,
      target.z - current.z
    );
    const dist = dir.length();

    if (dist < 0.2) {
      // Reached waypoint
      this.patrolIndex = (this.patrolIndex + 1) % this.patrolPath.length;
      if (this.patrolIndex === 0) {
        this.state = 'IDLE';
        this.idleTimer = 0;
      }
    } else {
      dir.normalize();
      this.object3D.position.x += dir.x * this.patrolSpeed * delta;
      this.object3D.position.z += dir.z * this.patrolSpeed * delta;
      this.object3D.rotation.y = Math.atan2(dir.x, dir.z);
    }
  }
}
