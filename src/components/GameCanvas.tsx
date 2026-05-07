'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { SceneLoader } from '../loaders/SceneLoader';
import { InteractionSystem } from '../systems/InteractionSystem';
import { HUD } from './HUD';
import type { EventBus } from '../engine/EventBus';
import type { GameEvent, SceneConfig } from '../types';

const DEMO_SCENE_CONFIG: SceneConfig = {
  id: 'demo',
  name: 'Demo Scene',
  environment: {
    model: '',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
  npcs: [
    {
      id: 'npc_elder',
      name: 'Village Elder',
      model: '',
      position: { x: 8, y: 0, z: 5 },
      rotation: { x: 0, y: 180, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      patrolPath: [
        { x: 8, y: 0, z: 5 },
        { x: 12, y: 0, z: 5 },
        { x: 12, y: 0, z: 10 },
        { x: 8, y: 0, z: 10 },
      ],
      dialogLines: [
        'Greetings, traveler. Welcome to our humble village.',
        'These lands have known peace for many years, but strange things stir in the forest to the north.',
        'If you seek adventure, follow the path beyond the old oak tree.',
      ],
      interactRange: 3,
    },
    {
      id: 'npc_merchant',
      name: 'Wandering Merchant',
      model: '',
      position: { x: -6, y: 0, z: 8 },
      rotation: { x: 0, y: 90, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      patrolPath: [
        { x: -6, y: 0, z: 8 },
        { x: -10, y: 0, z: 8 },
      ],
      dialogLines: [
        'Ah, a customer! I have wares from distant lands.',
        'Finest quality potions and maps — all at a fair price!',
      ],
      interactRange: 3,
    },
  ],
  objects: [
    {
      id: 'chest_01',
      name: 'Treasure Chest',
      model: '',
      position: { x: 3, y: 0, z: -4 },
      rotation: { x: 0, y: 45, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      interactable: true,
      interactRange: 2,
      interactMessage: 'Open chest',
    },
    {
      id: 'sign_01',
      name: 'Notice Board',
      model: '',
      position: { x: -3, y: 0, z: -2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      interactable: true,
      interactRange: 2,
      interactMessage: 'Read notice',
    },
  ],
  ambientLight: { color: '#ffffff', intensity: 0.4 },
  directionalLight: {
    color: '#fffde7',
    intensity: 1.2,
    position: { x: 50, y: 80, z: 30 },
  },
  fog: { color: '#c9e8f5', near: 40, far: 150 },
  playerSpawn: { x: 0, y: 0, z: 0 },
};

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [eventBus, setEventBus] = useState<EventBus<GameEvent> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // GameEngine.init() calls renderer.setSize() which sets the canvas buffer size,
    // so we do not set canvas.width/height manually here to avoid conflicts.
    const engine = GameEngine.getInstance();
    engineRef.current = engine;
    engine.init(canvas);
    setEventBus(engine.eventBus);

    let disposed = false;

    async function setupScene() {
      if (disposed) return;

      const sceneLoader = new SceneLoader(engine);
      const { scene, npcs, interactables } = await sceneLoader.loadScene(DEMO_SCENE_CONFIG);

      if (disposed) return;
      const player = new Player('player_1', 'Player', engine.inputManager, engine.eventBus);
      player.object3D.position.set(
        DEMO_SCENE_CONFIG.playerSpawn.x,
        DEMO_SCENE_CONFIG.playerSpawn.y,
        DEMO_SCENE_CONFIG.playerSpawn.z
      );
      scene.add(player.object3D);

      // Setup camera
      const thirdPersonCam = new ThirdPersonCamera(engine.camera, engine.inputManager, {
        distance: 7,
        height: 3,
        sensitivity: 0.003,
        lerpFactor: 10,
      });
      thirdPersonCam.setTarget(player.object3D);
      player.setThirdPersonCamera(thirdPersonCam);

      // Setup interaction system — register NPCs and interactable objects
      const interactionSystem = new InteractionSystem(engine.eventBus, engine.inputManager);
      interactionSystem.setPlayer(player);
      for (const npc of npcs) {
        interactionSystem.registerEntity(npc);
      }
      for (const obj of interactables) {
        interactionSystem.registerEntity(obj);
      }
      engine.registerSystem(interactionSystem);

      // Main update system
      engine.registerSystem({
        update(delta: number) {
          player.update(delta);
          for (const npc of npcs) {
            npc.update(delta);
          }
          thirdPersonCam.update(delta);
        },
      });

      engine.start();
    }

    setupScene().catch((error) => {
      console.error('[GameCanvas] Scene setup error:', error);
    });

    return () => {
      disposed = true;
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      <HUD eventBus={eventBus} />
    </div>
  );
};
