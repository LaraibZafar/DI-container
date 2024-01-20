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

  /** @dumbass constructor dependency injection will always have circular dependency as a potential issue */
  /** @todo fix this, circular dependency issue */
  /** @todo we might have to go to setter injection to resolve this? */
  // private instanceA: ClassA;

  // constructor(instanceA: ClassA) {
  //   this.publicField = 'yo';
  //   this.instanceA = instanceA;
  // }

  constructor() {
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
    console.log(`register : ${JSON.stringify(implementation.name)}`);
    Reflect.defineMetadata("identifier", identifier, implementation);
    this.SymbolToImplementationMapping.set(identifier, implementation);
  }

  getImplementation<T>(identifier: string):  new (...args: any[]) => T {
    const implementation = this.SymbolToImplementationMapping.get(identifier)
    console.log(`getImplementation 1- : ${JSON.stringify(implementation?.prototype)}`);
    console.log(`getImplementation 2- : ${JSON.stringify(implementation?.name)}`);

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

    /** @confusion how do I retrieve the instances of classes that don't even have a string? */
    /** @resolution Every class needs to be registered against a string prior to the service being initialized */
    const preExistingInstance = this.dependencyContainer.isSet(target);
    
    if (preExistingInstance)
      return this.dependencyContainer.get<typeof targetImplementation>(target);

    /** @desc gets constructor parameters */
    const dependencies: Array<any> = Reflect.getMetadata("design:paramtypes", targetImplementation) || [];

    // const injectionTokens=
    // Reflect.getOwnMetadata('injectionTokens', target) || {};

    // console.log(`injectionTokens : ${JSON.stringify(injectionTokens)}`);

    console.log(`dependencies : ${JSON.stringify(dependencies)}`);

    const instances = dependencies.map((dep) => {
    const dependencySymbol = Reflect.getMetadata("identifier", dep);
      
      return this.inject(dependencySymbol)
    });

    const targetInstance = new targetImplementation(...instances);

    /** @confusion how do I register these instances against a string */
    /** @resolution Every class needs to be registered against a string prior to the service being initialized */
    this.dependencyContainer.register<typeof targetInstance>('', targetInstance);

    return targetInstance;
  }


}

export function main(): string {

  const container = new Container()
  container.register('ClassA', ClassA);
  container.register('ClassB', ClassB);

  const x = container.getImplementation('ClassA');
  const injector = new Injector(container);

  const injectedInstance = injector.inject<ClassA>('ClassA');
  return injectedInstance.poopies();
}

console.log(main());