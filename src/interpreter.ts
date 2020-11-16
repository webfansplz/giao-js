import Scope from "./scope";
import Visitor from "./visitor";
import * as ESTree from "estree";
class Interpreter {
  private scope: Scope;
  private visitor: Visitor;
  constructor(visitor: Visitor) {
    this.visitor = visitor;
  }
  interpret(node: ESTree.Node) {
    this.createScope();
    this.visitor.visitNode(node, this.scope);
    return this.exportResult();
  }
  createScope() {
    this.scope = new Scope("root");
    this.scope.defineConst("this", null);
    // 模块导出，使用commonjs
    const $exports = {};
    const $module = { exports: $exports };
    this.scope.defineConst("module", $module);
    this.scope.defineVar("exports", $exports);
  }
  exportResult() {
    const moduleExport = this.scope.search("module");
    return moduleExport ? moduleExport.value.exports : null;
  }
}
export default Interpreter;
