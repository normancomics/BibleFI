-- Create comprehensive biblical knowledge database
CREATE TABLE IF NOT EXISTS public.bible_verses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_name text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  text text NOT NULL,
  version text DEFAULT 'ESV' NOT NULL,
  testament text NOT NULL CHECK (testament IN ('Old', 'New')),
  financial_relevance integer DEFAULT 0 CHECK (financial_relevance >= 0 AND financial_relevance <= 10),
  wisdom_category text[],
  defi_keywords text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter_verse ON public.bible_verses(book_name, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_bible_verses_financial_relevance ON public.bible_verses(financial_relevance);
CREATE INDEX IF NOT EXISTS idx_bible_verses_testament ON public.bible_verses(testament);
CREATE INDEX IF NOT EXISTS idx_bible_verses_wisdom_category ON public.bible_verses USING GIN(wisdom_category);
CREATE INDEX IF NOT EXISTS idx_bible_verses_defi_keywords ON public.bible_verses USING GIN(defi_keywords);

-- Enable RLS
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Bible verses are publicly readable" 
ON public.bible_verses 
FOR SELECT 
USING (true);

-- Create comprehensive scripture search function
CREATE OR REPLACE FUNCTION public.search_biblical_wisdom(
  search_term text DEFAULT NULL,
  wisdom_categories text[] DEFAULT NULL,
  min_financial_relevance integer DEFAULT 0,
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  reference text,
  text text,
  financial_relevance integer,
  wisdom_category text[],
  defi_keywords text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bv.id,
    (bv.book_name || ' ' || bv.chapter || ':' || bv.verse) as reference,
    bv.text,
    bv.financial_relevance,
    bv.wisdom_category,
    bv.defi_keywords
  FROM public.bible_verses bv
  WHERE 
    (search_term IS NULL OR bv.text ILIKE '%' || search_term || '%')
    AND (wisdom_categories IS NULL OR bv.wisdom_category && wisdom_categories)
    AND bv.financial_relevance >= min_financial_relevance
  ORDER BY bv.financial_relevance DESC, bv.book_name, bv.chapter, bv.verse
  LIMIT limit_count;
END;
$$;

-- Insert core financial wisdom verses
INSERT INTO public.bible_verses (book_name, chapter, verse, text, testament, financial_relevance, wisdom_category, defi_keywords) VALUES
('Proverbs', 21, 5, 'The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.', 'Old', 10, ARRAY['planning', 'diligence', 'wealth'], ARRAY['staking', 'yield farming', 'long-term']),
('Matthew', 6, 19, 'Do not lay up for yourselves treasures on earth, where moth and rust destroy and where thieves break in and steal', 'New', 9, ARRAY['stewardship', 'eternal perspective'], ARRAY['security', 'cold storage', 'wallet protection']),
('Matthew', 6, 20, 'but lay up for yourselves treasures in heaven, where neither moth nor rust destroys and where thieves do not break in and steal.', 'New', 9, ARRAY['stewardship', 'eternal perspective'], ARRAY['long-term value', 'sustainable investing']),
('Luke', 14, 28, 'For which of you, desiring to build a tower, does not first sit down and count the cost, whether he has enough to complete it?', 'New', 10, ARRAY['planning', 'budgeting'], ARRAY['gas fees', 'transaction costs', 'portfolio planning']),
('Proverbs', 27, 14, 'A faithful man will abound with blessings, but whoever hastens to be rich will not go unpunished.', 'Old', 9, ARRAY['faithfulness', 'patience'], ARRAY['hodl', 'long-term investing', 'avoid fomo']),
('Ecclesiastes', 11, 2, 'Give a portion to seven, or even to eight, for you know not what disaster may happen on earth.', 'Old', 10, ARRAY['diversification', 'risk management'], ARRAY['portfolio diversification', 'multiple tokens', 'risk spread']),
('Proverbs', 13, 11, 'Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.', 'Old', 10, ARRAY['patience', 'gradual growth'], ARRAY['dca', 'dollar cost averaging', 'consistent investing']),
('Malachi', 3, 10, 'Bring the full tithe into the storehouse, that there may be food in my house. And thereby put me to the test, says the Lord of hosts, if I will not open the windows of heaven for you and pour down for you a blessing until there is no more need.', 'Old', 8, ARRAY['tithing', 'generosity', 'blessing'], ARRAY['tithe', 'giving', 'streaming payments']),
('1 Timothy', 6, 10, 'For the love of money is a root of all kinds of evils. It is through this craving that some have wandered away from the faith and pierced themselves with many pangs.', 'New', 7, ARRAY['contentment', 'priorities'], ARRAY['responsible investing', 'not gambling']),
('Proverbs', 22, 7, 'The rich rules over the poor, and the borrower is the slave of the lender.', 'Old', 9, ARRAY['debt management', 'financial freedom'], ARRAY['lending protocols', 'borrowing risks', 'collateral']);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_bible_verses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bible_verses_updated_at
  BEFORE UPDATE ON public.bible_verses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bible_verses_updated_at();