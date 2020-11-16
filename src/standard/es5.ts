import Scope from "../scope";
import * as ESTree from "estree";
import { AstPath } from "../types/index";

const es5 = {
  VariableDeclaration(astPath: AstPath<ESTree.VariableDeclaration>) {
    const { node, scope } = astPath;
    const { declarations, kind } = node;
    declarations.forEach((declar) => {
      const { id, init } = <ESTree.VariableDeclarator>declar;
      const key = (<ESTree.Identifier>id).name;
      const value = init ? this.visitNode(init, scope) : undefined;
      scope.declare(kind, key, value);
    });
  },
  VariableDeclarator(astPath: AstPath<ESTree.VariableDeclarator>) {
    const { node, scope } = astPath;
    const { id, init } = node;
    const key = (<ESTree.Identifier>id).name;
    const value = init ? this.visitNode(init, scope) : undefined;
    scope.defineVar(key, value);
  },
  Identifier(astPath: AstPath<ESTree.Identifier>) {
    const { node, scope } = astPath;
    const name = node.name;
    const variable = scope.search(name);
    if (variable) return variable.value;
  },
  Literal(astPath: AstPath<ESTree.Literal>) {
    const { node } = astPath;
    if ((<ESTree.RegExpLiteral>node).regex) {
      const { pattern, flags } = (<ESTree.RegExpLiteral>node).regex;
      return new RegExp(pattern, flags);
    } else return node.value;
  },
  MemberExpression(astPath: AstPath<ESTree.MemberExpression>) {
    const { node, scope } = astPath;
    const { object, property, computed } = node;
    const prop = computed
      ? this.visitNode(property, scope)
      : (<ESTree.Identifier>property).name;

    const obj = this.visitNode(object, scope);
    return obj[prop];
  },
  CallExpression(astPath: AstPath<ESTree.CallExpression>) {
    const { node, scope } = astPath;
    const { callee } = node;
    const fn = this.visitNode(callee, scope);
    const args = node.arguments.map((arg) => this.visitNode(arg, scope));

    if (callee.type === "MemberExpression") {
      const context = this.visitNode(callee.object, scope);
      return fn.apply(context, args);
    } else {
      const context = scope.search("this");
      return fn.apply(context ? context.value : null, args);
    }
  },
  BinaryExpression(astPath: AstPath<ESTree.BinaryExpression>) {
    const { node, scope } = astPath;
    const leftNode = this.visitNode(node.left, scope);
    const operator = node.operator;
    const rightNode = this.visitNode(node.right, scope);
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
    console.log("this", this, node);
    node.body.forEach((bodyNode) => this.visitNode(bodyNode, scope));
  },
  AssignmentExpression(astPath: AstPath<ESTree.AssignmentExpression>) {
    const { node, scope } = astPath;
    const { left, operator, right } = node;
    let assignVar;
    if (left.type === "Identifier") {
      const value = scope.search(left.name);
      assignVar = value;
    } else if (left.type === "MemberExpression") {
      const { object, property, computed } = left;
      const obj = this.visitNode(object, scope);
      const key = computed
        ? this.visitNode(property, scope)
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
    }[operator](this.visitNode(right, scope));
  },
  ForStatement(node: ESTree.Node) {},
  UpdateExpression(node: ESTree.Node) {},
  BlockStatement(node: ESTree.Node) {},
};
export default es5;
