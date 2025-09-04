
import { supabase } from "@/integrations/supabase/client";
import { searchBiblicalKnowledge, getBiblicalFinancialGuidance } from "./biblicalAdvisorService";
import { offlineBiblicalService } from "./offlineBiblicalService";

interface RAGResponse {
  answer: string;
  relevantScriptures: Array<{
    reference: string;
    text: string;
    similarity: number;
  }>;
  biblicalPrinciples: string[];
}

interface MCPContextData {
  walletAddress?: string;
  chainId?: number;
  tokenBalances?: Record<string, string>;
  defiPositions?: Array<{
    protocol: string;
    position: string;
    value: string;
  }>;
}

export class EnhancedBiblicalAdvisorService {
  private readonly OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
  private readonly MCP_ENABLED = true; // Enable Model Context Protocol features
  
  /**
   * Enhanced biblical advice with RAG (Retrieval Augmented Generation)
   */
  public async getEnhancedBiblicalAdvice(
    query: string,
    context?: MCPContextData
  ): Promise<RAGResponse> {
    try {
      // Try online biblical knowledge first
      let biblicalKnowledge: any[] = [];
      let useOfflineMode = false;
      
      try {
        biblicalKnowledge = await searchBiblicalKnowledge(query);
        if (biblicalKnowledge.length === 0) {
          useOfflineMode = true;
        }
      } catch (error) {
        console.log("Online biblical service unavailable, using offline mode");
        useOfflineMode = true;
      }
      
      // Use offline service if online fails or returns no results
      if (useOfflineMode) {
        const offlineResponse = offlineBiblicalService.getBiblicalGuidance(query);
        return {
          answer: offlineResponse.answer + "\n\n*Note: Using offline biblical knowledge base.*",
          relevantScriptures: offlineResponse.relevantScriptures,
          biblicalPrinciples: offlineResponse.biblicalPrinciples
        };
      }
      
      // Proceed with online response
      const traditionalGuidance = await getBiblicalFinancialGuidance({
        query,
        context: {
          walletBalance: context?.tokenBalances?.USDC || '0',
          previousTithes: 0
        }
      });
      
      let enhancedAnswer = traditionalGuidance.answer;
      let biblicalPrinciples: string[] = [];
      
      if (this.MCP_ENABLED && context) {
        const mcpEnhancedResponse = await this.getMCPEnhancedAdvice(query, biblicalKnowledge, context);
        enhancedAnswer = mcpEnhancedResponse.answer;
        biblicalPrinciples = mcpEnhancedResponse.principles;
      } else {
        biblicalPrinciples = biblicalKnowledge
          .map(item => item.principle)
          .filter(Boolean)
          .slice(0, 5);
      }
      
      return {
        answer: enhancedAnswer,
        relevantScriptures: biblicalKnowledge.slice(0, 3).map(item => ({
          reference: item.reference,
          text: item.verse_text,
          similarity: this.calculateSimilarity(query, item.verse_text)
        })),
        biblicalPrinciples
      };
    } catch (error) {
      console.error("Error in enhanced biblical advisor, falling back to offline:", error);
      
      // Ultimate fallback to offline service
      const offlineResponse = offlineBiblicalService.getBiblicalGuidance(query);
      return {
        answer: offlineResponse.answer + "\n\n*Note: Using offline biblical knowledge base due to service error.*",
        relevantScriptures: offlineResponse.relevantScriptures,
        biblicalPrinciples: offlineResponse.biblicalPrinciples
      };
    }
  }
  
