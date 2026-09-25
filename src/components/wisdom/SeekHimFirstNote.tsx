import React from 'react';
import { Heart } from 'lucide-react';

/** "Seek ye first the kingdom of God" — Matthew 6:33. Shown above every Ask Wisdom box. */
const SeekHimFirstNote: React.FC = () => (
  <div className="flex gap-3 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
    <Heart className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
    <p>
      <strong>Before you ask BibleFi for wisdom:</strong> BibleFi always suggests that you first ask
      Jesus and the Holy Spirit, and seek Him and the Bible first and foremost. BibleFi is only a
      helper. “But seek ye first the kingdom of God, and his righteousness; and all these things
      shall be added unto you.” — Matthew 6:33 (KJV)
    </p>
  </div>
);

export default SeekHimFirstNote;
