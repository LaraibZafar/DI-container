/**
 * @todo trim the Dependency Container interface
 * @todo get rid of the 'anys' use typescript generic magic
 */

export interface DependencyContainer {
    register<T>(identifier: string, implementation: new (...args: any[]) => T): void;
    getImplementation<T>(identifier: string): any;
    isSet(identifier: string): boolean;
    /** @todo make sure implementation is actually an implementation  **/
    set<T>(identifier: string, instance: T): void;
    get<T>(identifier: string): T
  }
  
export interface DependencyInjector {
    /** @todo make it static */
    inject<T>(target: any): T;
  }