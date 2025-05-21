
// Farcaster integration client

type FrameConfig = {
  image: string;
  buttons: Array<{
    label: string;
    action: "post" | "link";
    target?: string;
  }>;
  postUrl: string;
  state?: string;
};

// Generate HTML for Farcaster Frame
export const generateFrameHTML = (config: FrameConfig): string => {
  const { image, buttons, postUrl, state } = config;

  // Base HTML for the frame
  let frameHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bible.fi Frame</title>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${image}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="og:image" content="${image}">`;

  // Add buttons meta tags
  buttons.forEach((button, index) => {
    frameHTML += `
  <meta property="fc:frame:button:${index + 1}" content="${button.label}">`;
    
    if (button.action === "link" && button.target) {
      frameHTML += `
  <meta property="fc:frame:button:${index + 1}:action" content="link">
  <meta property="fc:frame:button:${index + 1}:target" content="${button.target}">`;
    } else if (button.action === "post") {
      frameHTML += `
  <meta property="fc:frame:button:${index + 1}:action" content="post">`;
    }
  });

  // Add post URL
  frameHTML += `
  <meta property="fc:frame:post_url" content="${postUrl}">`;

  // Add state if provided
  if (state) {
    frameHTML += `
  <meta property="fc:frame:state" content="${state}">`;
  }

  // Complete HTML
  frameHTML += `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #000;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
    .container {
      max-width: 600px;
      padding: 20px;
    }
    h1 {
      color: #FFD700;
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.8;
    }
    img {
      max-width: 100%;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    .footer {
      margin-top: 2rem;
      font-size: 0.8rem;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>BIBLE.FI</h1>
    <p>Biblical wisdom for financial stewardship</p>
    <img src="${image}" alt="Bible.fi Frame">
    <p>To interact with this frame, view it on Farcaster.</p>
    <div class="footer">Built on Base Chain • Powered by Farcaster</div>
  </div>
</body>
</html>`;

  return frameHTML;
};

// Share a verse to Farcaster
export const shareVerseToFarcaster = (verse: { text: string; reference: string }): string => {
  const encodedText = encodeURIComponent(`"${verse.text}" - ${verse.reference}\n\nShared from Bible.fi - Biblical wisdom for financial stewardship`);
  return `https://warpcast.com/~/compose?text=${encodedText}`;
};
