import "reflect-metadata";

function Injectable() {
  return function (target: any) {
    Reflect.defineMetadata("injectable", true, target);
  };
}

@Injectable()
class ClassB {
  public publicField: string;

  constructor() {
    console.log(`B initialized`);
    this.publicField = 'yo';
  }
}
@Injectable()
class ClassA {

  private instanceB: ClassB;

  constructor(instanceB: ClassB) {
    console.log(`A initialized`);
    this.instanceB = instanceB;
  }

  consumeB() {
    return this.instanceB.publicField;
  }
}

interface DependencyContainer {
  register<T>(identifier: string, implementation: new (...args: any[]) => T): void;
  getImplementation<T>(identifier: string): any;
  isSet(identifier: string): boolean;
  /** @todo make sure implementation is actually an implementation  **/
  set<T>(identifier: string, instance: T): void;
  get<T>(identifier: string): T
}

interface DependencyInjector {
  /** @todo make it static */
  inject<T>(target: any): T;
}

class Container implements DependencyContainer {
  /** @todo bypass this any **/
  // @ts-ignore
  private dependencyMap = new Map<string, any>();

  private SymbolToImplementationMapping = new Map<string, new (...args: any[]) => any>();

  register<T>(identifier: string, implementation: new (...args: any[]) => T): void {
    Reflect.defineMetadata("identifier", identifier, implementation);
    this.SymbolToImplementationMapping.set(identifier, implementation);
  }

  getImplementation<T>(identifier: string):  new (...args: any[]) => T {
    const implementation = this.SymbolToImplementationMapping.get(identifier)

    if (!implementation) throw new Error(`Trying to get an instance before registering it : ${String(identifier)}`);

    return implementation;
  }

  isSet(identifier: string): boolean {
    return this.dependencyMap.has(identifier);

  }
  set<T>(identifier: string, instance: T): void {
    /** @todo initialize an instance of the implementation class?  */
    this.dependencyMap.set(identifier, instance);
  }

  get<T>(identifier: string): T {
    const instance = this.dependencyMap.get(identifier);

    if (!instance) throw new Error(`Instance not registered for string : ${String(identifier)}`);

    return instance;
  }
  
}

class Injector implements DependencyInjector {

  private dependencyContainer: DependencyContainer;

  constructor(dependencyContainer: DependencyContainer) {
    this.dependencyContainer = dependencyContainer;
  }
  inject<T>(target: string): T {
    const targetImplementation = this.dependencyContainer.getImplementation<T>(target);
    const isInjectable = Reflect.getMetadata("injectable", targetImplementation);
    if (!isInjectable) {
      throw new Error(`Target ${String(target)} is not injectable`);
    }

    const preExistingInstance = this.dependencyContainer.isSet(target);
    
    if (preExistingInstance)
      return this.dependencyContainer.get<typeof targetImplementation>(target);

    /** @desc gets constructor parameters */
    const dependencies: Array<any> = Reflect.getMetadata("design:paramtypes", targetImplementation) || [];


    const instances = dependencies.map((dep) => {
    const dependencySymbol = Reflect.getMetadata("identifier", dep);
      
      return this.inject(dependencySymbol)
    });

    const targetInstance = new targetImplementation(...instances);

    this.dependencyContainer.set<typeof targetInstance>(target, targetInstance);

    return targetInstance;
  }


}

export function main(): string {

  const container = new Container()
  container.register('ClassA', ClassA);
  container.register('ClassB', ClassB);

  const injector = new Injector(container);

  injector.inject<ClassB>('ClassB');

  const injectedInstance = injector.inject<ClassA>('ClassA');
  return injectedInstance.consumeB();
}

console.log(main());