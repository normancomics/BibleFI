
// This file handles integration with Senpi.ai
// Documentation: https://senpi.ai/docs

// Senpi.ai API endpoints
const SENPI_API_BASE_URL = "https://api.senpi.ai/v1";

interface SenpiRequestOptions {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  apiKey: string;
}

// Generic Senpi API request function
export async function senpiRequest<T>({
  endpoint,
  method = "GET",
  body,
  apiKey,
}: SenpiRequestOptions): Promise<T> {
  try {
    const url = `${SENPI_API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };
    
    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "An error occurred with the Senpi.ai API");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Senpi.ai API error:", error);
    throw error;
  }
}

// Example function for Senpi AI integration
// This would be replaced with actual Senpi.ai functionality
export async function generateBiblicalFinancialAdvice(prompt: string, apiKey: string) {
  return senpiRequest({
    endpoint: "/generate",
    method: "POST",
    body: {
      prompt: `Generate biblical financial advice about: ${prompt}`,
      max_tokens: 1000,
    },
    apiKey,
  });
}

// Function to analyze sentiment of financial text
export async function analyzeBiblicalSentiment(text: string, apiKey: string) {
  return senpiRequest({
    endpoint: "/analyze",
    method: "POST",
    body: {
      text,
      analysis_type: "sentiment",
    },
    apiKey,
  });
}

// Placeholder for Senpi configuration
export const senpiConfig = {
  configured: false,
  setApiKey: (apiKey: string) => {
    // In a real app, this would securely store the API key
    console.log("Senpi.ai API key configured");
    senpiConfig.configured = true;
    return true;
  }
};
