export enum SignalType {
  break = "break",
  continue = "continue",
  return = "return",
}
export class Signal {
  public type: SignalType;
  public value?: any;

  constructor(type: SignalType, value?: any) {
    this.type = type;
    this.value = value;
  }

  private static checkType(type, value): boolean {
    return value instanceof Signal && value.type === type;
  }

  public static isContinue(v): boolean {
    return this.checkType(SignalType.continue, v);
  }

  public static isBreak(v): boolean {
    return this.checkType(SignalType.break, v);
  }

  public static isReturn(v): boolean {
    return this.checkType(SignalType.return, v);
  }
}
