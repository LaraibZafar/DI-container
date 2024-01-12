const world = 'world';

function trackProperties(target: any, key: string) {
  if (!target.hasOwnProperty("__trackedFields")) {
    Object.defineProperty(target, "__trackedFields", { value: [] });
  }
  target.__trackedFields.push(key);
}
class ExampleClass {
  @trackProperties
  private privateField: number;
  
  @trackProperties
  public publicField: string;

  constructor() {
    this.privateField = 1;
    this.publicField = '';
  }
}

export function hello(who: string = world): string {
  const instance = new ExampleClass();
  const classPrototype = Object.getOwnPropertySymbols(instance);

  const fields: string[] = Object.getOwnPropertyNames(classPrototype);
  console.log(fields);

  // @ts-ignore
  const trackedFields: string[] = instance.__trackedFields || [];
  console.log(trackedFields);
  
  return `Hello! `;
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