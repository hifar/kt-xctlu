# 3D Game Framework

A flexible, extensible 3D game framework built with **Next.js 14**, **React 18**, **TypeScript**, and **Three.js**.

## Features

- 🎮 **GameEngine** — Singleton pattern with a `requestAnimationFrame` game loop, system registration, and clean lifecycle management
- 📡 **EventBus** — Fully-typed publish/subscribe event system for decoupled communication
- ⌨️ **InputManager** — Keyboard, mouse, and Pointer Lock API support for first/third-person controls
- 🗺️ **SceneManager** — Multi-scene management with create/switch/remove operations
- 📦 **ModelLoader** — GLB/GLTF and FBX loading with LRU cache and shadow auto-configuration
- 🏗️ **SceneLoader** — JSON-driven scene loading with procedural fallback geometry (ground, trees)
- 🧩 **Entity / Component** — Base `Entity` class with a component system; extend for any game object
- 🏃 **Player** — WASD + Shift movement, animation state machine (idle / walking / running), gravity
- 🤖 **NPC** — Patrol-path state machine (IDLE → PATROL → INTERACT), dialog trigger
- 📷 **ThirdPersonCamera** — Mouse-orbit camera with configurable distance, pitch clamping, and smooth lerp
- 🔔 **InteractionSystem** — Proximity detection, E-key interaction prompt, dialog event flow
- 🎬 **AnimationSystem** — Centralised `THREE.AnimationMixer` updates
- ⚙️ **PhysicsSystem** — Simple ground-clamping with raycaster terrain height query
- 🖥️ **HUD** — React overlay with crosshair, interaction prompt, dialog box, loading screen, debug panel
- ⚡ **Next.js 14 App Router** — SSR-safe dynamic import of the canvas component

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                  # Next.js App Router (layout, page, globals.css)
├── camera/               # ThirdPersonCamera
├── components/           # React components (GameCanvas, HUD)
├── engine/               # Core engine (GameEngine, EventBus, InputManager, SceneManager)
├── entities/             # Entity base class, Player, NPC
├── loaders/              # ModelLoader (GLB/FBX), SceneLoader
├── systems/              # ECS systems (Animation, Physics, Interaction)
└── types/                # Shared TypeScript interfaces and types
public/
└── models/               # Place your .glb / .fbx model files here
```

## Controls

| Key / Input | Action |
|---|---|
| `W A S D` / Arrow keys | Move |
| `Shift` | Run |
| Mouse (click canvas first) | Look around |
| `E` | Interact / advance dialog |

## Scene Configuration

Scenes are driven by a `SceneConfig` JSON object (see `src/types/scene.ts`). Supply a URL to a GLB/FBX model for the environment, NPCs, and objects, or leave the `model` field empty to use the built-in procedural geometry fallback.

```typescript
const myScene: SceneConfig = {
  id: 'my-scene',
  name: 'My Scene',
  environment: { model: '/models/world.glb', position: …, rotation: …, scale: … },
  npcs: [ … ],
  objects: [ … ],
  ambientLight: { color: '#ffffff', intensity: 0.5 },
  directionalLight: { color: '#fffde7', intensity: 1.2, position: { x: 50, y: 80, z: 30 } },
  fog: { color: '#c9e8f5', near: 40, far: 150 },
  playerSpawn: { x: 0, y: 0, z: 0 },
};
```

## Architecture Overview

```
GameEngine (singleton)
  ├── EventBus        — typed pub/sub
  ├── InputManager    — keyboard + mouse + pointer lock
  ├── SceneManager    — THREE.Scene registry
  ├── Renderer        — THREE.WebGLRenderer
  ├── Camera          — THREE.PerspectiveCamera
  └── Systems[]       — ISystem.update(delta, scene) per frame
        ├── InteractionSystem
        ├── AnimationSystem
        └── PhysicsSystem

Entities
  ├── Entity (base)   — id, name, Object3D, components map
  ├── Player          — movement, animation state, gravity
  └── NPC             — patrol FSM, dialog, InteractableEntity

Loaders
  ├── ModelLoader     — GLB/FBX with clone-cache
  └── SceneLoader     — builds scene from SceneConfig
```

## License

MIT
