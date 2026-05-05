import * as THREE from 'three';
import type { IComponent, IEntity } from '../types/entity';

export abstract class Entity implements IEntity {
  readonly id: string;
  name: string;
  object3D: THREE.Object3D;
  protected components: Map<string, IComponent> = new Map();

  constructor(id: string | undefined, name: string) {
    this.id = id ?? Entity.generateId();
    this.name = name;
    this.object3D = new THREE.Group();
    this.object3D.name = name;
  }

  private static generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `entity_${Math.random().toString(36).slice(2, 11)}`;
  }

  addComponent(name: string, component: IComponent): void {
    this.components.set(name, component);
  }

  getComponent<T extends IComponent>(name: string): T | undefined {
    return this.components.get(name) as T | undefined;
  }

  update(delta: number): void {
    for (const component of this.components.values()) {
      component.update(delta);
    }
  }

  dispose(): void {
    this.object3D.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    this.object3D.parent?.remove(this.object3D);
    this.components.clear();
  }
}
