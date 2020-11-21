import Scope from "../scope";
import * as ESTree from "estree";
import { AstPath } from "../types/index";
import { SignalType, Signal } from "../signal";
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
      "=": (v) => {
        assignVar.value = v;
        return v;
      },
      "+=": (v) => {
        const value = assignVar.value;
        assignVar.value = v + value;
        return assignVar.value;
      },
      "-=": (v) => {
        const value = assignVar.value;
        assignVar.value = value - v;
        return assignVar.value;
      },
      "*=": (v) => {
        const value = assignVar.value;
        assignVar.value = v * value;
        return assignVar.value;
      },
      "/=": (v) => {
        const value = assignVar.value;
        assignVar.value = value / v;
        return assignVar.value;
      },
      "%=": (v) => {
        const value = assignVar.value;
        assignVar.value = value % v;
        return assignVar.value;
      },
    }[operator](this.visitNode(right, scope));
  },
  ForStatement(astPath: AstPath<ESTree.ForStatement>) {
    const { node, scope } = astPath;
    const { init, test, update, body } = node;
    const forScope = new Scope("block", scope);
    for (
      init ? this.visitNode(init, forScope) : null;
      test ? this.visitNode(test, forScope) : true;
      update ? this.visitNode(update, forScope) : null
    ) {
      const res = this.visitNode(body, forScope);
      if (Signal.isBreak(res)) break;
      if (Signal.isContinue(res)) continue;
      if (Signal.isReturn(res)) return res.result;
    }
  },
  UpdateExpression(astPath: AstPath<ESTree.UpdateExpression>) {
    const { node, scope } = astPath;
    const { prefix, argument, operator } = node;
    let updateVar;
    if (argument.type === "Identifier") {
      const value = scope.search(argument.name);
      updateVar = value;
    } else if (argument.type === "MemberExpression") {
      const { object, property, computed } = argument;
      const obj = this.visitNode(object, scope);
      const key = computed
        ? this.visitNode(property, scope)
        : (<ESTree.Identifier>property).name;
      updateVar = {
        get value() {
          return obj[key];
        },
        set value(v) {
          obj[key] = v;
        },
      };
    }
    return {
      "++": (v) => {
        const result = v.value;
        v.value = result + 1;
        return prefix ? v.value : result;
      },
      "--": (v) => {
        const result = v.value;
        v.value = result - 1;
        return prefix ? v.value : result;
      },
    }[operator](updateVar);
  },
  BlockStatement(astPath: AstPath<ESTree.BlockStatement>) {
    const { node, scope } = astPath;
    const blockScope = new Scope("block", scope);
    const { body } = node;
    for (let i = 0; i < body.length; i++) {
      const res = this.visitNode(body[i], blockScope);
      if (
        Signal.isBreak(res) ||
        Signal.isContinue(res) ||
        Signal.isReturn(res)
      ) {
        return res;
      }
    }
  },
  BreakStatement() {
    return new Signal(SignalType.break);
  },
  ContinueStatement() {
    return new Signal(SignalType.continue);
  },
  ReturnStatement(astPath: AstPath<ESTree.ReturnStatement>) {
    const { node, scope } = astPath;
    return new Signal(
      SignalType.return,
      node.argument ? this.visitNode(node.argument, scope) : undefined
    );
  },
  IfStatement(astPath: AstPath<ESTree.IfStatement>) {
    const { node, scope } = astPath;
    const { test, consequent, alternate } = node;
    const testRes = this.visitNode(test, scope);
    if (testRes) return this.visitNode(consequent, scope);
    else return alternate ? this.visitNode(alternate, scope) : undefined;
  },
};
export default es5;
