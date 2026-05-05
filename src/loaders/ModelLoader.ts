import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class ModelLoader {
  private static instance: ModelLoader | null = null;
  private gltfLoader: GLTFLoader;
  private fbxLoader: FBXLoader;
  private cache: Map<string, THREE.Group> = new Map();

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.fbxLoader = new FBXLoader();
  }

  static getInstance(): ModelLoader {
    if (!ModelLoader.instance) {
      ModelLoader.instance = new ModelLoader();
    }
    return ModelLoader.instance;
  }

  async loadGLB(url: string): Promise<THREE.Group> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!.clone();
    }
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const group = gltf.scene;
          group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          this.cache.set(url, group);
          resolve(group.clone());
        },
        undefined,
        reject
      );
    });
  }

  async loadFBX(url: string): Promise<THREE.Group> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!.clone();
    }
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(
        url,
        (group) => {
          group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          this.cache.set(url, group);
          resolve(group.clone() as THREE.Group);
        },
        undefined,
        reject
      );
    });
  }

  async load(url: string): Promise<THREE.Group> {
    const ext = url.split('.').pop()?.toLowerCase();
    if (ext === 'fbx') return this.loadFBX(url);
    return this.loadGLB(url);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
