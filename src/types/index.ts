import Scope from "../scope";
export type AstPath<T> = {
  node: T;
  scope: Scope;
};
