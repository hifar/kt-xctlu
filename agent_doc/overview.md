# 3D Game Framework - 项目总体概述

## 🎮 项目简介

**3D Game Framework** 是一个灵活、可扩展的 3D 游戏引擎框架，构建于现代 Web 技术栈上。旨在为开发者提供快速开发 WebGL 3D 游戏的基础设施。

### 核心特性
- **GameEngine** - 单例模式的游戏引擎，包含 requestAnimationFrame 游戏循环
- **EventBus** - 完全类型化的发布-订阅事件系统
- **InputManager** - 键盘、鼠标、指针锁定 API 支持
- **SceneManager** - 多场景管理系统
- **ModelLoader** - GLB/GLTF/FBX 模型加载，支持 LRU 缓存
- **Entity/Component** - 基础实体和组件系统
- **NPC 和 Player** - 可控角色和 AI 角色
- **ThirdPersonCamera** - 第三人称摄像机
- **InteractionSystem** - 交互系统（靠近检测、对话系统）
- **HUD** - React 覆盖层 UI（准星、对话框、加载屏幕、调试面板）

## 🛠️ 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| **框架** | Next.js | 15.5.15 |
| **UI** | React | ^19.1.0 |
| **3D 渲染** | Three.js | ^0.165.0 |
| **语言** | TypeScript | ^5.4.0 |
| **样式** | CSS | 原生 CSS |
| **构建** | Webpack (Next.js) | 内置 |

## 📁 项目结构

```
kt-xctlu/
├── public/
│   └── models/                  # 3D 模型文件存储目录
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # 全局布局
│   │   ├── page.tsx             # 主页面
│   │   └── globals.css          # 全局样式
│   │
│   ├── camera/
│   │   └── ThirdPersonCamera.ts # 第三人称摄像机实现
│   │
│   ├── components/
│   │   ├── GameCanvas.tsx       # 3D 渲染容器组件
│   │   └── HUD.tsx              # UI 覆盖层（准星、对话、加载）
│   │
│   ├── engine/                  # 核心游戏引擎
│   │   ├── EventBus.ts          # 事件总线（类型化 pub/sub）
│   │   ├── GameEngine.ts        # 主引擎类（单例）
│   │   ├── InputManager.ts      # 输入管理（键盘、鼠标）
│   │   ├── SceneManager.ts      # 场景管理
│   │   └── index.ts             # 导出
│   │
│   ├── entities/                # 游戏实体
│   │   ├── Entity.ts            # 基础实体类
│   │   ├── Player.ts            # 可控玩家角色
│   │   ├── NPC.ts               # AI NPC
│   │   ├── InteractableObject.ts# 可交互对象
│   │   └── index.ts             # 导出
│   │
│   ├── loaders/
│   │   ├── ModelLoader.ts       # 3D 模型加载器
│   │   └── SceneLoader.ts       # 场景配置加载器
│   │
│   ├── systems/                 # ECS 系统
│   │   ├── AnimationSystem.ts   # 动画处理
│   │   ├── PhysicsSystem.ts     # 物理/重力系统
│   │   ├── InteractionSystem.ts # 交互系统
│   │   └── index.ts             # 导出
│   │
│   └── types/                   # 类型定义
│       ├── entity.ts            # 实体类型
│       ├── scene.ts             # 场景配置类型
│       └── index.ts             # 导出
│
├── agent_doc/                   # AI 助手文档（本目录）
│   ├── overview.md              # 项目总体概述（本文件）
│   └── changelog.md             # 更改日志
│
├── package.json                 # 项目依赖
├── tsconfig.json                # TypeScript 配置
├── next.config.js               # Next.js 配置
└── README.md                    # 项目说明
```

## 🎮 游戏循环架构

### GameEngine 单例模式
```
GameEngine.getInstance()
  ├── Initialization
  │   ├── WebGLRenderer 初始化
  │   ├── PerspectiveCamera 初始化
  │   ├── InputManager 初始化
  │   └── SceneManager 初始化
  │
  ├── System Registration
  │   ├── registerSystem(ISystem)
  │   └── Systems[] 存储
  │
  ├── Game Loop (requestAnimationFrame)
  │   ├── Clock.getDelta() → delta time
  │   ├── For each System: system.update(delta, scene)
  │   ├── Renderer.render(scene, camera)
  │   └── 下一帧
  │
  └── Lifecycle
      ├── start() - 启动循环
      └── dispose() - 清理资源
```

### 事件系统流向
```
Entity → emit(eventType, data) → EventBus
                                    ↓
                          Listeners[] 收听
                                    ↓
                          HUD/UI React 组件更新
```

## 🔄 主要系统说明

### 1. GameEngine（游戏引擎）
- **单例模式**：整个应用只有一个实例
- **职责**：管理渲染循环、系统注册、生命周期
- **接口**：
  - `init(canvas)` - 初始化引擎
  - `start()` / `stop()` - 控制循环
  - `registerSystem(system)` - 注册系统
  - `dispose()` - 销毁引擎

### 2. EventBus（事件总线）
- **类型安全**：完全使用 TypeScript 类型
- **发布-订阅模式**：
  - `on(event, handler)` - 订阅事件
  - `emit(event, data)` - 发出事件
  - `off(event, handler)` - 取消订阅
  - `once(event, handler)` - 一次性订阅

### 3. InputManager（输入管理）
- **支持的输入**：
  - 键盘：WASD、Shift、E 等
  - 鼠标：移动、点击、指针锁定
