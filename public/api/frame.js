
// Server-side API endpoint for Farcaster Frames
// This file will be served at /api/frame when deployed

// Configuration constants
const APP_NAME = "Bible.fi";
const APP_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://bible.fi';

// Biblical wisdom quotes for responses
const WISDOM_QUOTES = [
  "The wise store up choice food and olive oil, but fools gulp theirs down. - Proverbs 21:20",
  "Dishonest money dwindles away, but whoever gathers money little by little makes it grow. - Proverbs 13:11",
  "The rich rule over the poor, and the borrower is slave to the lender. - Proverbs 22:7",
  "Honor the Lord with your wealth, with the firstfruits of all your crops. - Proverbs 3:9",
  "Give, and it will be given to you. - Luke 6:38",
  "Whoever can be trusted with very little can also be trusted with much. - Luke 16:10"
];

// DeFi related quotes
const DEFI_QUOTES = [
  "The borrower is servant to the lender, choose your DeFi protocols wisely. - Proverbs 22:7",
  "Invest your talents wisely, for to everyone who has, more will be given. - Matthew 25:29",
  "Diversify your investments: divide your portion to seven, or even to eight. - Ecclesiastes 11:2"
];

// Character images for responses
const CHARACTER_IMAGES = [
  "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
  "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png",
  "/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png"
];

/**
 * Validates a Farcaster Frame signature
 * In a production environment, this would verify the message using the Farcaster API
 * @param {Object} request - The incoming request
 * @returns {boolean} Whether the signature is valid
 */
function validateFrameSignature(request) {
  // For demo purposes, we're accepting all requests
  // In production, you would verify using Farcaster's signature validation
  // https://docs.farcaster.xyz/reference/frames/message-signing
  return true;
}

/**
 * Handles Frame requests
 * @param {Request} request - The incoming request
 * @returns {Object} Frame response
 */
function handleFrameRequest(request) {
  try {
    // Parse the request
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);
    const buttonIndex = parseInt(params.get('buttonIndex') || '0');
    const fidString = params.get('fid') || '';
    const messageHash = params.get('messageHash') || '';
    
    // In production, validate the Farcaster message signature
    const isValid = validateFrameSignature(request);
    if (!isValid) {
      return createErrorResponse("Invalid signature");
    }
    
    // Process based on button index
    if (buttonIndex === 3) { // Share Wisdom button
      const randomQuoteIndex = Math.floor(Math.random() * WISDOM_QUOTES.length);
      const randomImageIndex = Math.floor(Math.random() * CHARACTER_IMAGES.length);
      
      return {
        version: 'vNext',
        image: `${APP_BASE_URL}${CHARACTER_IMAGES[randomImageIndex]}`,
        text: WISDOM_QUOTES[randomQuoteIndex],
        buttons: [
          { label: "More Wisdom", action: "post" },
          { label: "Visit Bible.fi", action: "link", target: APP_BASE_URL }
        ]
      };
    } else if (buttonIndex === 2) { // DeFi button
      const randomQuoteIndex = Math.floor(Math.random() * DEFI_QUOTES.length);
      
      return {
        version: 'vNext',
        image: `${APP_BASE_URL}/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png`,
        text: DEFI_QUOTES[randomQuoteIndex],
        buttons: [
          { label: "Swap Tokens", action: "link", target: `${APP_BASE_URL}/defi` },
          { label: "Learn More", action: "link", target: `${APP_BASE_URL}/wisdom` }
        ]
      };
    } else if (buttonIndex === 1) { // Wisdom button - just redirect
      return {
        version: 'vNext',
        image: `${APP_BASE_URL}/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png`,
        text: "Discover biblical wisdom for your financial journey on Bible.fi",
        buttons: [
          { label: "Explore Wisdom", action: "link", target: `${APP_BASE_URL}/wisdom` },
          { label: "Share Wisdom", action: "post" }
        ]
      };
    }
    
    // Default response for initial load or unknown button
    return {
      version: 'vNext',
      image: `${APP_BASE_URL}/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png`,
      text: "Biblical wisdom for your financial journey",
      buttons: [
        { label: "Biblical Wisdom", action: "link", target: `${APP_BASE_URL}/wisdom` },
        { label: "DeFi Swaps", action: "link", target: `${APP_BASE_URL}/defi` },
        { label: "Share Wisdom", action: "post" }
      ]
    };
  } catch (error) {
    console.error('Error in frame handler:', error);
    
    // Default fallback response on error
    return createErrorResponse("Something went wrong. Please try again.");
  }
}

/**
 * Creates an error response
 * @param {string} message - Error message
 * @returns {Object} Error response
 */
function createErrorResponse(message) {
  return {
    version: 'vNext',
    image: `${APP_BASE_URL}/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png`,
    text: message,
    buttons: [
      { label: "Try Again", action: "post" }
    ]
  };
}

// Check if we're in a browser context or server context
if (typeof window !== 'undefined') {
  // Browser context - expose for use in the client-side
  window.handleFrameRequest = handleFrameRequest;
} else {
  // Server context - export for use in server-side
  module.exports = { handleFrameRequest };
}
