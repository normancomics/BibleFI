 // Talent Protocol API Integration
 // Used for builder scores, credentials, and passport data
 
 const TALENT_API_BASE = 'https://api.talentprotocol.com';
 
 export interface TalentPassport {
   passport_id: number;
   score: number;
   passport_profile: {
     name: string;
     bio: string;
     image_url: string;
     location: string;
   };
   verified_wallets: string[];
   credentials_count: number;
   calculating_score: boolean;
 }
 
 export interface BuilderScore {
   score: number;
   last_calculated_at: string;
   points_breakdown: {
     identity: number;
     skills: number;
     activity: number;
     humanity: number;
   };
 }
 
 export interface TalentCredential {
   id: string;
   name: string;
   category: string;
   value: string;
   last_calculated_at: string;
   max_score: number;
   score: number;
 }
 
 /**
  * Get builder passport by wallet address
  */
 export async function getPassportByWallet(
   walletAddress: string,
   apiKey: string
 ): Promise<TalentPassport | null> {
   try {
     const response = await fetch(
       `${TALENT_API_BASE}/api/v2/passports/${walletAddress}`,
       {
         headers: {
           'X-API-KEY': apiKey,
           'Content-Type': 'application/json',
         },
       }
     );
 
     if (!response.ok) {
       if (response.status === 404) return null;
       throw new Error(`Talent API error: ${response.status}`);
     }
 
     const data = await response.json();
     return data.passport;
   } catch (error) {
     console.error('Error fetching Talent passport:', error);
     return null;
   }
 }
 
 /**
  * Get builder score for a wallet
  */
 export async function getBuilderScore(
   walletAddress: string,
   apiKey: string
 ): Promise<BuilderScore | null> {
   try {
     const passport = await getPassportByWallet(walletAddress, apiKey);
     if (!passport) return null;
 
     return {
       score: passport.score,
       last_calculated_at: new Date().toISOString(),
       points_breakdown: {
         identity: Math.round(passport.score * 0.25),
         skills: Math.round(passport.score * 0.30),
         activity: Math.round(passport.score * 0.25),
         humanity: Math.round(passport.score * 0.20),
       },
     };
   } catch (error) {
     console.error('Error fetching builder score:', error);
     return null;
   }
 }
 
 /**
  * Get credentials for a passport
  */
 export async function getCredentials(
   passportId: number,
   apiKey: string
 ): Promise<TalentCredential[]> {
   try {
     const response = await fetch(
       `${TALENT_API_BASE}/api/v2/passport_credentials?passport_id=${passportId}`,
       {
         headers: {
           'X-API-KEY': apiKey,
           'Content-Type': 'application/json',
         },
       }
     );
 
     if (!response.ok) {
       throw new Error(`Talent API error: ${response.status}`);
     }
 
     const data = await response.json();
     return data.passport_credentials || [];
   } catch (error) {
     console.error('Error fetching credentials:', error);
     return [];
   }
 }
 
 /**
  * Check if wallet is a verified builder (score > 50)
  */
 export async function isVerifiedBuilder(
   walletAddress: string,
   apiKey: string
 ): Promise<boolean> {
   const passport = await getPassportByWallet(walletAddress, apiKey);
   return passport !== null && passport.score >= 50;
 }
 
 /**
  * Get BibleFi-specific builder tier based on Talent score
  */
 export function getBuilderTier(score: number): {
   tier: 'Novice' | 'Apprentice' | 'Journeyman' | 'Master' | 'Grandmaster';
   multiplier: number;
   description: string;
 } {
   if (score >= 90) {
     return {
       tier: 'Grandmaster',
       multiplier: 2.0,
       description: 'Elite builder with exceptional on-chain reputation',
     };
   } else if (score >= 70) {
     return {
       tier: 'Master',
       multiplier: 1.75,
       description: 'Proven builder with strong credentials',
     };
   } else if (score >= 50) {
     return {
       tier: 'Journeyman',
       multiplier: 1.5,
       description: 'Verified builder with solid track record',
     };
   } else if (score >= 25) {
     return {
       tier: 'Apprentice',
       multiplier: 1.25,
       description: 'Emerging builder developing reputation',
     };
   }
   return {
     tier: 'Novice',
     multiplier: 1.0,
     description: 'New to the ecosystem',
   };
 }