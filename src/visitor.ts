import Scope from "./scope";
import * as ESTree from "estree";
import es5 from "./standard/es5";

const VISITOR = {
  ...es5,
};
class Visitor {
  visitNode(node: ESTree.Node, scope: Scope) {
    return {
      visitNode: this.visitNode,
      ...VISITOR,
    }[node.type]({ node, scope });
  }
}
export default Visitor;
