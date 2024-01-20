import "reflect-metadata";
import { Container } from "./container";
import { Injector } from "./injector";

/** @todo add prettier / es-lint */
function Injectable() {
  return function (target: any) {
    Reflect.defineMetadata("injectable", true, target);
  };
}

@Injectable()
class ClassB {
  public publicField: string;

  constructor() {
    console.info(`B initialized`);
    this.publicField = 'yo';
  }
}
@Injectable()
class ClassA {

  private instanceB: ClassB;

  constructor(instanceB: ClassB) {
    console.info(`A initialized`);
    this.instanceB = instanceB;
  }

  consumeB() {
    return this.instanceB.publicField;
  }
}

export function main(): string {

  const container = new Container()
  container.register('ClassA', ClassA);
  container.register('ClassB', ClassB);

  const injector = new Injector(container);

  const injectedInstance = injector.inject<ClassA>('ClassA');
  return injectedInstance.consumeB();
}

console.log(main());