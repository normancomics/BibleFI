-- Create comprehensive biblical texts table
CREATE TABLE public.comprehensive_biblical_texts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  kjv_text TEXT NOT NULL,
  hebrew_text TEXT,
  greek_text TEXT,
  aramaic_text TEXT,
  strong_numbers TEXT[],
  original_words JSONB DEFAULT '[]'::jsonb,
  financial_keywords TEXT[],
  financial_relevance INTEGER DEFAULT 0,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Strong's concordance table
CREATE TABLE public.strongs_concordance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strong_number TEXT NOT NULL UNIQUE,
  original_word TEXT NOT NULL,
  transliteration TEXT,
  pronunciation TEXT,
  part_of_speech TEXT,
  definition TEXT NOT NULL,
  root_word TEXT,
  language TEXT NOT NULL CHECK (language IN ('Hebrew', 'Greek', 'Aramaic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create MCP biblical sessions table
CREATE TABLE public.mcp_biblical_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  biblical_references UUID[],
  context_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.comprehensive_biblical_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strongs_concordance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_biblical_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comprehensive_biblical_texts
CREATE POLICY "Biblical texts are publicly readable"
ON public.comprehensive_biblical_texts
FOR SELECT
USING (true);

-- RLS Policies for strongs_concordance
CREATE POLICY "Strong's concordance is publicly readable"
ON public.strongs_concordance
FOR SELECT
USING (true);

-- RLS Policies for mcp_biblical_sessions
CREATE POLICY "Users can view their own MCP sessions"
ON public.mcp_biblical_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own MCP sessions"
ON public.mcp_biblical_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create search function for comprehensive biblical knowledge
CREATE OR REPLACE FUNCTION public.search_comprehensive_biblical_knowledge(
  query_embedding VECTOR(1536),
  match_threshold DOUBLE PRECISION DEFAULT 0.7,
  match_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  kjv_text TEXT,
  hebrew_text TEXT,
  greek_text TEXT,
  aramaic_text TEXT,
  strong_numbers TEXT[],
  original_words JSONB,
  financial_keywords TEXT[],
  financial_relevance INTEGER,
  similarity DOUBLE PRECISION
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cbt.id,
    cbt.book,
    cbt.chapter,
    cbt.verse,
    cbt.kjv_text,
    cbt.hebrew_text,
    cbt.greek_text,
    cbt.aramaic_text,
    cbt.strong_numbers,
    cbt.original_words,
    cbt.financial_keywords,
    cbt.financial_relevance,
    1 - (cbt.embedding <=> query_embedding) as similarity
  FROM comprehensive_biblical_texts cbt
  WHERE 1 - (cbt.embedding <=> query_embedding) > match_threshold
  ORDER BY cbt.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_comprehensive_biblical_texts_embedding ON public.comprehensive_biblical_texts USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_comprehensive_biblical_texts_financial ON public.comprehensive_biblical_texts (financial_relevance DESC);
CREATE INDEX idx_comprehensive_biblical_texts_reference ON public.comprehensive_biblical_texts (book, chapter, verse);
CREATE INDEX idx_strongs_concordance_number ON public.strongs_concordance (strong_number);
CREATE INDEX idx_mcp_sessions_user_id ON public.mcp_biblical_sessions (user_id);

-- Add update trigger
CREATE TRIGGER update_comprehensive_biblical_texts_updated_at
  BEFORE UPDATE ON public.comprehensive_biblical_texts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();