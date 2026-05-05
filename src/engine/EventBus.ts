type EventHandler<T> = (data: T) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventBus<TEvents extends Record<string, any>> {
  private listeners: {
    [K in keyof TEvents]?: Set<EventHandler<TEvents[K]>>;
  } = {};

  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(handler);
  }

  off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    this.listeners[event]?.delete(handler);
  }

  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    this.listeners[event]?.forEach((handler) => handler(data));
  }

  once<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    const wrapper: EventHandler<TEvents[K]> = (data) => {
      handler(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  clear(): void {
    this.listeners = {};
  }
}
