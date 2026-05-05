import * as THREE from 'three';
import type { ISystem } from '../engine/GameEngine';

export interface PhysicsBody {
  object3D: THREE.Object3D;
  groundY: number;
  radius: number;
}

export class PhysicsSystem implements ISystem {
  private bodies: PhysicsBody[] = [];
  private terrainMeshes: THREE.Mesh[] = [];

  registerBody(body: PhysicsBody): void {
    this.bodies.push(body);
  }

  registerTerrain(mesh: THREE.Mesh): void {
    this.terrainMeshes.push(mesh);
  }

  update(_delta: number, _scene: THREE.Scene): void {
    // Simple ground clamping - keep objects at groundY
    for (const body of this.bodies) {
      if (body.object3D.position.y < body.groundY) {
        body.object3D.position.y = body.groundY;
      }
    }
  }

  // Raycast downward to find terrain height at position
  getGroundHeight(position: THREE.Vector3): number {
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(position.x, 100, position.z),
      new THREE.Vector3(0, -1, 0),
      0,
      200
    );
    const intersects = raycaster.intersectObjects(this.terrainMeshes, true);
    if (intersects.length > 0) {
      return intersects[0].point.y;
    }
    return 0;
  }
}
