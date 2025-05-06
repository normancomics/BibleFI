
// Types for Farcaster integration
export type FarcasterUser = {
  fid: number;
  username: string;
  displayName?: string;
  pfp?: string;
};

export type AuthStatus = 'connected' | 'connecting' | 'disconnected';

export type FrameRequest = {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData?: {
    messageBytes: string;
  };
};

export type FrameResponse = {
  version: 'vNext';
  image: string;
  imageAspectRatio?: '1:1' | '1.91:1' | '16:9';
  buttons?: Array<{
    label: string;
    action?: 'post' | 'post_redirect' | 'link' | 'mint';
    target?: string;
  }>;
  text?: string;
  postUrl?: string;
  state?: string;
};
