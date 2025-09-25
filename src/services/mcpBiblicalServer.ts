import { supabase } from '@/integrations/supabase/client';

export interface MCPBiblicalTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface BiblicalQuery {
  query: string;
  context?: {
    topic?: 'tithing' | 'taxes' | 'lending' | 'borrowing' | 'business' | 'giving' | 'stewardship';
    includeOriginalLanguages?: boolean;
    versions?: ('kjv' | 'hebrew' | 'greek' | 'aramaic')[];
  };
}

export interface BiblicalResponse {
  answer: string;
  scriptures: {
    reference: string;
    kjv_text: string;
    hebrew_text?: string;
    greek_text?: string;
    aramaic_text?: string;
    original_words?: {
      word: string;
      strong_number?: string;
      meaning: string;
      transliteration?: string;
    }[];
    financial_principle: string;
    modern_application: string;
  }[];
  guidance: {
    primary_principle: string;
    biblical_precedent: string;
    practical_steps: string[];
    warnings?: string[];
  };
  related_topics: string[];
}

export class MCPBiblicalServer {
  private static instance: MCPBiblicalServer;
  
  public static getInstance(): MCPBiblicalServer {
    if (!MCPBiblicalServer.instance) {
      MCPBiblicalServer.instance = new MCPBiblicalServer();
    }
    return MCPBiblicalServer.instance;
  }

  private tools: MCPBiblicalTool[] = [
    {
      name: 'search_biblical_financial_wisdom',
      description: 'Search for biblical guidance on financial matters with original language support',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The financial question or topic to search for'
          },
          topic: {
            type: 'string',
            enum: ['tithing', 'taxes', 'lending', 'borrowing', 'business', 'giving', 'stewardship'],
            description: 'The specific financial topic category'
          },
          includeOriginalLanguages: {
            type: 'boolean',
            description: 'Include Hebrew, Greek, and Aramaic original texts'
          },
          versions: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['kjv', 'hebrew', 'greek', 'aramaic']
            },
            description: 'Bible versions to include in response'
          }
        },
        required: ['query']
      }
    },
    {
      name: 'get_tithing_guidance',
      description: 'Get specific biblical guidance on tithing and giving',
      inputSchema: {
        type: 'object',
        properties: {
          situation: {
            type: 'string',
            description: 'Specific tithing situation or question'
          },
          income_type: {
            type: 'string',
            enum: ['salary', 'business', 'investment', 'gifts', 'inheritance'],
            description: 'Type of income for tithing calculation'
          }
        },
        required: ['situation']
      }
    },
    {
      name: 'get_business_partnership_guidance',
      description: 'Get biblical guidance on business partnerships and relationships',
      inputSchema: {
        type: 'object',
        properties: {
          partnership_type: {
            type: 'string',
            enum: ['family', 'christian', 'non_christian', 'mixed_faith'],
            description: 'Type of business partnership being considered'
          },
          business_nature: {
            type: 'string',
            description: 'Nature of the business or partnership'
          }
        },
        required: ['partnership_type']
      }
    },
    {
      name: 'get_tax_guidance',
      description: 'Get biblical guidance on taxes and civic financial obligations',
      inputSchema: {
        type: 'object',
        properties: {
          tax_situation: {
            type: 'string',
            description: 'Specific tax situation or question'
          },
          jurisdiction: {
            type: 'string',
            description: 'Country or jurisdiction for context'
          }
        },
        required: ['tax_situation']
      }
    }
  ];

  public getAvailableTools(): MCPBiblicalTool[] {
    return this.tools;
  }

  public async callTool(toolName: string, params: any): Promise<BiblicalResponse> {
    switch (toolName) {
      case 'search_biblical_financial_wisdom':
        return this.searchBiblicalWisdom(params);
      case 'get_tithing_guidance':
        return this.getTithingGuidance(params);
      case 'get_business_partnership_guidance':
        return this.getBusinessPartnershipGuidance(params);
      case 'get_tax_guidance':
        return this.getTaxGuidance(params);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async searchBiblicalWisdom(params: BiblicalQuery): Promise<BiblicalResponse> {
    try {
      // Call Supabase edge function for biblical wisdom search
      const { data, error } = await supabase.functions.invoke('biblical-advisor', {
        body: {
          query: params.query,
          context: params.context,
          includeOriginalLanguages: params.context?.includeOriginalLanguages || false,
          versions: params.context?.versions || ['kjv']
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching biblical wisdom:', error);
      throw new Error('Failed to search biblical wisdom');
    }
  }

  private async getTithingGuidance(params: any): Promise<BiblicalResponse> {
    const tithingQuery = `Biblical guidance on tithing: ${params.situation}${params.income_type ? ` for ${params.income_type} income` : ''}`;
    
    return this.searchBiblicalWisdom({
      query: tithingQuery,
      context: {
        topic: 'tithing',
        includeOriginalLanguages: true,
        versions: ['kjv', 'hebrew', 'greek']
      }
    });
  }

  private async getBusinessPartnershipGuidance(params: any): Promise<BiblicalResponse> {
    const businessQuery = `Biblical guidance on business partnerships with ${params.partnership_type} partners${params.business_nature ? ` in ${params.business_nature}` : ''}`;
    
    return this.searchBiblicalWisdom({
      query: businessQuery,
      context: {
        topic: 'business',
        includeOriginalLanguages: true,
        versions: ['kjv', 'hebrew', 'greek']
      }
    });
  }

  private async getTaxGuidance(params: any): Promise<BiblicalResponse> {
    const taxQuery = `Biblical guidance on taxes and civic obligations: ${params.tax_situation}${params.jurisdiction ? ` in ${params.jurisdiction}` : ''}`;
    
    return this.searchBiblicalWisdom({
      query: taxQuery,
      context: {
        topic: 'taxes',
        includeOriginalLanguages: true,
        versions: ['kjv', 'hebrew', 'greek', 'aramaic']
      }
    });
  }
}

export const mcpBiblicalServer = MCPBiblicalServer.getInstance();