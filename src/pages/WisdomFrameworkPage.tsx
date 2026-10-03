/**
 * WisdomFrameworkPage — plain-language explanation of BWSP, BWTYA and the
 * harmonic math that joins them.
 *
 * "Through wisdom is an house builded; and by understanding it is established" — Proverbs 24:3 (KJV)
 */
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ShieldCheck, Sprout, Sigma, ArrowRight } from 'lucide-react';
import SeekHimFirstNote from '@/components/wisdom/SeekHimFirstNote';

const Verse: React.FC<{ text: string; reference: string; original?: string }> = ({ text, reference, original }) => (
  <blockquote className="border-l-2 border-ancient-gold pl-4 my-3">
    <p className="italic font-serif">"{text}"</p>
    <footer className="mt-1 text-sm text-ancient-gold">
      {reference} (KJV){original ? ` · ${original}` : ''}
    </footer>
  </blockquote>
);

const Step: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <div className="flex gap-3 rounded-lg border p-3">
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ancient-gold/20 text-sm font-bold text-ancient-gold">
      {n}
    </div>
    <div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  </div>
);

const Formula: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre className="my-3 overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs sm:text-sm">{children}</pre>
);

const WisdomFrameworkPage: React.FC = () => (
  <div className="min-h-screen bg-background">
    <NavBar />
    <main className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <BookOpen className="h-8 w-8 text-ancient-gold" />
          How BibleFi wisdom works
        </h1>
        <p className="text-muted-foreground">
          Two engines work together: BWSP finds and checks what Scripture says, and BWTYA turns
          that checked wisdom into a careful yield plan. Nothing moves your money unless you approve it.
        </p>
      </header>

      <SeekHimFirstNote />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-ancient-gold" />BWSP — Biblical Wisdom Synthesis Protocol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            When you ask a money question, BWSP searches the stored Scripture (KJV plus the Hebrew,
            Greek and Aramaic originals with Strong's numbers), gathers the surrounding passage, writes
            guidance, and then refuses to let that guidance count until it passes three checks.
          </p>
          <Verse text="Prove all things; hold fast that which is good." reference="1 Thessalonians 5:21" original="Greek dokimazō (G1381) — to test, to approve after testing" />
          <div className="space-y-2">
            <Step n={1} title="Find the passages">Search by meaning and by word across every stored translation.</Step>
            <Step n={2} title="Read the context">Pull the verses around each match so nothing is quoted out of place.</Step>
            <Step n={3} title="Write the guidance">Summarize the principle and one practical step.</Step>
            <Step n={4} title="Authenticity check">Every quoted verse must match the stored text exactly.</Step>
            <Step n={5} title="Context check">The guidance must agree with the surrounding passage.</Step>
            <Step n={6} title="No cherry-picking check">Passages that warn against the idea must be weighed too, not left out.</Step>
          </div>
          <p className="text-sm text-muted-foreground">
            The result is <strong>Confirmed</strong>, <strong>Needs care</strong>, or <strong>Held back</strong>.
            Each answer is fingerprinted (a verse hash and a record hash) so it can never be quietly changed later.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sprout className="h-5 w-5 text-eboy-green" />BWTYA — Biblical Wisdom To Yield Algorithm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            BWTYA may only act after BWSP says Confirmed. It looks at live Base pools, removes risky ones,
            and builds a plan where the tithe comes first.
          </p>
          <Verse text="Honour the LORD with thy substance, and with the firstfruits of all thine increase." reference="Proverbs 3:9" original="Hebrew rē'shîth (H7225) — firstfruits, the first and best" />
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li><strong>Firstfruits:</strong> 10% of every gain goes to the storehouse before you receive anything (Malachi 3:10).</li>
            <li><strong>No borrowing to chase returns:</strong> "the borrower is servant to the lender" (Proverbs 22:7).</li>
            <li><strong>Spread the risk:</strong> "Give a portion to seven, and also to eight" (Ecclesiastes 11:2).</li>
            <li><strong>Steady over hasty:</strong> "he that maketh haste to be rich shall not be innocent" (Proverbs 28:20).</li>
            <li><strong>Plan for a bad year:</strong> every plan shows a lean-year outcome, as Joseph stored for famine (Genesis 41:35-36).</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5 text-ancient-gold" />The harmonic math</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The three checks are joined with a <strong>harmonic mean</strong>, not a simple average. A harmonic
            mean is pulled down hard by any weak score, so one failed check cannot be hidden by two strong ones.
          </p>
          <Formula>{`wisdom score  W = 3 / (1/A + 1/C + 1/P)

A = authenticity, C = context, P = no cherry-picking  (each 0 to 1)

Example: A = 0.95, C = 0.95, P = 0.40
  simple average  = 0.77   (looks fine)
  harmonic mean   = 0.64   (correctly flags the weak check)`}</Formula>
          <p>The verdict then follows the score:</p>
          <Formula>{`W ≥ 0.80  → Confirmed     (BWTYA may build a plan)
W ≥ 0.60  → Needs care    (read only, no money action)
W < 0.60  → Held back     (withheld from any money decision)`}</Formula>
          <p>For each pool BWTYA blends return and safety the same way, then sets the tithe first:</p>
          <Formula>{`pool grade   G = 2 / (1/yield_score + 1/safety_score)
gain                  = deposit × APY
tithe (firstfruits)   = gain × 10%
your share            = gain − tithe
amount put to work    = your amount × W   (lower wisdom → smaller step)`}</Formula>
          <p>
            Pools must hold at least $1M and show a believable return (between 0% and 100%) before they are
            even considered.
          </p>
        </CardContent>
      </Card>

      <Card className="border-ancient-gold/30">
        <CardContent className="space-y-3 pt-6 text-sm">
          <p className="text-muted-foreground">
            BibleFi only assists. You always make the final choice, under God, and every step can be checked.
          </p>
          <Button asChild>
            <Link to="/defi">Ask for wisdom now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <p className="pt-2 italic font-serif text-muted-foreground">
            "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways
            acknowledge him, and he shall direct thy paths." — Proverbs 3:5-6 (KJV)
          </p>
        </CardContent>
      </Card>
    </main>
  </div>
);

export default WisdomFrameworkPage;
