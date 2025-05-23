
import { BiblicalPrinciple, FinancialGuidanceRequest, FinancialGuidanceResponse } from "@/types/wisdom";
import { getRandomVerse } from "@/data/bibleVerses";
import { supabase } from "@/integrations/supabase/client";

// This will be expanded later with actual AI integration
// For now it uses pre-defined principles and local data
export async function getBiblicalFinancialGuidance(
  request: FinancialGuidanceRequest
): Promise<FinancialGuidanceResponse> {
  try {
    // In production, this would call an edge function with the Eliza0S integration
    // For now, we'll use local logic to simulate the response
    
    // Search for relevant principles based on query
    const keywords = extractKeywords(request.query);
    const principles = await getRelevantPrinciples(keywords);
    
    // Generate response
    const response: FinancialGuidanceResponse = {
      answer: generateWisdomResponse(request.query, principles),
      relevantScriptures: principles.slice(0, 3).map(p => ({
        reference: p.reference,
        text: p.verse
      }))
    };
    
    // Add DeFi suggestions if applicable
    if (request.query.toLowerCase().includes("invest") || 
        request.query.toLowerCase().includes("defi") ||
        request.query.toLowerCase().includes("yield")) {
      response.defiSuggestions = getBiblicalDefiSuggestions(request.query);
    }
    
    return response;
  } catch (error) {
    console.error("Error getting biblical financial guidance:", error);
    // Fallback to a default wisdom verse
    const fallbackVerse = getRandomVerse();
    return {
      answer: "I'm sorry, I couldn't process your request. Here's some biblical wisdom that might help guide you:",
      relevantScriptures: [{
        reference: fallbackVerse.reference,
        text: fallbackVerse.text
      }]
    };
  }
}

function extractKeywords(query: string): string[] {
  // Simple keyword extraction
  const stopWords = ["a", "the", "is", "are", "how", "can", "should", "would", "i", "my"];
  return query
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
}

async function getRelevantPrinciples(keywords: string[]): Promise<BiblicalPrinciple[]> {
  // In production this would query the database
  // For now, return hardcoded principles that match keywords
  
  const allPrinciples = getBiblicalFinancialPrinciples();
  
  if (keywords.length === 0) {
    return allPrinciples.slice(0, 3);
  }
  
  // Simple ranking based on keyword matches
  const scoredPrinciples = allPrinciples.map(principle => {
    const principleText = `${principle.verse} ${principle.principle} ${principle.application}`.toLowerCase();
    const score = keywords.reduce((count, keyword) => {
      return principleText.includes(keyword) ? count + 1 : count;
    }, 0);
    return { principle, score };
  });
  
  // Sort by score and return top principles
  return scoredPrinciples
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.principle);
}

function generateWisdomResponse(query: string, principles: BiblicalPrinciple[]): string {
  if (principles.length === 0) {
    return "The Bible offers wisdom on financial matters. Consider praying for guidance and studying scriptures on stewardship and generosity.";
  }
  
  // Extract the top principle
  const topPrinciple = principles[0];
  
  // Generate a response based on the query and principles
  if (query.toLowerCase().includes("tithe") || query.toLowerCase().includes("giving")) {
    return `The Bible teaches us about faithful giving through tithing. ${topPrinciple.principle} As ${topPrinciple.reference} reminds us, "${topPrinciple.verse}" In application, ${topPrinciple.application}`;
  }
  
  if (query.toLowerCase().includes("invest") || query.toLowerCase().includes("saving")) {
    return `Biblical wisdom on investing encourages prudence and long-term thinking. ${topPrinciple.principle} As we read in ${topPrinciple.reference}, "${topPrinciple.verse}" This suggests ${topPrinciple.application}`;
  }
  
  if (query.toLowerCase().includes("debt") || query.toLowerCase().includes("borrow")) {
    return `The Bible cautions us about debt. ${topPrinciple.principle} As ${topPrinciple.reference} states, "${topPrinciple.verse}" Consider ${topPrinciple.application}`;
  }
  
  // Default response
  return `${topPrinciple.principle} As written in ${topPrinciple.reference}, "${topPrinciple.verse}" This scripture teaches us ${topPrinciple.application}`;
}

