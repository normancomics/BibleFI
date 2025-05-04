
// This is a simple static API endpoint for Farcaster Frames
// In production, this should be replaced with a proper serverless function

function handleFrameRequest(request) {
  // Parse the request
  const params = new URLSearchParams(window.location.search);
  const state = params.get('state');
  const buttonIndex = parseInt(params.get('buttonIndex') || '0');
  
  // Process based on button index
  let response = {
    version: 'vNext',
    image: `${window.location.origin}/pixel-solomon.png`,
    buttons: [
      { label: "Continue Learning", action: "link", target: `${window.location.origin}/wisdom` },
    ]
  };
  
  if (buttonIndex === 2) { // Share button was clicked
    response.image = `${window.location.origin}/pixel-jesus.png`;
    response.text = "Thank you for sharing Biblical wisdom!";
  }
  
  return response;
}

// Export for use in other contexts
if (typeof module !== 'undefined') {
  module.exports = { handleFrameRequest };
}
