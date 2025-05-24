
import { FARCASTER_CONFIG, APP_CONFIG } from '@/farcaster/config';

// Types for Farcaster Frame configuration
export interface FrameConfig {
  image: string;
  buttons: Array<{
    label: string;
    action: 'link' | 'post' | 'mint' | 'tx';
    target?: string;
  }>;
  postUrl?: string;
  state?: string;
}

/**
 * Generate HTML for a Farcaster Frame
 * @param config Frame configuration
 * @returns HTML string for the frame
 */
export const generateFrameHTML = (config: FrameConfig): string => {
  const { image, buttons, postUrl, state } = config;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bible.fi Frame</title>
  
  <!-- Farcaster Frame Meta Tags -->
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${image}">
  <meta property="og:image" content="${image}">
`;

  // Add button tags
  buttons.forEach((button, index) => {
    html += `  <meta property="fc:frame:button:${index + 1}" content="${button.label}">\n`;
    
    if (button.action) {
      html += `  <meta property="fc:frame:button:${index + 1}:action" content="${button.action}">\n`;
    }
    
    if (button.target) {
      html += `  <meta property="fc:frame:button:${index + 1}:target" content="${button.target}">\n`;
    }
  });

  // Add post URL if provided
  if (postUrl) {
    html += `  <meta property="fc:frame:post_url" content="${postUrl}">\n`;
  }

  // Add state if provided
  if (state) {
    html += `  <meta property="fc:frame:state" content="${state}">\n`;
  }

  html += `
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="Bible.fi - Biblical Finance on Base Chain">
  <meta property="og:description" content="Discover biblical wisdom for your financial journey">
  <meta property="og:type" content="website">
</head>
<body style="margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <div style="text-align: center; color: white; font-family: system-ui, sans-serif;">
    <h1 style="color: gold;">Bible.fi Frame</h1>
    <p>This HTML is meant to be embedded as a Farcaster Frame.</p>
    <p>Visit <a href="https://bible.fi" style="color: gold; text-decoration: none;">Bible.fi</a> to explore biblical financial wisdom.</p>
  </div>
</body>
</html>`;

  return html;
};

/**
 * Generate a Base64 encoded state parameter for frames
 * @param data State data to encode
 * @returns Base64 encoded state string
 */
export const generateFrameState = (data: Record<string, any>): string => {
  return btoa(JSON.stringify(data));
};

/**
 * Parse a Frame state parameter
 * @param state Base64 encoded state string
 * @returns Decoded state object
 */
export const parseFrameState = (state: string): Record<string, any> => {
  try {
    return JSON.parse(atob(state));
  } catch (e) {
    console.error("Failed to parse frame state:", e);
    return {};
  }
};

/**
 * Generate a shareable Farcaster cast URL with embedded frame
 * @param text Text content for the cast
 * @param frameUrl URL to the frame HTML
 * @returns Warpcast compose URL
 */
export const generateFarcasterShareUrl = (text: string, frameUrl: string): string => {
  const encodedText = encodeURIComponent(text);
  const encodedFrameUrl = encodeURIComponent(frameUrl);
  return `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedFrameUrl}`;
};

/**
 * Client for interacting with Farcaster through mini-apps
 */
export class FarcasterClient {
  /**
   * Generate a verse sharing frame for Farcaster
   * @param verse Bible verse text
   * @param reference Bible reference
   * @returns Frame HTML for sharing
   */
  public generateVerseFrame(verse: string, reference: string): string {
    return generateFrameHTML({
      image: `${window.location.origin}/api/verse-image?verse=${encodeURIComponent(verse)}&reference=${encodeURIComponent(reference)}`,
      buttons: [
        { label: "Get More Wisdom", action: "link", target: `${window.location.origin}/wisdom` },
        { label: "Share This Verse", action: "post" },
        { label: "Open Bible.fi", action: "link", target: window.location.origin },
      ],
      postUrl: `${window.location.origin}/api/share-verse`,
      state: generateFrameState({ verse, reference })
    });
  }
  
  /**
   * Generate a tithing frame for Farcaster
   * @param church Church name
   * @param amount Donation amount
   * @param token Token symbol
   * @returns Frame HTML for sharing
   */
  public generateTithingFrame(church: string, amount: string, token: string): string {
    return generateFrameHTML({
      image: `${window.location.origin}/api/tithe-image?church=${encodeURIComponent(church)}&amount=${amount}&token=${token}`,
      buttons: [
        { label: "Tithe Now", action: "link", target: `${window.location.origin}/tithe` },
        { label: "Learn Biblical Finance", action: "link", target: `${window.location.origin}/wisdom` },
        { label: "Share Your Tithing", action: "post" },
      ],
      postUrl: `${window.location.origin}/api/share-tithe`,
      state: generateFrameState({ church, amount, token })
    });
  }
  
  /**
   * Generate a financial wisdom score frame for Farcaster
   * @param score Wisdom score (0-100)
   * @param strengths Array of financial strengths
   * @param verse Bible verse for guidance
   * @returns Frame HTML for sharing
   */
  public generateWisdomScoreFrame(score: number, strengths: string[], verse: string): string {
    return generateFrameHTML({
      image: `${window.location.origin}/api/wisdom-score?score=${score}&strengths=${encodeURIComponent(strengths.join(','))}&verse=${encodeURIComponent(verse)}`,
      buttons: [
        { label: "Get Your Wisdom Score", action: "link", target: `${window.location.origin}/wisdom` },
        { label: "Apply Biblical Finance", action: "link", target: `${window.location.origin}/defi` },
        { label: "Share Your Score", action: "post" },
      ],
      postUrl: `${window.location.origin}/api/share-wisdom-score`,
      state: generateFrameState({ score, strengths, verse })
    });
  }
  
  /**
   * Generate the default Bible.fi mini-app frame
   * @returns Frame HTML
   */
  public generateDefaultFrame(): string {
    return generateFrameHTML({
      image: APP_CONFIG.icon,
      buttons: FARCASTER_CONFIG.frameConfig.buttons.map(btn => ({
        label: btn.label,
        action: btn.action as "link" | "post" | "mint" | "tx",
        target: btn.target
      })),
      postUrl: FARCASTER_CONFIG.frameConfig.postUrl,
      state: generateFrameState({ referrer: "default-frame" })
    });
  }
  
  /**
   * Generate a shareable message with a verse
   * @param verse Bible verse text
   * @param reference Bible reference
   * @returns Shareable URL for Warpcast
   */
  public generateVerseSharingUrl(verse: string, reference: string): string {
    const text = `"${verse}" - ${reference}\n\nBiblical wisdom from Bible.fi`;
    const frameUrl = `${window.location.origin}/frame.html?verse=${encodeURIComponent(verse)}&reference=${encodeURIComponent(reference)}`;
    
    return generateFarcasterShareUrl(text, frameUrl);
  }
}

export const farcasterClient = new FarcasterClient();
export default farcasterClient;
