'use client';

import { useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Link, AppearanceSettings } from '@/lib/types';
import { LinkCard } from './link-card';
import { Button } from './ui/button';
import { SpotifyLinkCard } from './spotify-link-card';
import { YoutubeLinkCard } from './youtube-link-card';
import { TextCard } from './text-card';
import { ArticleCard } from './article-card';

// Sortable Item Wrapper
function SortableLinkItem(props: {
  link: Link;
  appearance: AppearanceSettings;
  onEdit?: (link: Link) => void;
  onDelete?: (link: Link) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.link.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${props.link.colSpan || 1}`,
    gridRow: `span ${props.link.rowSpan || 1}`,
  };

  const { type, url } = props.link;
  let componentType = type;
  // Backwards compatibility for old data that doesn't have the `type` field
  if (!componentType && url) {
    if (/spotify/.test(url)) componentType = 'spotify';
    else if (/youtube/.test(url)) componentType = 'youtube';
    else componentType = 'link';
  }

  let CardComponent: React.ReactNode;
  switch (componentType) {
    case 'text':
      CardComponent = <TextCard {...props} isEditable={true} dragHandleListeners={listeners} />;
      break;
    case 'spotify':
      CardComponent = <SpotifyLinkCard {...props} isEditable={true} dragHandleListeners={listeners} />;
      break;
    case 'youtube':
      CardComponent = <YoutubeLinkCard {...props} isEditable={true} dragHandleListeners={listeners} />;
      break;
    case 'article':
      CardComponent = <ArticleCard {...props} isEditable={true} dragHandleListeners={listeners} />;
      break;
    default:
      CardComponent = <LinkCard {...props} isEditable={true} dragHandleListeners={listeners} />;
      break;
  }
  
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {CardComponent}
    </div>
  );
}


interface LinkListProps {
  links: Link[];
  onAddLink?: () => void;
  onEditLink?: (link: Link) => void;
  onDeleteLink?: (link: Link) => void;
  onDragEnd?: (activeId: string, overId: string) => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
}

export function LinkList({
  links,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onDragEnd,
  appearance,
  isEditable = false,
}: LinkListProps) {
  
  const sortedLinks = useMemo(() => {
    return [...(links || [])].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [links]);

  const linkIds = useMemo(() => sortedLinks.map((l) => l.id), [sortedLinks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onDragEnd?.(active.id as string, over.id as string);
    }
  };

  // Editable mode with Drag-and-Drop
  if (isEditable) {
    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={linkIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[10rem] gap-4">
            {sortedLinks.map((link) => (
              <SortableLinkItem
                key={link.id}
                link={link}
                appearance={appearance}
                onEdit={onEditLink ? () => onEditLink(link) : undefined}
                onDelete={onDeleteLink ? () => onDeleteLink(link) : undefined}
              />
            ))}
            {onAddLink && (
              <Button
                variant="outline"
                className="w-full h-full border-dashed hover:border-solid hover:bg-accent/20 transition-all duration-300 flex flex-col items-center justify-center text-lg"
                onClick={onAddLink}
                style={{ gridRow: 'span 1', gridColumn: 'span 1' }}
              >
                <PlusCircle className="h-8 w-8 mb-2" />
                Add Content
              </Button>
            )}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  // Public, non-editable view
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[10rem] gap-4">
      {sortedLinks.map((link) => {
        const { type, url } = link;
        let componentType = type;
        if (!componentType && url) { // Backwards compatibility
            if (/spotify/.test(url)) componentType = 'spotify';
            else if (/youtube/.test(url)) componentType = 'youtube';
            else componentType = 'link';
        }

        const style: React.CSSProperties = {
            gridColumn: `span ${link.colSpan || 1}`,
            gridRow: `span ${link.rowSpan || 1}`,
        };
        
        let CardComponent: React.ReactNode;
        switch(componentType) {
            case 'text':
                CardComponent = <TextCard link={link} appearance={appearance} isEditable={false} />;
                break;
            case 'spotify':
                CardComponent = <SpotifyLinkCard link={link} appearance={appearance} isEditable={false} />;
                break;
            case 'youtube':
                CardComponent = <YoutubeLinkCard link={link} appearance={appearance} isEditable={false} />;
                break;
            case 'article':
                CardComponent = <ArticleCard link={link} appearance={appearance} isEditable={false} />;
                break;
            default:
                CardComponent = <LinkCard link={link} appearance={appearance} isEditable={false} />;
                break;
        }

        return (
          <div key={link.id} style={style}>
            {CardComponent}
          </div>
        );
      })}
    </div>
  );
}
