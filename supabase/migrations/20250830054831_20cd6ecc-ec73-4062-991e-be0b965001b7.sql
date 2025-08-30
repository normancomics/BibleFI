-- Create table for storing Superfluid stream data
CREATE TABLE public.superfluid_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stream_id TEXT NOT NULL UNIQUE,
  receiver_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  flow_rate TEXT NOT NULL,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('tithe', 'staking', 'general')),
  church_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.superfluid_streams ENABLE ROW LEVEL SECURITY;

-- Create policies for superfluid_streams
CREATE POLICY "Users can view their own streams" 
ON public.superfluid_streams 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own streams" 
ON public.superfluid_streams 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streams" 
ON public.superfluid_streams 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streams" 
ON public.superfluid_streams 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_superfluid_streams_updated_at
BEFORE UPDATE ON public.superfluid_streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_superfluid_streams_user_id ON public.superfluid_streams(user_id);
CREATE INDEX idx_superfluid_streams_status ON public.superfluid_streams(status);
CREATE INDEX idx_superfluid_streams_type ON public.superfluid_streams(stream_type);