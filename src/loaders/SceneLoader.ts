import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';
import type { SceneConfig, Vec3Config } from '../types';
import type { GameEngine } from '../engine/GameEngine';
import { NPC } from '../entities/NPC';
import type { InteractableEntity } from '../types/entity';

function applyVec3(obj: THREE.Object3D, pos: Vec3Config, rot: Vec3Config, scale: Vec3Config): void {
  obj.position.set(pos.x, pos.y, pos.z);
  obj.rotation.set(
    THREE.MathUtils.degToRad(rot.x),
    THREE.MathUtils.degToRad(rot.y),
    THREE.MathUtils.degToRad(rot.z)
  );
  obj.scale.set(scale.x, scale.y, scale.z);
}

export class SceneLoader {
  private modelLoader: ModelLoader;
  private engine: GameEngine;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.modelLoader = ModelLoader.getInstance();
  }

  async loadScene(config: SceneConfig): Promise<{
    scene: THREE.Scene;
    npcs: NPC[];
    interactables: InteractableEntity[];
  }> {
    const scene = this.engine.sceneManager.createScene(config.id);

    // Lighting
    const ambient = new THREE.AmbientLight(
      new THREE.Color(config.ambientLight.color),
      config.ambientLight.intensity
    );
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(
      new THREE.Color(config.directionalLight.color),
      config.directionalLight.intensity
    );
    dirLight.position.set(
      config.directionalLight.position.x,
      config.directionalLight.position.y,
      config.directionalLight.position.z
    );
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    scene.add(dirLight);

    if (config.fog) {
      scene.fog = new THREE.Fog(
        new THREE.Color(config.fog.color),
        config.fog.near,
        config.fog.far
      );
      scene.background = new THREE.Color(config.fog.color);
    } else {
      scene.background = new THREE.Color('#87ceeb');
    }

    this.engine.eventBus.emit('SCENE_LOAD_PROGRESS', { progress: 10, message: 'Loading environment...' });

    // Environment model - use a procedural ground if no model URL
    try {
      if (config.environment.model && config.environment.model !== '') {
        const envModel = await this.modelLoader.load(config.environment.model);
        applyVec3(envModel, config.environment.position, config.environment.rotation, config.environment.scale);
        scene.add(envModel);
      } else {
        // Fallback: generate a simple ground plane
        const groundGeo = new THREE.PlaneGeometry(200, 200);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x556b2f });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Add some decorative geometry
        for (let i = 0; i < 20; i++) {
          const treeGeo = new THREE.CylinderGeometry(0, 1.5, 4, 6);
          const treeMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
          const tree = new THREE.Mesh(treeGeo, treeMat);
          tree.position.set((Math.random() - 0.5) * 80, 2, (Math.random() - 0.5) * 80);
          tree.castShadow = true;
          scene.add(tree);

          const trunkGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 6);
          const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.set(tree.position.x, 1, tree.position.z);
          trunk.castShadow = true;
          scene.add(trunk);
        }
      }
    } catch (e) {
      console.warn('Environment model failed to load, using procedural ground', e);
      const groundGeo = new THREE.PlaneGeometry(200, 200);
      const groundMat = new THREE.MeshLambertMaterial({ color: 0x556b2f });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);
    }

    this.engine.eventBus.emit('SCENE_LOAD_PROGRESS', { progress: 40, message: 'Loading NPCs...' });

    // NPCs
    const npcs: NPC[] = [];
    for (const npcConfig of config.npcs) {
      try {
        const npc = new NPC(npcConfig.id, npcConfig.name, this.engine.eventBus);
        npc.dialogLines = npcConfig.dialogLines;
        npc.interactRange = npcConfig.interactRange;

        const patrolWaypoints = npcConfig.patrolPath.map(
          (p) => new THREE.Vector3(p.x, p.y, p.z)
        );
        npc.setPatrolPath(patrolWaypoints);

        if (npcConfig.model && npcConfig.model !== '') {
          try {
            const model = await this.modelLoader.load(npcConfig.model);
            applyVec3(model, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, npcConfig.scale);
            npc.object3D.add(model);
          } catch {
            // Fallback NPC capsule
            const capsule = createCapsuleMesh(0x3b82f6);
            npc.object3D.add(capsule);
          }
        } else {
          const capsule = createCapsuleMesh(0x3b82f6);
          npc.object3D.add(capsule);
        }

        npc.object3D.position.set(
          npcConfig.position.x,
          npcConfig.position.y,
          npcConfig.position.z
        );
        npc.object3D.rotation.y = THREE.MathUtils.degToRad(npcConfig.rotation.y);
        scene.add(npc.object3D);
        npcs.push(npc);
      } catch (e) {
        console.error(`Failed to load NPC ${npcConfig.name}:`, e);
      }
    }

    this.engine.eventBus.emit('SCENE_LOAD_PROGRESS', { progress: 70, message: 'Loading objects...' });

    // Interactable objects
    const interactables: InteractableEntity[] = [];
    for (const objConfig of config.objects) {
      try {
        let model: THREE.Group;
        if (objConfig.model && objConfig.model !== '') {
          model = await this.modelLoader.load(objConfig.model);
        } else {
          model = createBoxGroup(objConfig.name);
        }
        applyVec3(model, objConfig.position, objConfig.rotation, objConfig.scale);
        scene.add(model);
      } catch (e) {
        console.warn(`Failed to load object ${objConfig.name}:`, e);
      }
    }

    this.engine.eventBus.emit('SCENE_LOAD_PROGRESS', { progress: 100, message: 'Scene ready' });
    this.engine.sceneManager.setCurrentScene(config.id);

    return { scene, npcs, interactables };
  }
}

function createCapsuleMesh(color: number): THREE.Mesh {
  const geo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
  const mat = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 1.0;
  mesh.castShadow = true;
  return mesh;
}

function createBoxGroup(name: string): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.5;
  mesh.castShadow = true;
  group.add(mesh);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#fff';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(name, 128, 40);
  const tex = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: tex });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.y = 1.8;
  sprite.scale.set(2, 0.5, 1);
  group.add(sprite);

  return group;
}
