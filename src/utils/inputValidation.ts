import { z } from 'zod';

// Security validation schemas for all user inputs
export const UserInputSchemas = {
  // Chat and AI interaction inputs
  chatMessage: z.object({
    message: z.string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(1000, "Message must be less than 1000 characters")
      .refine(val => !/<script|javascript:|data:|vbscript:/i.test(val), "Invalid content detected"),
    context: z.object({
      walletAddress: z.string().optional(),
      chainId: z.number().optional(),
      tokenBalances: z.record(z.string(), z.string()).optional()
    }).optional()
  }),

  // Tithing and financial inputs
  titheAmount: z.object({
    amount: z.string()
      .trim()
      .refine(val => /^\d+(\.\d{1,6})?$/.test(val), {
        message: "Invalid amount format"
      })
      .refine(val => parseFloat(val) > 0, {
        message: "Amount must be greater than 0"
      })
      .refine(val => parseFloat(val) <= 1000000, {
        message: "Amount too large"
      }),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    churchId: z.string().uuid("Invalid church ID")
  }),

  // Staking inputs
  stakingAmount: z.object({
    amount: z.string()
      .trim()
      .refine(val => /^\d+(\.\d{1,18})?$/.test(val), {
        message: "Invalid amount format"
      })
      .refine(val => parseFloat(val) > 0, {
        message: "Amount must be greater than 0"
      }),
    poolId: z.string().min(1, "Pool ID required").max(100),
    token: z.string().min(1).max(20)
  }),

  // Swap inputs
  swapInputs: z.object({
    fromAmount: z.string()
      .trim()
      .refine(val => /^\d+(\.\d{1,18})?$/.test(val), {
        message: "Invalid amount format"
      }),
    fromToken: z.string().min(1).max(50),
    toToken: z.string().min(1).max(50),
    slippage: z.string()
      .refine(val => /^\d+(\.\d{1,2})?$/.test(val), {
        message: "Invalid slippage format"
      })
      .refine(val => parseFloat(val) >= 0.1 && parseFloat(val) <= 50, {
        message: "Slippage must be between 0.1% and 50%"
      })
  }),

  // Church registration
  churchRegistration: z.object({
    name: z.string()
      .trim()
      .min(1, "Church name required")
      .max(200, "Church name too long")
      .refine(val => !/[<>"'&]/.test(val), {
        message: "Invalid characters in church name"
      }),
    denomination: z.string().trim().max(100).optional(),
    city: z.string()
      .trim()
      .min(1, "City required")
      .max(100, "City name too long"),
    country: z.string()
      .trim()
      .min(1, "Country required")
      .max(100),
    website: z.string()
      .url("Invalid website URL")
      .optional()
      .or(z.literal('')),
    email: z.string()
      .email("Invalid email address")
      .max(255)
      .optional()
      .or(z.literal('')),
    cryptoAddress: z.string()
      .refine(val => !val || /^0x[a-fA-F0-9]{40}$/.test(val), {
        message: "Invalid crypto address format"
      })
      .optional()
  }),

  // Wallet address validation
  walletAddress: z.string()
    .refine(val => /^0x[a-fA-F0-9]{40}$/.test(val), {
      message: "Invalid wallet address format"
    }),

  // Generic text inputs
  safeText: z.string()
    .trim()
    .max(10000, "Text too long")
    .refine(val => !/<script|javascript:|data:|vbscript:|onload|onerror/i.test(val), {
      message: "Invalid content detected"
    }),

  // URL validation for external links
  externalUrl: z.string()
    .url("Invalid URL")
    .refine(val => /^https?:\/\//.test(val), {
      message: "Only HTTP/HTTPS URLs allowed"
    })
    .refine(val => !val.includes('javascript:'), {
      message: "Invalid URL protocol"
    })
};

// Utility function to validate and sanitize inputs
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.issues.map(e => e.message).join(', ')
      };
    }
    return { success: false, error: 'Validation failed' };
  }
};

// Sanitize text for display (additional safety layer)
export const sanitizeForDisplay = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
};

// Rate limiting for API calls
export class RateLimiter {
  private calls: Map<string, number[]> = new Map();

  canMakeCall(key: string, maxCalls: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.calls.has(key)) {
      this.calls.set(key, []);
    }
    
    const callTimes = this.calls.get(key)!;
    
    // Remove old calls outside the window
    while (callTimes.length > 0 && callTimes[0] < windowStart) {
      callTimes.shift();
    }
    
    if (callTimes.length >= maxCalls) {
      return false;
    }
    
    callTimes.push(now);
    return true;
  }
}

export const apiRateLimiter = new RateLimiter();