- **事件触发**：发出 `key_down`, `key_up`, `mouse_move` 等

### 4. SceneManager（场景管理）
- **多场景支持**：
  - `createScene(id)` - 创建新场景
  - `setCurrentScene(id)` - 切换场景
  - `getScene(id)` - 获取场景引用
  - `removeScene(id)` - 移除场景

### 5. ModelLoader（模型加载）
- **支持格式**：GLB、GLTF、FBX
- **优化**：LRU 缓存防止重复加载
- **自动配置**：设置阴影、材质等

### 6. SceneLoader（场景加载）
- **JSON 驱动**：通过 `SceneConfig` 定义场景
- **程序化生成**：若无模型，生成平面、树木等
- **进度报告**：发送 `SCENE_LOAD_PROGRESS` 事件

### 7. Player（玩家角色）
- **动作**：WASD 移动、Shift 加速、重力
- **状态机**：idle → walking → running
- **摄像机**：集成第三人称摄像机

### 8. NPC（AI 角色）
- **状态机**：IDLE → PATROL → INTERACT
- **巡逻**：遵循预定义的路径点
- **交互**：对话系统集成

### 9. InteractionSystem（交互系统）
- **靠近检测**：检查玩家与 NPC/对象的距离
- **提示显示**：距离内显示 E 键交互提示
- **对话流程**：触发对话并处理对话框

### 10. HUD（用户界面）
- **准星**：屏幕中心十字
- **对话框**：显示 NPC 对话内容
- **交互提示**：显示"[E] 交互"提示
- **加载屏幕**：显示场景加载进度
- **调试面板**：显示玩家状态、速度等

## 🎯 核心数据流

```
场景启动
  ↓
GameCanvas 组件挂载
  ↓
GameEngine.init(canvas)
  ↓
SceneLoader.loadScene(config)
  ├── 加载环境模型
  ├── 创建 NPC 实体
  ├── 创建可交互对象
  ├── 发出 SCENE_LOAD_PROGRESS (100%)
  └── 返回场景、NPC、对象列表
  ↓
HUD 订阅 SCENE_LOAD_PROGRESS 事件
  └── 当 progress === 100 时隐藏加载屏幕
  ↓
Engine.start() 启动游戏循环
  ├── 每帧调用各系统 update()
  ├── 处理玩家输入
  ├── 更新 NPC 和摄像机
  ├── 渲染到画布
  └── 循环继续...
  ↓
玩家交互
  ├── E 键 → 触发交互系统
  ├── 交互系统检测靠近的对象
  ├── 发出 INTERACTION_START 事件
  └── HUD 显示对话框
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
# 访问 http://localhost:3000
```

### 生产构建
```bash
npm run build
npm run start
```

## 💾 配置说明

### SceneConfig（场景配置）
场景通过 JSON 配置对象定义：

```typescript
const config: SceneConfig = {
  id: 'demo',
  name: 'Demo Scene',
  
  // 环境模型
  environment: {
    model: '/models/world.glb',  // 可选，为空则使用程序化地面
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
  
  // NPC 配置
  npcs: [
    {
      id: 'npc_elder',
      name: 'Village Elder',
      model: '/models/npc.glb',
      position: { x: 8, y: 0, z: 5 },
      rotation: { x: 0, y: 180, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      patrolPath: [...],           // 巡逻路径
      dialogLines: [...],          // 对话内容
      interactRange: 3,            // 交互距离
    },
  ],
  
  // 可交互对象
  objects: [
    {
      id: 'chest_01',
      name: 'Treasure Chest',
      model: '/models/chest.glb',
      position: { x: 3, y: 0, z: -4 },
      rotation: { x: 0, y: 45, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      interactable: true,
      interactRange: 2,
      interactMessage: 'Open chest',
    },
  ],
  
  // 光照配置
  ambientLight: { color: '#ffffff', intensity: 0.4 },
  directionalLight: {
    color: '#fffde7',
    intensity: 1.2,
    position: { x: 50, y: 80, z: 30 },
  },
  
  // 雾化效果
  fog: { color: '#c9e8f5', near: 40, far: 150 },
  
  // 玩家出生点
  playerSpawn: { x: 0, y: 0, z: 0 },
};
```

## 🔌 扩展点

### 创建自定义实体
```typescript
class MyEntity extends Entity {
  constructor(id: string, name: string) {
    super(id, name);
  }
  
  update(delta: number) {
    // 自定义逻辑
  }
}
```

### 创建自定义系统
```typescript
class MySystem implements ISystem {
  update(delta: number, scene: THREE.Scene) {
    // 系统逻辑
  }
}

engine.registerSystem(new MySystem());
```

### 订阅事件
```typescript
eventBus.on('INTERACTION_START', (data) => {
  console.log('交互开始：', data);
});
```

## 🐛 已知问题 & 修复

### Issue：Loading 浮层未关闭
- **原因**：EventBus 事件可能因时序问题未正确接收
- **解决方案**：添加 3 秒 timeout 备份机制，确保 UI 更新
- **详见**：[agent_doc/changelog.md](./changelog.md)

## 📚 更多资源

- **Three.js 文档**：https://threejs.org/docs/
- **Next.js 文档**：https://nextjs.org/docs
- **TypeScript 文档**：https://www.typescriptlang.org/docs/

---

**项目版本**：0.1.0  
**最后更新**：2026-05-07  
**维护者**：AI Agent
