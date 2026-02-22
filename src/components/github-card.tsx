'use client';

import { MoreVertical, Trash2, Edit, GripVertical, Github, ExternalLink } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { LinkCard } from './link-card';

interface GithubCardProps {
  link: Link;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  appearance: AppearanceSettings;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

export function GithubCard({ link, onEdit, onDelete, isEditable = false, appearance, dragHandleListeners }: GithubCardProps) {
  const getGithubRepo = (url: string): { owner: string; repo: string } | null => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/?\s]+)/);
    return match ? { owner: match[1], repo: match[2] } : null;
  };

  const repoInfo = link.url ? getGithubRepo(link.url) : null;

  if (!repoInfo) {
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

  if (!appearance.borderWidth) {
    cardStyle.borderWidth = '0px';
  }

  const textStyle: React.CSSProperties = { color: appearance.cardForegroundColor || '#111827' };
  const mutedStyle: React.CSSProperties = { color: appearance.cardForegroundColor || '#111827', opacity: 0.7 };

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 ease-in-out bg-card w-full h-full flex flex-col justify-between p-5"
      style={cardStyle}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Github className="h-8 w-8 flex-shrink-0" style={textStyle} />
          <div className="min-w-0">
            <p className="font-bold text-base truncate" style={textStyle}>
              {repoInfo.owner}/{repoInfo.repo}
            </p>
          </div>
        </div>
        {link.content && (
          <p className="text-sm line-clamp-2" style={mutedStyle}>{link.content}</p>
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
        View on GitHub
      </a>

      {isEditable && onEdit && onDelete && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="icon" className="h-9 w-9 cursor-grab bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Reorder link" {...dragHandleListeners}>
            <GripVertical className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Link options">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
