
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
  // This is a placeholder - in production you would validate with the Farcaster Hub
  // You'll need to implement proper validation logic here
  console.log("Validating frame message:", payload);
  return true; // Placeholder return
}
