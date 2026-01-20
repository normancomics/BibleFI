/**
 * Ethers v5 compatibility shim for libraries that expect BigNumber
 * This allows @superfluid-finance/sdk-core to work with ethers v6
 */

// Create a BigNumber-like class that wraps native bigint
export class BigNumber {
  private _value: bigint;

  constructor(value: string | number | bigint | BigNumber) {
    if (value instanceof BigNumber) {
      this._value = value._value;
    } else if (typeof value === 'bigint') {
      this._value = value;
    } else if (typeof value === 'number') {
      this._value = BigInt(Math.floor(value));
    } else {
      this._value = BigInt(value);
    }
  }

  static from(value: string | number | bigint | BigNumber): BigNumber {
    return new BigNumber(value);
  }

  static isBigNumber(value: any): value is BigNumber {
    return value instanceof BigNumber;
  }

  add(other: BigNumber | string | number | bigint): BigNumber {
    return new BigNumber(this._value + BigNumber.from(other)._value);
  }

  sub(other: BigNumber | string | number | bigint): BigNumber {
    return new BigNumber(this._value - BigNumber.from(other)._value);
  }

  mul(other: BigNumber | string | number | bigint): BigNumber {
    return new BigNumber(this._value * BigNumber.from(other)._value);
  }

  div(other: BigNumber | string | number | bigint): BigNumber {
    return new BigNumber(this._value / BigNumber.from(other)._value);
  }

  mod(other: BigNumber | string | number | bigint): BigNumber {
    return new BigNumber(this._value % BigNumber.from(other)._value);
  }

  pow(exp: BigNumber | string | number | bigint): BigNumber {
    return new BigNumber(this._value ** BigNumber.from(exp)._value);
  }

  abs(): BigNumber {
    return new BigNumber(this._value < 0n ? -this._value : this._value);
  }

  eq(other: BigNumber | string | number | bigint): boolean {
    return this._value === BigNumber.from(other)._value;
  }

  lt(other: BigNumber | string | number | bigint): boolean {
    return this._value < BigNumber.from(other)._value;
  }

  lte(other: BigNumber | string | number | bigint): boolean {
    return this._value <= BigNumber.from(other)._value;
  }

  gt(other: BigNumber | string | number | bigint): boolean {
    return this._value > BigNumber.from(other)._value;
  }

  gte(other: BigNumber | string | number | bigint): boolean {
    return this._value >= BigNumber.from(other)._value;
  }

  isZero(): boolean {
    return this._value === 0n;
  }

  isNegative(): boolean {
    return this._value < 0n;
  }

  toNumber(): number {
    return Number(this._value);
  }

  toBigInt(): bigint {
    return this._value;
  }

  toString(): string {
    return this._value.toString();
  }

  toHexString(): string {
    const hex = this._value.toString(16);
    return this._value < 0n ? `-0x${hex.slice(1)}` : `0x${hex}`;
  }

  // Allow comparison with ==
  valueOf(): bigint {
    return this._value;
  }
}

// Export for global access
(globalThis as any).BigNumber = BigNumber;
