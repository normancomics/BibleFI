
// This file handles all Farcaster Frame integration

// Farcaster Frame message types
export type FrameActionPayload = {
  fid: number;          // Farcaster ID of the user
  url: string;          // URL of the frame
  messageHash: string;  // Hash of the message
  timestamp: number;    // Timestamp of the action
  network: number;      // Network ID
  buttonIndex: number;  // Index of the button that was clicked
  castId: {            
    fid: number;        // Farcaster ID of the cast
    hash: string;       // Hash of the cast
  };
  inputText?: string;   // Optional input text from the user
};

// Frame button types
export type FrameButton = {
  label: string;
  action?: "post" | "post_redirect" | "link" | "mint";
  target?: string;
};

// Frame configuration
export type FrameConfig = {
  image: string;
  buttons: FrameButton[];
  postUrl?: string;
  inputText?: boolean;
  state?: string;
};

// Helper function to generate frame HTML
export function generateFrameHTML(config: FrameConfig): string {
  const { image, buttons, postUrl, inputText, state } = config;
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta property="og:image" content="${image}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${image}" />`;
  
  if (postUrl) {
    html += `\n  <meta property="fc:frame:post_url" content="${postUrl}" />`;
  }
  
  if (inputText) {
    html += `\n  <meta property="fc:frame:input:text" content="true" />`;
  }
  
  if (state) {
    html += `\n  <meta property="fc:frame:state" content="${state}" />`;
  }
  
  buttons.forEach((button, index) => {
    html += `\n  <meta property="fc:frame:button:${index + 1}" content="${button.label}" />`;
    if (button.action) {
      html += `\n  <meta property="fc:frame:button:${index + 1}:action" content="${button.action}" />`;
    }
    if (button.target) {
      html += `\n  <meta property="fc:frame:button:${index + 1}:target" content="${button.target}" />`;
    }
  });
  
  html += `
</head>
<body>
  <h1>Bible.fi Frame</h1>
  <p>This is a Farcaster Frame for Bible.fi - view this in a Farcaster client.</p>
</body>
</html>`;

  return html;
}

// Validate Farcaster message using the Farcaster Hub API
export async function validateFrameMessage(payload: FrameActionPayload): Promise<boolean> {
  try {
    // In production, this should verify the message with Farcaster's Hub API
    // Example verification logic:
    // 1. Check timestamp is recent
    const isTimestampRecent = Date.now() - payload.timestamp < 5 * 60 * 1000; // 5 minutes
    
    // 2. Verify the message came from a valid Farcaster user
    // This would typically involve calling Farcaster's API
    
    console.log("Validating frame message:", payload);
    return isTimestampRecent;
  } catch (error) {
    console.error("Error validating Farcaster message:", error);
    return false;
  }
}

// Process frame actions
export async function processFrameAction(payload: FrameActionPayload): Promise<any> {
  // Validate the message first
  const isValid = await validateFrameMessage(payload);
  
  if (!isValid) {
    throw new Error("Invalid Farcaster message");
  }
  
  // Process based on button index
  switch (payload.buttonIndex) {
    case 1: // First button - Learn
      return { 
        success: true, 
        action: "learn",
        redirectUrl: "/wisdom" 
      };
      
    case 2: // Second button - Share
      // Handle sharing logic
      return { 
        success: true, 
        action: "share",
        message: "Wisdom shared!"
      };
      
    default:
      return { 
        success: false, 
        error: "Unknown button action" 
      };
  }
}

// Create a new API endpoint file for handling Frame requests
export function createFrameApiEndpoint() {
  // This is a placeholder for future server-side code
  // In a production environment, this would be a serverless function
  // or an API endpoint that processes Frame requests
  console.log("Frame API endpoint would be created here");
}
