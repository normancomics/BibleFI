
// Static API endpoint for Farcaster Frames
// In production, this should be replaced with a proper serverless function

function handleFrameRequest(request) {
  try {
    // Parse the request
    const params = new URLSearchParams(window.location.search);
    const buttonIndex = parseInt(params.get('buttonIndex') || '0');
    const state = params.get('state') || '';
    
    // Biblical wisdom quotes for responses
    const wisdomQuotes = [
      "The wise store up choice food and olive oil, but fools gulp theirs down. - Proverbs 21:20",
      "Dishonest money dwindles away, but whoever gathers money little by little makes it grow. - Proverbs 13:11",
      "The rich rule over the poor, and the borrower is slave to the lender. - Proverbs 22:7",
      "Honor the Lord with your wealth, with the firstfruits of all your crops. - Proverbs 3:9",
      "Give, and it will be given to you. - Luke 6:38",
      "Whoever can be trusted with very little can also be trusted with much. - Luke 16:10"
    ];
    
    // Character images for responses - using absolute URLs
    const characterImages = [
      "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
      "/pixel-solomon.png",
      "/pixel-jesus.png",
      "/pixel-moses.png",
      "/pixel-david.png"
    ];
    
    // DeFi related quotes
    const defiQuotes = [
      "The borrower is servant to the lender, choose your DeFi protocols wisely. - Proverbs 22:7",
      "Invest your talents wisely, for to everyone who has, more will be given. - Matthew 25:29",
      "Diversify your investments: divide your portion to seven, or even to eight. - Ecclesiastes 11:2"
    ];
    
    // Default response
    let response = {
      version: 'vNext',
      image: `${window.location.origin}/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png`,
      buttons: [
        { label: "Biblical Wisdom", action: "link", target: `${window.location.origin}/wisdom` },
        { label: "DeFi Swaps", action: "link", target: `${window.location.origin}/defi` },
        { label: "Share Wisdom", action: "post" }
      ]
    };
    
    // Process based on button index
    if (buttonIndex === 3) { // Share Wisdom button
      const randomQuoteIndex = Math.floor(Math.random() * wisdomQuotes.length);
      const randomImageIndex = Math.floor(Math.random() * characterImages.length);
      
      response.image = `${window.location.origin}${characterImages[randomImageIndex]}`;
      response.text = wisdomQuotes[randomQuoteIndex];
    } else if (buttonIndex === 2) { // DeFi button
      const randomQuoteIndex = Math.floor(Math.random() * defiQuotes.length);
      
      response.image = `${window.location.origin}/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png`;
      response.text = defiQuotes[randomQuoteIndex];
      response.buttons = [
        { label: "Swap Tokens", action: "link", target: `${window.location.origin}/defi` },
        { label: "Learn More", action: "link", target: `${window.location.origin}/wisdom` }
      ];
    } else if (buttonIndex === 1) { // Wisdom button - just redirect
      // Use the default response
    }
    
    return response;
  } catch (error) {
    console.error('Error in frame handler:', error);
    
    // Default fallback response on error
    return {
      version: 'vNext',
      image: `${window.location.origin}/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png`,
      text: "Something went wrong. Please try again.",
      buttons: [
        { label: "Try Again", action: "post" }
      ]
    };
  }
}

// Export for use in other contexts
if (typeof module !== 'undefined') {
  module.exports = { handleFrameRequest };
}
