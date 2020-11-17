import Scope from "../scope";
import * as ESTree from "estree";
import { AstPath } from "../types/index";

const es5 = {
  Literal(astPath: AstPath<ESTree.Literal>) {
    const { node } = astPath;
    if ((<ESTree.RegExpLiteral>node).regex) {
      const { pattern, flags } = (<ESTree.RegExpLiteral>node).regex;
      return new RegExp(pattern, flags);
    } else return node.value;
  },
  BinaryExpression(astPath: AstPath<ESTree.BinaryExpression>) {
    const { node, scope } = astPath;
    const leftNode = this.visitNode(node.left, scope);
    const operator = node.operator;
    const rightNode = this.visitNode(node.right, scope);
    console.log(
      {
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
      }[operator](leftNode, rightNode)
    );
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
  },

  ExpressionStatement(astPath: AstPath<ESTree.ExpressionStatement>) {
    const { node, scope } = astPath;
    return this.visitNode(node.expression, scope);
  },
  Program(astPath: AstPath<ESTree.Program>) {
    const { node, scope } = astPath;
    node.body.forEach((bodyNode) => this.visitNode(bodyNode, scope));
  },
};
export default es5;
