import * as THREE from 'three';

export interface Vec3Config {
  x: number;
  y: number;
  z: number;
}

export interface EnvironmentConfig {
  model: string;
  position: Vec3Config;
  rotation: Vec3Config;
  scale: Vec3Config;
}

export interface PatrolPointConfig {
  x: number;
  y: number;
  z: number;
}

export interface NPCConfig {
  id: string;
  name: string;
  model: string;
  position: Vec3Config;
  rotation: Vec3Config;
  scale: Vec3Config;
  patrolPath: PatrolPointConfig[];
  dialogLines: string[];
  interactRange: number;
}

export interface SceneObjectConfig {
  id: string;
  name: string;
  model: string;
  position: Vec3Config;
  rotation: Vec3Config;
  scale: Vec3Config;
  interactable: boolean;
  interactRange?: number;
  interactMessage?: string;
}

export interface SceneConfig {
  id: string;
  name: string;
  environment: EnvironmentConfig;
  npcs: NPCConfig[];
  objects: SceneObjectConfig[];
  ambientLight: { color: string; intensity: number };
  directionalLight: { color: string; intensity: number; position: Vec3Config };
  fog?: { color: string; near: number; far: number };
  playerSpawn: Vec3Config;
}
