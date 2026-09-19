/**
 * ChurchNftBadge — shows the NFT badge held by a church's own published Base
 * wallet. Renders nothing when the wallet holds no NFT, so the listing never
 * claims a badge a church does not have.
 *
 * "Let your light so shine before men" — Matthew 5:16 (KJV)
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Image as ImageIcon } from 'lucide-react';
import type { ChurchNftBadge as BadgeData } from '@/services/churchNftBadges';

interface Props {
  badge?: BadgeData | null;
  size?: 'sm' | 'md';
}

const ChurchNftBadge: React.FC<Props> = ({ badge, size = 'sm' }) => {
  if (!badge) return null;

  const dimension = size === 'md' ? 'h-8 w-8' : 'h-6 w-6';
  const label = badge.name || badge.collection || 'Church NFT badge';

  const visual = badge.image_url ? (
    <img
      src={badge.image_url}
      alt={label}
      loading="lazy"
      className={`${dimension} shrink-0 rounded-md border border-ancient-gold/50 object-cover`}
    />
  ) : (
    <span
      className={`${dimension} flex shrink-0 items-center justify-center rounded-md border border-ancient-gold/50 bg-ancient-gold/10`}
    >
      <ImageIcon className="h-3 w-3 text-ancient-gold" />
    </span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="flex items-center gap-1.5"
          onClick={(event) => event.stopPropagation()}
          aria-label={`${label} — church NFT badge`}
        >
          {visual}
          {size === 'md' && (
            <Badge variant="outline" className="border-ancient-gold/50 text-ancient-gold">
              NFT badge
            </Badge>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-56 text-xs">
        <div className="font-medium">{label}</div>
        {badge.collection && <div className="text-muted-foreground">{badge.collection}</div>}
        <div className="text-muted-foreground">
          {badge.nft_count} item{badge.nft_count === 1 ? '' : 's'} held on Base
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default ChurchNftBadge;
