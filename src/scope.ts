import { Variable, VariableType } from "./variable";
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
    while (scope.parent && scope.type !== "function") {
      scope = scope.parent;
    }
    scope.targetScope.set(rawName, new Variable(VariableType.var, value));
  }
  public defineLet(rawName: string, value: any) {
    this.targetScope.set(rawName, new Variable(VariableType.let, value));
  }
  public defineConst(rawName: string, value: any) {
    this.targetScope.set(rawName, new Variable(VariableType.const, value));
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
  public declare(kind: "var" | "let" | "const", rawName: string, value: any) {
    if (this.hasDefinition(rawName)) return true;
    switch (kind) {
      case "var":
        this.defineVar(rawName, value);
        break;
      case "let":
        this.defineLet(rawName, value);
        break;
      case "const":
        this.defineConst(rawName, value);
        break;
    }
  }
}

export default Scope;
