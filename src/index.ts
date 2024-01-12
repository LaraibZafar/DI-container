const world = 'world';

export function hello(who: string = world): string {
  return `Hello ${who}! `;
}

console.log(hello());

interface DependencyContainer {
  isRegistered(identifier: symbol): boolean;
  /** @todo make sure implementation is actually an implementation  **/
  register<T>(identifier: symbol, implementation: T): void;
  get<T>(identifier: symbol): T
}

interface Injector {
  isRegistered(identifier: symbol): boolean;
  /** @todo make sure implementation is actually an implementation  **/
  register<T>(identifier: symbol, implementation: T): void;
  get<T>(identifier: symbol): T
}

interface Record<T> {
  value: T;
}

class Container implements DependencyContainer {
  /** @todo bypass this any **/
  // @ts-ignore
  private dependencyMap: Map<symbol, any>
  isRegistered(identifier: symbol): boolean {
    return this.dependencyMap.has(identifier);

  }
  register<T>(identifier: symbol, implementation: T): void {
    /** @todo initialize an instance of the implementation class?  */
    this.dependencyMap.set(identifier, implementation);
  }
  get<T>(identifier: symbol): T {
    const instance = this.dependencyMap.get(identifier);

    if (!instance) throw new Error(`Instance not registered for symbol : ${String(identifier)}`);

    return instance;
  }
  
}