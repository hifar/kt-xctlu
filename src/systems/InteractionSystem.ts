import * as THREE from 'three';
import type { ISystem } from '../engine/GameEngine';
import type { Player } from '../entities/Player';
import type { EventBus } from '../engine/EventBus';
import type { InputManager } from '../engine/InputManager';
import type { GameEvent } from '../types';
import { isInteractable } from '../types/entity';
import type { InteractableEntity, IEntity } from '../types/entity';

export class InteractionSystem implements ISystem {
  private player: Player | null = null;
  private entities: IEntity[] = [];
  private eventBus: EventBus<GameEvent>;
  private input: InputManager;
  private currentPromptEntity: IEntity | null = null;
  private eKeyWasDown = false;
  private isInteracting = false;

  constructor(eventBus: EventBus<GameEvent>, input: InputManager) {
    this.eventBus = eventBus;
    this.input = input;

    this.eventBus.on('INTERACTION_END', () => {
      this.isInteracting = false;
    });
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  registerEntity(entity: IEntity): void {
    this.entities.push(entity);
  }

  unregisterEntity(entity: IEntity): void {
    const idx = this.entities.indexOf(entity);
    if (idx !== -1) this.entities.splice(idx, 1);
  }

  update(_delta: number, _scene: THREE.Scene): void {
    if (!this.player) return;

    const playerPos = this.player.object3D.position;
    let closestEntity: InteractableEntity | null = null;
    let closestDist = Infinity;

    for (const entity of this.entities) {
      if (!isInteractable(entity)) continue;
      const dist = playerPos.distanceTo(entity.object3D.position);
      if (dist < entity.interactRange && dist < closestDist) {
        closestDist = dist;
        closestEntity = entity;
      }
    }

    // Update prompt visibility
    if (closestEntity && !this.isInteracting) {
      if (this.currentPromptEntity !== closestEntity) {
        this.currentPromptEntity = closestEntity;
        this.eventBus.emit('INTERACTION_PROMPT_SHOW', {
          message: closestEntity.getInteractMessage(),
          entityId: closestEntity.id,
        });
      }
    } else {
      if (this.currentPromptEntity) {
        this.currentPromptEntity = null;
        this.eventBus.emit('INTERACTION_PROMPT_HIDE', {});
      }
    }

    // Handle E key press
    const eDown = this.input.isKeyDown('KeyE');
    if (eDown && !this.eKeyWasDown) {
      if (closestEntity && !this.isInteracting) {
        this.isInteracting = true;
        closestEntity.onInteract(this.player);
      } else if (this.isInteracting) {
        // End interaction — INTERACTION_END listener resets isInteracting
        this.eventBus.emit('INTERACTION_END', {});
      }
    }
    this.eKeyWasDown = eDown;
  }
}
