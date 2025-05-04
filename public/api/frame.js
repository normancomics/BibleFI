
// This is a simple static API endpoint for Farcaster Frames
// In production, this should be replaced with a proper serverless function

function handleFrameRequest(request) {
  // Parse the request
  const params = new URLSearchParams(window.location.search);
  const state = params.get('state');
  const buttonIndex = parseInt(params.get('buttonIndex') || '0');
  
  // Biblical wisdom quotes for responses
  const wisdomQuotes = [
    "The wise store up choice food and olive oil, but fools gulp theirs down. - Proverbs 21:20",
    "Dishonest money dwindles away, but whoever gathers money little by little makes it grow. - Proverbs 13:11",
    "The rich rule over the poor, and the borrower is slave to the lender. - Proverbs 22:7",
    "Honor the Lord with your wealth, with the firstfruits of all your crops. - Proverbs 3:9",
    "Give, and it will be given to you. - Luke 6:38"
  ];
  
  // Character images for responses
  const characterImages = [
    "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    "/pixel-solomon.png",
    "/pixel-jesus.png"
  ];
  
  // Process based on button index
  let response = {
    version: 'vNext',
    image: `${window.location.origin}/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png`,
    buttons: [
      { label: "Continue Learning", action: "link", target: `${window.location.origin}/wisdom` },
      { label: "Share More Wisdom", action: "post" }
    ]
  };
  
  if (buttonIndex === 2) { // Share button was clicked
    const randomQuoteIndex = Math.floor(Math.random() * wisdomQuotes.length);
    const randomImageIndex = Math.floor(Math.random() * characterImages.length);
    
    response.image = `${window.location.origin}${characterImages[randomImageIndex]}`;
    response.text = wisdomQuotes[randomQuoteIndex];
  }
  
  return response;
}

// Export for use in other contexts
if (typeof module !== 'undefined') {
  module.exports = { handleFrameRequest };
}
