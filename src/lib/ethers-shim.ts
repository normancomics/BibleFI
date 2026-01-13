/**
 * Ethers v6 with v5 compatibility shim
 * Re-exports all of ethers v6 plus BigNumber for backward compatibility
 * This allows @superfluid-finance/sdk-core to work with ethers v6
 */

// Re-export everything from ethers v6
export {
  ethers,
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  ContractFactory,
  Wallet,
  formatUnits,
  formatEther,
  parseUnits,
  parseEther,
  isAddress,
  getAddress,
  keccak256,
  toUtf8Bytes,
  hexlify,
  getBytes,
  solidityPacked,
  AbiCoder,
  ZeroAddress,
  MaxUint256,
  Interface,
  Fragment,
  FunctionFragment,
  EventFragment,
  id,
  toQuantity,
  toBigInt,
  toBeHex,
  dataLength,
  dataSlice,
  concat,
  zeroPadValue,
  type Provider,
  type Signer,
  type TransactionReceipt,
  type TransactionResponse,
  type TransactionRequest,
  type ContractTransactionResponse,
  type InterfaceAbi,
  type Networkish,
} from 'ethers';

// Import ethers for namespace usage
import { ethers as ethersNamespace } from 'ethers';

// Create a BigNumber-like class that wraps native bigint for v5 compatibility
class BigNumberImpl {
  private _value: bigint;

  private constructor(value: bigint) {
    this._value = value;
  }

  static from(value: string | number | bigint | BigNumberImpl | { _hex?: string; hex?: string } | null | undefined): BigNumberImpl {
    if (value === null || value === undefined) {
      return new BigNumberImpl(0n);
    }
    if (value instanceof BigNumberImpl) {
      return value;
    }
    if (typeof value === 'bigint') {
      return new BigNumberImpl(value);
    }
    if (typeof value === 'number') {
      return new BigNumberImpl(BigInt(Math.floor(value)));
    }
    if (typeof value === 'string') {
      // Handle hex strings
      if (value.startsWith('0x') || value.startsWith('-0x')) {
        return new BigNumberImpl(BigInt(value));
      }
      return new BigNumberImpl(BigInt(value));
    }
    // Handle objects with _hex or hex property (ethers v5 BigNumber JSON format)
    if (typeof value === 'object' && ('_hex' in value || 'hex' in value)) {
      const hex = value._hex || value.hex;
      if (hex) {
        return new BigNumberImpl(BigInt(hex));
      }
    }
    throw new Error(`Cannot convert ${typeof value} to BigNumber`);
  }

  static isBigNumber(value: unknown): value is BigNumberImpl {
    return value instanceof BigNumberImpl;
  }

  add(other: BigNumberImpl | string | number | bigint): BigNumberImpl {
    return new BigNumberImpl(this._value + BigNumberImpl.from(other)._value);
  }

  sub(other: BigNumberImpl | string | number | bigint): BigNumberImpl {
    return new BigNumberImpl(this._value - BigNumberImpl.from(other)._value);
  }

  mul(other: BigNumberImpl | string | number | bigint): BigNumberImpl {
    return new BigNumberImpl(this._value * BigNumberImpl.from(other)._value);
  }

  div(other: BigNumberImpl | string | number | bigint): BigNumberImpl {
    return new BigNumberImpl(this._value / BigNumberImpl.from(other)._value);
  }

  mod(other: BigNumberImpl | string | number | bigint): BigNumberImpl {
    return new BigNumberImpl(this._value % BigNumberImpl.from(other)._value);
  }

  eq(other: BigNumberImpl | string | number | bigint): boolean {
    return this._value === BigNumberImpl.from(other)._value;
  }

  lt(other: BigNumberImpl | string | number | bigint): boolean {
    return this._value < BigNumberImpl.from(other)._value;
  }

  lte(other: BigNumberImpl | string | number | bigint): boolean {
    return this._value <= BigNumberImpl.from(other)._value;
  }

  gt(other: BigNumberImpl | string | number | bigint): boolean {
    return this._value > BigNumberImpl.from(other)._value;
  }

  gte(other: BigNumberImpl | string | number | bigint): boolean {
    return this._value >= BigNumberImpl.from(other)._value;
  }

  isZero(): boolean {
    return this._value === 0n;
  }

  isNegative(): boolean {
    return this._value < 0n;
  }

  abs(): BigNumberImpl {
    return new BigNumberImpl(this._value < 0n ? -this._value : this._value);
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
    if (this._value < 0n) {
      return '-0x' + (-this._value).toString(16);
    }
    return '0x' + this._value.toString(16);
  }

  // For JSON serialization
  toJSON(): { type: string; hex: string } {
    return { type: 'BigNumber', hex: this.toHexString() };
  }
}

// Export BigNumber for v5 compatibility
export const BigNumber = BigNumberImpl;

// Export default ethers namespace with BigNumber added
const ethersWithBigNumber = {
  ...ethersNamespace,
  BigNumber: BigNumberImpl,
};

export default ethersWithBigNumber;
