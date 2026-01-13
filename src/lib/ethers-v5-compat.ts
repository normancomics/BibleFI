/**
 * Ethers v5 BigNumber compatibility shim for libraries that still depend on ethers v5 API
 * This provides BigNumber for @superfluid-finance/sdk-core compatibility with ethers v6
 */

// Create a BigNumber-like class that wraps native bigint for v5 compatibility
export class BigNumber {
  private _value: bigint;

  private constructor(value: bigint) {
    this._value = value;
  }

  static from(value: string | number | bigint | BigNumber): BigNumber {
    if (value instanceof BigNumber) {
      return value;
    }
    if (typeof value === 'bigint') {
      return new BigNumber(value);
    }
    if (typeof value === 'number') {
      return new BigNumber(BigInt(Math.floor(value)));
    }
    if (typeof value === 'string') {
      // Handle hex strings
      if (value.startsWith('0x')) {
        return new BigNumber(BigInt(value));
      }
      return new BigNumber(BigInt(value));
    }
    throw new Error(`Cannot convert ${typeof value} to BigNumber`);
  }

  static isBigNumber(value: unknown): value is BigNumber {
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

  abs(): BigNumber {
    return new BigNumber(this._value < 0n ? -this._value : this._value);
  }

  toNumber(): number {
    if (this._value > BigInt(Number.MAX_SAFE_INTEGER) || this._value < BigInt(Number.MIN_SAFE_INTEGER)) {
      throw new Error('BigNumber value out of safe integer range');
    }
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
    return this._value >= 0n ? '0x' + hex : '-0x' + hex.slice(1);
  }

  // For JSON serialization
  toJSON(): { type: string; hex: string } {
    return { type: 'BigNumber', hex: this.toHexString() };
  }
}
