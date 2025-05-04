
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
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bible.fi - Biblical Financial Wisdom</title>
  
  <!-- Basic Open Graph meta tags -->
  <meta property="og:title" content="Bible.fi - Biblical Financial Wisdom" />
  <meta property="og:description" content="Learn biblical principles for your financial journey." />
  <meta property="og:image" content="${image}" />
  
  <!-- Farcaster Frame meta tags -->
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
  <style>
    body {
      font-family: sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
      background: #111;
      color: #fff;
    }
    .logo {
      max-width: 300px;
      margin: 0 auto;
      animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse {
      0% { opacity: 0.8; transform: scale(0.98); }
      50% { opacity: 1; transform: scale(1); }
      100% { opacity: 0.8; transform: scale(0.98); }
    }
  </style>
</head>
<body>
  <div class="logo">
    <img src="${image}" alt="Bible.fi" width="300" />
  </div>
  <h1>Bible.fi Frame</h1>
  <p>This is a Farcaster Frame for Bible.fi - view this in a Farcaster client.</p>
  <p>Biblical wisdom for your financial journey.</p>
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
  
  // Biblical wisdom quotes for responses
  const wisdomQuotes = [
    "The wise store up choice food and olive oil, but fools gulp theirs down. - Proverbs 21:20",
    "Dishonest money dwindles away, but whoever gathers money little by little makes it grow. - Proverbs 13:11",
    "The rich rule over the poor, and the borrower is slave to the lender. - Proverbs 22:7",
    "Honor the Lord with your wealth, with the firstfruits of all your crops. - Proverbs 3:9",
    "Give, and it will be given to you. - Luke 6:38"
  ];
  
  // Process based on button index
  switch (payload.buttonIndex) {
    case 1: // First button - Learn
      return { 
        success: true, 
        action: "learn",
        redirectUrl: "/wisdom",
        message: "Learning biblical finance principles..."
      };
      
    case 2: { // Second button - Share
      // Get a random wisdom quote
      const randomQuote = wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];
      
      return { 
        success: true, 
        action: "share",
        message: randomQuote,
        image: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png" // Bible characters image
      };
    }
      
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
  console.log("Frame API endpoint would be created here");
  
  // In production, this would set up an API endpoint to handle frame requests
  // For now, we're using the static frame.js in the public folder
}
