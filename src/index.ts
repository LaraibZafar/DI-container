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

interface Record<T> {
  value: T;
}

class Container implements DependencyContainer {
  /** @todo bypass this any **/
  // @ts-ignore
  private dependencyMap: Map<symbol, any>
  isRegistered(identifier: symbol): boolean {
    throw new Error("Method not implemented.");
  }
  register<T>(identifier: symbol, implementation: T): void {
    throw new Error("Method not implemented.");
  }
  get<T>(identifier: symbol): T {
    throw new Error("Method not implemented.");
  }
  
}