  /**
   * MCP-enhanced advice using Model Context Protocol
   */
  private async getMCPEnhancedAdvice(
    query: string,
    biblicalKnowledge: any[],
    context: MCPContextData
  ): Promise<{ answer: string; principles: string[] }> {
    try {
      // Prepare context for MCP
      const mcpContext = this.prepareMCPContext(context, biblicalKnowledge);
      
      // Create enhanced prompt with biblical context
      const systemPrompt = `You are a biblical financial advisor with access to comprehensive scripture knowledge and DeFi context. 
      Provide wise, biblical guidance that incorporates both ancient wisdom and modern financial realities.
      
      Biblical Knowledge Available: ${biblicalKnowledge.length} relevant verses
      User Context: ${JSON.stringify(mcpContext)}
      
      Always ground your advice in scripture and provide practical DeFi applications when appropriate.`;
      
      const userPrompt = `Question: ${query}
      
      Relevant Biblical Passages:
      ${biblicalKnowledge.slice(0, 3).map(item => 
        `${item.reference}: "${item.verse_text}" - ${item.principle || 'Biblical principle'}`
      ).join('\n')}
      
      Please provide comprehensive biblical financial guidance.`;
      
      // This would integrate with OpenAI API or other LLM
      // For now, return enhanced traditional response
      const enhancedAnswer = this.generateEnhancedAnswer(query, biblicalKnowledge, context);
      const principles = this.extractBiblicalPrinciples(biblicalKnowledge);
      
      return {
        answer: enhancedAnswer,
        principles
      };
    } catch (error) {
      console.error("MCP enhancement failed:", error);
      
      // Fallback to traditional approach
      return {
        answer: this.generateTraditionalAnswer(query, biblicalKnowledge),
        principles: ["Faith", "Wisdom", "Stewardship"]
      };
    }
  }
  
  /**
   * Prepare context for Model Context Protocol
   */
  private prepareMCPContext(context: MCPContextData, biblicalKnowledge: any[]): any {
    return {
      wallet: {
        address: context.walletAddress?.substring(0, 6) + "..." + context.walletAddress?.substring(38),
        chain: context.chainId === 8453 ? "Base" : "Unknown",
        balances: context.tokenBalances
      },
      defi: context.defiPositions || [],
      biblicalReferences: biblicalKnowledge.length,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Generate enhanced answer with context awareness
   */
  private generateEnhancedAnswer(query: string, knowledge: any[], context: MCPContextData): string {
    const hasWalletContext = context.walletAddress && context.tokenBalances;
    const primaryVerse = knowledge[0];
    
    let answer = `Based on ${primaryVerse?.reference}: "${primaryVerse?.verse_text}" `;
    
    if (primaryVerse?.principle) {
      answer += `\n\nBiblical Principle: ${primaryVerse.principle}`;
    }
    
    if (hasWalletContext) {
      const usdcBalance = context.tokenBalances?.USDC || '0';
      answer += `\n\nConsidering your current USDC balance of ${usdcBalance}, `;
      
      if (query.toLowerCase().includes('tithe') || query.toLowerCase().includes('give')) {
        answer += `remember that "Each of you should give what you have decided in your heart to give" (2 Corinthians 9:7). Consider setting up a consistent giving pattern through our Superfluid streaming feature.`;
      } else if (query.toLowerCase().includes('invest')) {
        answer += `follow the wisdom of diversification: "Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land" (Ecclesiastes 11:2).`;
      }
    }
    
    if (primaryVerse?.application) {
      answer += `\n\nPractical Application: ${primaryVerse.application}`;
    }
    
    return answer;
  }
  
  /**
   * Extract biblical principles from knowledge base
   */
  private extractBiblicalPrinciples(knowledge: any[]): string[] {
    const principles = knowledge
      .map(item => item.principle)
      .filter(Boolean)
      .slice(0, 5);
    
    // Add default principles if not enough found
    const defaultPrinciples = ["Stewardship", "Generosity", "Wisdom", "Contentment", "Planning"];
    const finalPrinciples = [...new Set([...principles, ...defaultPrinciples])];
    
    return finalPrinciples.slice(0, 5);
  }
  
  /**
   * Generate traditional answer without context
   */
  private generateTraditionalAnswer(query: string, knowledge: any[]): string {
    if (knowledge.length === 0) {
      return "Based on biblical principles, seek wisdom through prayer and study of Scripture. Consider consulting with wise financial advisors and your church community.";
    }
    
    const primaryResult = knowledge[0];
    let answer = `Based on ${primaryResult.reference}: "${primaryResult.verse_text}" `;
    
    if (primaryResult.principle) {
      answer += `\n\nBiblical Principle: ${primaryResult.principle}`;
    }
    
    if (primaryResult.application) {
      answer += `\n\nPractical Application: ${primaryResult.application}`;
    }
    
    return answer;
  }
  
  /**
   * Calculate similarity score between query and text
   */
  private calculateSimilarity(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(' ');
    const textWords = text.toLowerCase().split(' ');
    
    const commonWords = queryWords.filter(word => textWords.includes(word));
    return Math.round((commonWords.length / queryWords.length) * 100) / 100;
  }
}

export const enhancedBiblicalAdvisorService = new EnhancedBiblicalAdvisorService();
