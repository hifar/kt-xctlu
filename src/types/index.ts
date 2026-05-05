export * from './scene';
export * from './entity';

export interface GameEvent {
  INTERACTION_PROMPT_SHOW: { message: string; entityId: string };
  INTERACTION_PROMPT_HIDE: Record<string, never>;
  INTERACTION_START: { entityId: string; dialogLines: string[] };
  INTERACTION_END: Record<string, never>;
  PLAYER_STATE_CHANGE: { state: string; speed: number };
  SCENE_LOADED: { sceneId: string };
  SCENE_LOAD_PROGRESS: { progress: number; message: string };
}
