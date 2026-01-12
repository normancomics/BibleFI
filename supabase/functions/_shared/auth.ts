import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Shared authentication and rate limiting utilities for edge functions
 */

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// In-memory rate limiting store (resets on function cold start)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if request is within rate limits
 * @param identifier - IP address or user ID
 * @param maxRequests - Maximum requests allowed in window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const limit = rateLimits.get(identifier);
  
  // Clean up old entries periodically
  if (rateLimits.size > 10000) {
    for (const [key, value] of rateLimits.entries()) {
      if (now > value.resetAt) {
        rateLimits.delete(key);
      }
    }
  }
  
  if (!limit || now > limit.resetAt) {
    rateLimits.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  
  if (limit.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: limit.resetAt };
  }
  
  limit.count++;
  return { allowed: true, remaining: maxRequests - limit.count, resetAt: limit.resetAt };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

/**
 * Validate input against common injection patterns
 */
export function validateInput(input: string, options: {
  maxLength?: number;
  allowedPattern?: RegExp;
  fieldName?: string;
} = {}): { valid: boolean; error?: string } {
  const { 
    maxLength = 500, 
    allowedPattern = /^[a-zA-Z0-9\s\-,.'!?@#$%&*()]+$/,
    fieldName = 'Input'
  } = options;
  
  if (!input || typeof input !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (input.length > maxLength) {
    return { valid: false, error: `${fieldName} exceeds maximum length of ${maxLength}` };
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE|OR|AND)\b.*[;'"])/i;
  if (sqlPatterns.test(input)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }
  
  // Check for script injection
  const scriptPatterns = /<script|javascript:|on\w+\s*=/i;
  if (scriptPatterns.test(input)) {
    return { valid: false, error: `${fieldName} contains invalid content` };
  }
  
  return { valid: true };
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 * Does not reject unauthenticated requests
 */
export async function getOptionalUser(req: Request): Promise<{
  user: { id: string; email?: string } | null;
  error?: string;
}> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return { user: null };
    }
    
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return { user: null };
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null };
    }
    
    return { user: { id: user.id, email: user.email } };
  } catch (error) {
    console.error('Auth check error:', error);
    return { user: null };
  }
}

/**
 * Required authentication - rejects unauthenticated requests
 */
export async function requireAuth(req: Request): Promise<{
  user: { id: string; email?: string };
  error?: string;
}> {
  const result = await getOptionalUser(req);
  
  if (!result.user) {
    throw new Error('Authentication required');
  }
  
  return { user: result.user };
}

/**
 * Create standard error response
 */
export function errorResponse(
  message: string, 
  status: number = 400,
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(
  resetAt: number,
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded', 
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000) 
    }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString()
      } 
    }
  );
}
