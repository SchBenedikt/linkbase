'use client';

import { GripVertical, MoreVertical, Trash2, Edit, Smartphone } from 'lucide-react';
import type { Link, AppearanceSettings } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface AppDownloadCardProps {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  dragHandleListeners?: React.HTMLAttributes<any>;
}

/** App Store SVG badge (inline so no external image request) */
const AppStoreBadge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40" aria-label="Download on the App Store" role="img">
    <rect width="120" height="40" rx="6" fill="#000"/>
    <text x="60" y="14" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="sans-serif">Download on the</text>
    <text x="60" y="27" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="sans-serif" fontWeight="bold">App Store</text>
  </svg>
);

/** Google Play SVG badge (inline) */
const PlayStoreBadge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 40" width="135" height="40" aria-label="Get it on Google Play" role="img">
    <rect width="135" height="40" rx="6" fill="#000"/>
    <text x="67" y="14" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="sans-serif">Get it on</text>
    <text x="67" y="27" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
  </svg>
);

export function AppDownloadCard({ link, appearance, onEdit, onDelete, isEditable = false, dragHandleListeners }: AppDownloadCardProps) {
  const cardStyle: React.CSSProperties = {
    borderWidth: `${appearance.borderWidth || 0}px`,
    borderColor: appearance.borderColor,
    borderStyle: appearance.borderWidth ? 'solid' : 'none',
  };

  const fgStyle: React.CSSProperties = { color: appearance.cardForegroundColor };
  const mutedStyle: React.CSSProperties = { color: appearance.cardForegroundColor, opacity: 0.7 };

  const hasStore = link.appStoreUrl || link.playStoreUrl;

  return (
    <Card className="group relative overflow-hidden bg-card w-full h-full flex flex-col" style={cardStyle}>
      <CardContent className="flex flex-col items-center justify-center gap-4 h-full p-5 text-center">
        {link.thumbnailUrl ? (
          <img src={link.thumbnailUrl} alt={link.title} className="h-16 w-16 rounded-2xl object-cover shadow" />
        ) : (
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center shadow" style={{ background: appearance.primaryColor || 'hsl(var(--primary))' }}>
            <Smartphone className="h-8 w-8 text-white" />
          </div>
        )}
        {link.title && <p className="font-bold text-base" style={fgStyle}>{link.title}</p>}
        {link.content && <p className="text-xs" style={mutedStyle}>{link.content}</p>}
        {hasStore && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {link.appStoreUrl && (
              <a href={link.appStoreUrl} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store">
                <AppStoreBadge />
              </a>
            )}
            {link.playStoreUrl && (
              <a href={link.playStoreUrl} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play">
                <PlayStoreBadge />
              </a>
            )}
          </div>
        )}
      </CardContent>

      {isEditable && onEdit && onDelete && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="icon" className="h-9 w-9 cursor-grab bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Reorder" {...dragHandleListeners}>
            <GripVertical className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white hover:text-white" aria-label="Options">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}
