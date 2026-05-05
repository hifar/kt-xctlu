import * as THREE from 'three';
import { Entity } from './Entity';
import type { IEntity, InteractableEntity } from '../types/entity';

/**
 * A generic scene object that the player can interact with.
 * Implements InteractableEntity so it integrates with the InteractionSystem.
 */
export class InteractableObject extends Entity implements InteractableEntity {
  interactRange: number;
  private interactMessage: string;
  private interactCallback: ((player: IEntity) => void) | null = null;

  constructor(
    id: string | undefined,
    name: string,
    interactRange = 2,
    interactMessage = 'Press E to interact'
  ) {
    super(id, name);
    this.interactRange = interactRange;
    this.interactMessage = interactMessage;
  }

  /** Override the default no-op with a custom callback. */
  setOnInteract(callback: (player: IEntity) => void): void {
    this.interactCallback = callback;
  }

  onInteract(player: IEntity): void {
    if (this.interactCallback) {
      this.interactCallback(player);
    }
  }

  getInteractMessage(): string {
    return this.interactMessage;
  }
}
