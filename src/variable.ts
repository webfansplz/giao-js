export enum VariableType {
  var,
  let,
  const,
}

export class Variable {
  private _value: any;
  constructor(public kind: VariableType, val: any) {
    this._value = val;
  }
  get value() {
    return this._value;
  }
  set value(val: any) {
    this._value = val;
  }
}
