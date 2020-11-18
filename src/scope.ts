import { Variable, Kind, KindType } from "./variable";

class Scope {
  private parent: Scope | null;
  private targetScope: { [key: string]: any };
  constructor(public readonly type, parent?: Scope) {
    this.parent = parent || null;
    this.targetScope = new Map();
  }
  private hasDefinition(rawName: string): boolean {
    return Boolean(this.search(rawName));
  }
  public defineVar(rawName: string, value: any) {
    let scope: Scope = this;
    // 如果不是全局作用域且不是函数作用域,找到全局作用域,存储变量
    // 这里就是我们常说的Hoisting (变量提升)
    while (scope.parent && scope.type !== "function") {
      scope = scope.parent;
    }
    // 存储变量
    scope.targetScope.set(rawName, new Variable(Kind.var, value));
  }
  public defineLet(rawName: string, value: any) {
    this.targetScope.set(rawName, new Variable(Kind.let, value));
  }
  public defineConst(rawName: string, value: any) {
    this.targetScope.set(rawName, new Variable(Kind.const, value));
  }
  public search(rawName: string): Variable | null {
    if (this.targetScope.get(rawName)) {
      return this.targetScope.get(rawName);
    } else if (this.parent) {
      return this.parent.search(rawName);
    } else {
      return null;
    }
  }
  public declare(kind: Kind | KindType, rawName: string, value: any) {
    if (this.hasDefinition(rawName)) {
      console.error(
        `Uncaught SyntaxError: Identifier '${rawName}' has already been declared`
      );
      return true;
    }
    return {
      [Kind.var]: () => this.defineVar(rawName, value),
      [Kind.let]: () => this.defineLet(rawName, value),
      [Kind.const]: () => this.defineConst(rawName, value),
    }[kind]();
  }
}

export default Scope;
