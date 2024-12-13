type Listener = () => void;

class EventBus {
  private listeners: { [key: string]: Listener[] } = {};

  subscribe(event: string, callback: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback
    );
  }

  emit(event: string) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => callback());
  }
}

export const eventBus = new EventBus();
