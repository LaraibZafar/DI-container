import "reflect-metadata";



function MyDecorator(metadata: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("my-decorator", metadata, target, propertyKey);
  };
}

function Injectable() {
  return function (target: any) {
    Reflect.defineMetadata("injectable", true, target);
  };
}

function trackProperties(target: any, key: string) {
  if (!target.hasOwnProperty("__trackedFields")) {
    Object.defineProperty(target, "__trackedFields", { value: [] });
  }
  target.__trackedFields.push(key);
}
@Injectable()
class ClassB {
  public publicField: string;

  /** @todo fix this, circular dependency issue */
  /** @todo we might have to go to setter injection to resolve this? */
  // private instanceA: ClassA;

  // constructor(instanceA: ClassA) {
  //   this.publicField = 'yo';
  //   this.instanceA = instanceA;
  // }

  constructor(instanceA: ClassA) {
    this.publicField = 'yo';
  }
}
@Injectable()
class ClassA {
  @trackProperties
  @MyDecorator("some metadata")
  private privateField: number;
  
  @trackProperties
  @MyDecorator("some metadata")
  public publicField: string;

  private instanceB: ClassB;

  constructor(instanceB: ClassB) {
    this.privateField = 1;
    this.publicField = '';
    this.instanceB = instanceB;
  }

  poopies() {
    return this.instanceB.publicField;
  }
}

interface DependencyContainer {
  isRegistered(identifier: symbol): boolean;
  /** @todo make sure implementation is actually an implementation  **/
  register<T>(identifier: symbol, implementation: T): void;
  get<T>(identifier: symbol): T
}

interface DependencyInjector {
  /** @todo make it static */
  inject<T>(target: any): T;
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

class Injector implements DependencyInjector {
  inject<T>(target: any): T {
    const isInjectable = Reflect.getMetadata("injectable", target);
    if (!isInjectable) {
      throw new Error(`Target ${target} is not injectable`);
    }

    /** @desc gets constructor parameters */
    const dependencies: Array<any> = Reflect.getMetadata("design:paramtypes", target) || [];
    console.log(`dependencies : ${dependencies.length}`);
    const instances = dependencies.map((dep) => this.inject(dep));
    return new target(...instances);
  }
}

export function main(): string {
  // const instance = new ClassA();
  // const classPrototype = Object.getOwnPropertySymbols(instance);

  // const fields: string[] = Object.getOwnPropertyNames(classPrototype);
  // console.log(fields);

  // // @ts-ignore
  // const trackedFields: string[] = instance.__trackedFields || [];
  // console.log(trackedFields);
  
  // const metadata = Reflect.getMetadata("my-decorator", ClassA.prototype, "privateField");
  // console.log(metadata);

  const injector = new Injector();
  const injectedInstance = injector.inject<ClassA>(ClassA);
  return injectedInstance.poopies();
}

console.log(main());