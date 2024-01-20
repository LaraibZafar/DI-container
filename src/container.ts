import { DependencyContainer } from "./interface";

/**
 * @todo see if we can get rid of the second map to store Symbol to implementation mapping
 */
export class Container implements DependencyContainer {
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