'use client';

import React, { useEffect, useState } from 'react';
import type { GameEvent } from '../types';
import type { EventBus } from '../engine/EventBus';

interface HUDProps {
  eventBus: EventBus<GameEvent> | null;
}

interface InteractionPrompt {
  visible: boolean;
  message: string;
}

interface DialogState {
  visible: boolean;
  lines: string[];
  currentLine: number;
}

interface PlayerDebug {
  state: string;
  speed: number;
}

export const HUD: React.FC<HUDProps> = ({ eventBus }) => {
  const [prompt, setPrompt] = useState<InteractionPrompt>({ visible: false, message: '' });
  const [dialog, setDialog] = useState<DialogState>({ visible: false, lines: [], currentLine: 0 });
  const [playerDebug, setPlayerDebug] = useState<PlayerDebug>({ state: 'idle', speed: 0 });
  const [loading, setLoading] = useState<{ visible: boolean; progress: number; message: string }>({
    visible: true,
    progress: 0,
    message: 'Loading...',
  });

  useEffect(() => {
    if (!eventBus) return;

    const onPromptShow = (data: GameEvent['INTERACTION_PROMPT_SHOW']) => {
      setPrompt({ visible: true, message: data.message });
    };
    const onPromptHide = () => {
      setPrompt({ visible: false, message: '' });
    };
    const onInteractionStart = (data: GameEvent['INTERACTION_START']) => {
      setDialog({ visible: true, lines: data.dialogLines, currentLine: 0 });
      setPrompt({ visible: false, message: '' });
    };
    const onInteractionEnd = () => {
      setDialog((d) => ({ ...d, visible: false }));
    };
    const onPlayerState = (data: GameEvent['PLAYER_STATE_CHANGE']) => {
      setPlayerDebug({ state: data.state, speed: data.speed });
    };
    const onLoadProgress = (data: GameEvent['SCENE_LOAD_PROGRESS']) => {
      setLoading({ visible: data.progress < 100, progress: data.progress, message: data.message });
    };

    eventBus.on('INTERACTION_PROMPT_SHOW', onPromptShow);
    eventBus.on('INTERACTION_PROMPT_HIDE', onPromptHide);
    eventBus.on('INTERACTION_START', onInteractionStart);
    eventBus.on('INTERACTION_END', onInteractionEnd);
    eventBus.on('PLAYER_STATE_CHANGE', onPlayerState);
    eventBus.on('SCENE_LOAD_PROGRESS', onLoadProgress);

    return () => {
      eventBus.off('INTERACTION_PROMPT_SHOW', onPromptShow);
      eventBus.off('INTERACTION_PROMPT_HIDE', onPromptHide);
      eventBus.off('INTERACTION_START', onInteractionStart);
      eventBus.off('INTERACTION_END', onInteractionEnd);
      eventBus.off('PLAYER_STATE_CHANGE', onPlayerState);
      eventBus.off('SCENE_LOAD_PROGRESS', onLoadProgress);
    };
  }, [eventBus]);

  const advanceDialog = () => {
    setDialog((d) => {
      if (d.currentLine < d.lines.length - 1) {
        return { ...d, currentLine: d.currentLine + 1 };
      }
      return { ...d, visible: false };
    });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', userSelect: 'none' }}>
      {/* Crosshair */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 20,
        height: 20,
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(255,255,255,0.8)',
          transform: 'translateY(-50%)',
        }} />
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: 2,
          background: 'rgba(255,255,255,0.8)',
          transform: 'translateX(-50%)',
        }} />
      </div>

      {/* Interaction Prompt */}
      {prompt.visible && !dialog.visible && (
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: 8,
          fontSize: 16,
          border: '1px solid rgba(255,255,255,0.3)',
          pointerEvents: 'none',
        }}>
          <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>[E]</span> {prompt.message}
        </div>
      )}

      {/* Dialog Box */}
      {dialog.visible && (
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '20px 24px',
          borderRadius: 12,
          fontSize: 16,
          border: '2px solid rgba(255,255,255,0.2)',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }} onClick={advanceDialog}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            {dialog.lines[dialog.currentLine]}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
            {dialog.currentLine < dialog.lines.length - 1
              ? 'Click or press E to continue...'
              : 'Click or press E to close'}
          </p>
        </div>
      )}

      {/* Loading Screen */}
      {loading.visible && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 24 }}>Loading Scene...</h2>
          <div style={{ width: 300, height: 8, background: '#333', borderRadius: 4 }}>
            <div style={{
              width: `${loading.progress}%`,
              height: '100%',
              background: '#3b82f6',
              borderRadius: 4,
              transition: 'width 0.3s',
            }} />
          </div>
          <p style={{ marginTop: 12, color: '#9ca3af', fontSize: 14 }}>{loading.message}</p>
        </div>
      )}

      {/* Debug HUD */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        background: 'rgba(0,0,0,0.5)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: 6,
        fontSize: 13,
        fontFamily: 'monospace',
      }}>
        <div>State: <span style={{ color: '#34d399' }}>{playerDebug.state}</span></div>
        <div>Speed: <span style={{ color: '#60a5fa' }}>{playerDebug.speed.toFixed(1)}</span></div>
      </div>

      {/* Controls Help */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        background: 'rgba(0,0,0,0.5)',
        color: '#9ca3af',
        padding: '8px 12px',
        borderRadius: 6,
        fontSize: 12,
      }}>
        <div>WASD — Move</div>
        <div>Shift — Run</div>
        <div>Mouse — Look (click to lock)</div>
        <div>E — Interact</div>
      </div>
    </div>
  );
};
