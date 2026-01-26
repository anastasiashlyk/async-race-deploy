/**
 * В случае перечислений удобно использовать "префиксы" групп PAGE_ CAR_ для компоновки и восприятия
 */
export const enum AppEventsNames {
  PAGE_GARAGE_OPEN = 'PAGE_GARAGE_OPEN',
  PAGE_WINNERS_OPEN = 'PAGE_WINNERS_OPEN',
  PAGE_HIDE_ALL = 'PAGE_HIDE_ALL',

  CAR_WINNER = 'CAR_WINNER',
}

type ListenerFunction = (parameter?: unknown) => boolean | void;

export class Mediator {
  private static instance = new Mediator();
  private listeners = new Map<AppEventsNames, Array<ListenerFunction>>();

  private constructor() {}
  static getInstance(): Mediator {
    return this.instance;
  }

  subscribe(event: AppEventsNames, callback: ListenerFunction): void {
    if (!this.listeners.has(event)) {
      const listFunction: Array<ListenerFunction> = [callback];
      this.listeners.set(event, listFunction);
    }

    const listeners = this.listeners.get(event);
    listeners?.push(callback);
  }
  unsubscribe() {
    // Добавите свою реализацию :)
  }
  notify(event: AppEventsNames, parameter?: unknown): boolean {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        listener(parameter);
      }
      return true;
    }
    return false;
  }
}
