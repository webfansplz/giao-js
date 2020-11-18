export enum Kind {
  var = "var",
  let = "let",
  const = "const",
}
export type KindType = "var" | "let" | "const";
export class Variable {
  private _value: any;
  constructor(public kind: Kind, val: any) {
    this._value = val;
  }
  get value() {
    return this._value;
  }
  set value(val: any) {
    this._value = val;
  }
}
