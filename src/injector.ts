import { DependencyContainer, DependencyInjector } from "./interface";

export class Injector implements DependencyInjector {

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