function getBiblicalDefiSuggestions(query: string): FinancialGuidanceResponse['defiSuggestions'] {
  // Map biblical principles to DeFi concepts
  const suggestions = [
    {
      protocol: "Talents Pool",
      action: "Consider staking in stable assets for steady growth",
      rationale: "Based on Matthew 25:14-30, faithful stewardship multiplies resources"
    },
    {
      protocol: "Widow's Mite Lending",
      action: "Participate in community lending with modest amounts",
      rationale: "Inspired by Mark 12:41-44, where small gifts given faithfully are honored"
    },
    {
      protocol: "Hundredfold Harvest",
      action: "Provide liquidity to ethical projects for potential yield",
      rationale: "Following Matthew 13:23, good ground yields abundant fruit"
    }
  ];
  
  // Return 1-2 relevant suggestions based on query
  if (query.toLowerCase().includes("safe") || query.toLowerCase().includes("stable")) {
    return [suggestions[0]];
  } else if (query.toLowerCase().includes("community") || query.toLowerCase().includes("help")) {
    return [suggestions[1]];
  } else if (query.toLowerCase().includes("yield") || query.toLowerCase().includes("growth")) {
    return [suggestions[2], suggestions[0]];
  }
  
  // Default to first suggestion
  return [suggestions[0]];
}

export function getBiblicalFinancialPrinciples(): BiblicalPrinciple[] {
  return [
    {
      id: "principle-1",
      verse: "Honor the LORD with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing, and your vats will brim over with new wine.",
      reference: "Proverbs 3:9-10",
      principle: "Prioritize giving to God first",
      application: "Set aside a portion for tithing before other expenses",
      defiRelevance: "Automate tithing through recurring payments or streams"
    },
    {
      id: "principle-2",
      verse: "The rich rule over the poor, and the borrower is slave to the lender.",
      reference: "Proverbs 22:7",
      principle: "Avoid unnecessary debt",
      application: "Build emergency funds before lending, use credit wisely",
      defiRelevance: "Use DeFi lending cautiously, focus on sustainable yields"
    },
    {
      id: "principle-3",
      verse: "For which of you, desiring to build a tower, does not first sit down and count the cost, whether he has enough to complete it?",
      reference: "Luke 14:28",
      principle: "Plan and budget carefully",
      application: "Create detailed financial plans before major decisions",
      defiRelevance: "Research protocols thoroughly before investing"
    },
    {
      id: "principle-4",
      verse: "Dishonest money dwindles away, but whoever gathers money little by little makes it grow.",
      reference: "Proverbs 13:11",
      principle: "Build wealth gradually through honest work",
      application: "Focus on consistent saving and ethical investing",
      defiRelevance: "Choose sustainable yield farming over high-risk schemes"
    },
    {
      id: "principle-5",
      verse: "Suppose one of you has a hundred sheep and loses one of them. Doesn't he leave the ninety-nine in the open country and go after the lost sheep until he finds it?",
      reference: "Luke 15:4",
      principle: "Be diligent about accounting for all resources",
      application: "Track expenses and investments carefully",
      defiRelevance: "Use portfolio tracking tools to monitor investments"
    },
    {
      id: "principle-6",
      verse: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
      reference: "2 Corinthians 9:7",
      principle: "Give generously with the right attitude",
      application: "Develop a giving plan that brings joy",
      defiRelevance: "Stream donations to ministries through recurring payments"
    },
    {
      id: "principle-7",
      verse: "Cast your bread upon the waters, for you will find it after many days. Give a portion to seven, or even to eight, for you know not what disaster may happen on earth.",
      reference: "Ecclesiastes 11:1-2",
      principle: "Diversify investments",
      application: "Don't put all your resources in one place",
      defiRelevance: "Spread investments across multiple protocols and asset types"
    },
    {
      id: "principle-8",
      verse: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
      reference: "Matthew 6:33",
      principle: "Prioritize spiritual growth over material wealth",
      application: "Make financial decisions that align with godly values",
      defiRelevance: "Choose ethical investments that support worthy causes"
    },
    {
      id: "principle-9",
      verse: "Whoever can be trusted with very little can also be trusted with much, and whoever is dishonest with very little will also be dishonest with much.",
      reference: "Luke 16:10",
      principle: "Practice faithfulness with small amounts",
      application: "Develop good habits regardless of income level",
      defiRelevance: "Start with small positions to learn protocols before scaling up"
    },
    {
      id: "principle-10",
      verse: "The wise store up choice food and olive oil, but fools gulp theirs down.",
      reference: "Proverbs 21:20",
      principle: "Save for the future",
      application: "Build reserves rather than consuming everything immediately",
      defiRelevance: "Allocate portions of yield to long-term storage assets"
    }
  ];
}
