import Scope from "./scope";
import * as ESTree from "estree";
const l = console.log;
class Visitor {
  private scope: Scope;
  visitVariableDeclaration(node: ESTree.VariableDeclaration) {
    const { declarations, kind } = node;
    declarations.forEach((declar) => {
      const { id, init } = <ESTree.VariableDeclarator>declar;
      const key = (<ESTree.Identifier>id).name;
      const value = init ? this.visitNode(init) : undefined;
      this.scope.declare(kind, key, value);
    });
  }
  visitVariableDeclarator(node: ESTree.VariableDeclarator) {
    const { id, init } = node;
    const key = (<ESTree.Identifier>id).name;
    const value = init ? this.visitNode(init) : undefined;
    this.scope.defineVar(key, value);
  }
  visitIdentifier(node: ESTree.Identifier) {
    const name = node.name;
    const variable = this.scope.search(name);
    if (variable) return variable.value;
  }
  visitLiteral(node: ESTree.Literal) {
    return node.value;
  }
  visitBinaryExpression(node: ESTree.BinaryExpression) {
    const leftNode = this.visitNode(node.left);
    const operator = node.operator;
    const rightNode = this.visitNode(node.right);
    return {
      "+": (l, r) => l + r,
      "-": (l, r) => l - r,
      "*": (l, r) => l * r,
      "/": (l, r) => l / r,
      "%": (l, r) => l % r,
      "<": (l, r) => l < r,
      ">": (l, r) => l > r,
      "<=": (l, r) => l <= r,
      ">=": (l, r) => l >= r,
      "==": (l, r) => l == r,
      "===": (l, r) => l === r,
      "!=": (l, r) => l != r,
      "!==": (l, r) => l !== r,
    }[operator](leftNode, rightNode);
  }
  evalArgs(nodeArgs) {
    let g = [];
    for (const nodeArg of nodeArgs) {
      g.push(this.visitNode(nodeArg));
    }
    return g;
  }
  visitExpressionStatement(node: ESTree.ExpressionStatement) {
    return this.visitNode(node.expression);
  }
  visitCallExpression(node: ESTree.CallExpression) {
    // const callee = this.visitIdentifier(node.callee);
    // const _arguments = this.evalArgs(node.arguments);
    // if (callee == "print") l(..._arguments);
  }
  visitProgram(node: ESTree.Program) {
    node.body.forEach((bodyNode) => this.visitNode(bodyNode));
  }
  visitAssignmentExpression(node: ESTree.AssignmentExpression) {
    const { left, operator, right } = node;
    let assignVar;
    if (left.type === "Identifier") {
      const value = this.scope.search(left.name);
      assignVar = value;
    } else if (left.type === "MemberExpression") {
      const { object, property, computed } = left;
      const obj = this.visitNode(object);
      const key = computed
        ? this.visitNode(property)
        : (<ESTree.Identifier>property).name;
      assignVar = {
        get value() {
          return obj[key];
        },
        set value(v) {
          obj[key] = v;
        },
      };
    }
    return {
      "=": (v) => ((assignVar.value = v), v),
      "+=": (v) => ((assignVar.value = assignVar.value + v), assignVar.value),
      "-=": (v) => ((assignVar.value = assignVar.value - v), assignVar.value),
      "*=": (v) => ((assignVar.value = assignVar.value * v), assignVar.value),
      "/=": (v) => ((assignVar.value = assignVar.value / v), assignVar.value),
      "%=": (v) => ((assignVar.value = assignVar.value % v), assignVar.value),
    }[operator](this.visitNode(right));
  }
  visitNode(node: ESTree.Node) {
    switch (node.type) {
      case "Program":
        return this.visitProgram(node);
      case "VariableDeclaration":
        return this.visitVariableDeclaration(node);
      case "VariableDeclarator":
        return this.visitVariableDeclarator(node);
      case "Literal":
        return this.visitLiteral(node);
      case "Identifier":
        return this.visitIdentifier(node);
      case "BinaryExpression":
        return this.visitBinaryExpression(node);
      case "ExpressionStatement":
        return this.visitExpressionStatement(node);
      case "CallExpression":
        return this.visitCallExpression(node);
      case "AssignmentExpression":
        return this.visitAssignmentExpression(node);
    }
  }
  run(nodes: ESTree.Node, scope: Scope) {
    this.scope = scope;
    return this.visitNode(nodes);
  }
}
export default Visitor;
