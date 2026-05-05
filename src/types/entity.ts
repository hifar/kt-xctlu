import * as THREE from 'three';

export interface IComponent {
  name: string;
  update(delta: number): void;
}

export interface IEntity {
  id: string;
  name: string;
  object3D: THREE.Object3D;
  addComponent(name: string, component: IComponent): void;
  getComponent<T extends IComponent>(name: string): T | undefined;
  update(delta: number): void;
  dispose(): void;
}

export type EntityId = string;

export interface InteractableEntity extends IEntity {
  interactRange: number;
  onInteract(player: IEntity): void;
  getInteractMessage(): string;
}

export function isInteractable(entity: IEntity): entity is InteractableEntity {
  return 'onInteract' in entity && 'interactRange' in entity;
}
