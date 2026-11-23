import type { BWSPSourceCitation } from '@/services/bwsp/types';

interface BwspSourceNotesProps {
  citations?: BWSPSourceCitation[];
  disclaimer?: string;
  riskNotice?: string;
}

export function BwspSourceNotes({
  citations = [],
  disclaimer,
  riskNotice,
}: BwspSourceNotesProps) {
  return (
    <aside className="space-y-3 rounded-md border border-border/60 p-3 text-xs text-muted-foreground">
      <div>
        <h3 className="mb-1 font-semibold text-foreground">Sources</h3>
        {citations.length > 0 ? (
          <ul className="space-y-1">
            {citations.map((citation) => (
              <li key={`${citation.type}:${citation.id}`}>
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {citation.type === 'scripture' && citation.translation
                    ? `${citation.reference} (${citation.translation})`
                    : citation.reference}
                  {' — '}
                  {citation.title}
                </a>
                {citation.version ? ` · ${citation.version}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviewed sources were retrieved; this result is not a sourced answer.</p>
        )}
      </div>
      {riskNotice && <p><strong>Risk:</strong> {riskNotice}</p>}
      {disclaimer && <p>{disclaimer}</p>}
    </aside>
  );
}
