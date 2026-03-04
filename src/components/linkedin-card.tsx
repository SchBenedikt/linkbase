'use client';

import { MoreVertical, Trash2, Edit, GripVertical, ExternalLink } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { LinkCard } from './link-card';

interface LinkedInCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  appearance: AppearanceSettings;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function extractLinkedInInfo(url: string): { type: 'profile' | 'company' | 'post'; identifier: string } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('linkedin.com')) return null;

    const companyMatch = u.pathname.match(/^\/company\/([^/]+)/);
    if (companyMatch) return { type: 'company', identifier: companyMatch[1] };

    const profileMatch = u.pathname.match(/^\/in\/([^/]+)/);
    if (profileMatch) return { type: 'profile', identifier: profileMatch[1] };

    const postMatch = u.pathname.match(/^\/posts\//);
    if (postMatch) return { type: 'post', identifier: 'Post' };

    return null;
  } catch {
    return null;
  }
}

export function LinkedInCard({
  link,
  onEdit,
  onDelete,
  isEditable = false,
  appearance,
  dragHandleListeners,
}: LinkedInCardProps) {
  const info = link.url ? extractLinkedInInfo(link.url) : null;

  if (!info) {
    return (
      <LinkCard
        link={link}
        onEdit={onEdit}
        onDelete={onDelete}
        appearance={appearance}
        isEditable={isEditable}
        dragHandleListeners={dragHandleListeners}
      />
    );
  }

  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
    backgroundColor: appearance.cardColor,
  };

  const textStyle: React.CSSProperties = { color: appearance.cardForegroundColor || '#111827' };
  const mutedStyle: React.CSSProperties = { color: appearance.cardForegroundColor || '#111827', opacity: 0.7 };

  const typeLabel = info.type === 'company' ? 'Company' : info.type === 'post' ? 'Post' : 'Profile';

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card w-full h-full flex flex-col justify-between p-5"
      style={cardStyle}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <LinkedInIcon className="h-8 w-8 flex-shrink-0 text-[#0A66C2]" />
          <div className="min-w-0">
            <p className="font-bold text-base truncate" style={textStyle}>
              {link.title || info.identifier}
            </p>
            <p className="text-xs truncate" style={mutedStyle}>
              LinkedIn {typeLabel}
            </p>
          </div>
        </div>
        {link.content && (
          <p className="text-sm line-clamp-3" style={mutedStyle}>
            {link.content}
          </p>
        )}
      </div>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm font-medium mt-3 hover:underline z-10 relative"
        style={textStyle}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View on LinkedIn
      </a>

      {isEditable && onEdit && onDelete && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-grab bg-black/30 hover:bg-black/50 text-white hover:text-white"
            aria-label="Reorder link"
            {...dragHandleListeners}
          >
            <GripVertical className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-white"
                aria-label="Link options"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}
