/**
 * Ethers.js v6 compatibility layer
 * Provides utility functions that work with ethers v6 API
 */

import { ethers } from 'ethers';

// Re-export common types
export type Provider = ethers.Provider;
export type Signer = ethers.Signer;
export type Contract = ethers.Contract;
export type TransactionReceipt = ethers.TransactionReceipt;
export type TransactionResponse = ethers.TransactionResponse;
export type TransactionRequest = ethers.TransactionRequest;

/**
 * Create a JSON-RPC provider
 */
export function createJsonRpcProvider(url: string): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(url);
}

/**
 * Create a browser provider from window.ethereum
 */
export function createBrowserProvider(ethereum: any): ethers.BrowserProvider {
  return new ethers.BrowserProvider(ethereum);
}

/**
 * Format units (replaces ethers.utils.formatUnits)
 */
export function formatUnits(value: bigint | string, decimals: number = 18): string {
  return ethers.formatUnits(value, decimals);
}

/**
 * Format ether (replaces ethers.utils.formatEther)
 */
export function formatEther(value: bigint | string): string {
  return ethers.formatEther(value);
}

/**
 * Parse units (replaces ethers.utils.parseUnits)
 */
export function parseUnits(value: string, decimals: number = 18): bigint {
  return ethers.parseUnits(value, decimals);
}

/**
 * Parse ether (replaces ethers.utils.parseEther)
 */
export function parseEther(value: string): bigint {
  return ethers.parseEther(value);
}

/**
 * Keccak256 hash (replaces ethers.utils.keccak256)
 */
export function keccak256(data: string | Uint8Array): string {
  return ethers.keccak256(data);
}

/**
 * Convert string to UTF8 bytes (replaces ethers.utils.toUtf8Bytes)
 */
export function toUtf8Bytes(text: string): Uint8Array {
  return ethers.toUtf8Bytes(text);
}

/**
 * Convert bytes to hex string (replaces ethers.utils.hexlify)
 */
export function hexlify(value: Uint8Array | string | number | bigint): string {
  return ethers.hexlify(value);
}

/**
 * Generate random bytes (replaces ethers.utils.randomBytes)
 */
export function randomBytes(length: number): Uint8Array {
  return ethers.randomBytes(length);
}

/**
 * ABI encode packed (replaces ethers.utils.solidityPack)
 */
export function solidityPacked(types: string[], values: any[]): string {
  return ethers.solidityPacked(types, values);
}

/**
 * ABI encode (replaces ethers.utils.defaultAbiCoder.encode)
 */
export function abiEncode(types: string[], values: any[]): string {
  return ethers.AbiCoder.defaultAbiCoder().encode(types, values);
}

/**
 * ABI decode (replaces ethers.utils.defaultAbiCoder.decode)
 */
export function abiDecode(types: string[], data: string): ethers.Result {
  return ethers.AbiCoder.defaultAbiCoder().decode(types, data);
}

/**
 * Convert to array (replaces ethers.utils.arrayify)
 */
export function getBytes(value: string): Uint8Array {
  return ethers.getBytes(value);
}

/**
 * Concatenate byte arrays (replaces ethers.utils.concat)
 */
export function concat(items: (string | Uint8Array)[]): string {
  return ethers.concat(items.map(i => typeof i === 'string' ? ethers.getBytes(i) : i));
}

/**
 * Check if value is a valid address
 */
export function isAddress(value: string): boolean {
  return ethers.isAddress(value);
}

/**
 * Get checksum address
 */
export function getAddress(address: string): string {
  return ethers.getAddress(address);
}

/**
 * Zero address constant
 */
export const ZeroAddress = ethers.ZeroAddress;

/**
 * Max uint256 value
 */
export const MaxUint256 = ethers.MaxUint256;
