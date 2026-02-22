'use client';

import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
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
import { BlogOverviewCard } from './blog-overview-card';
import { ProductCard } from './product-card';
import { ImageCard } from './image-card';
import { ProfileCard } from './profile-card';
import { MapCard } from './map-card';
import { InstagramCard } from './instagram-card';
import { TiktokCard } from './tiktok-card';
import { SoundcloudCard } from './soundcloud-card';
import { VimeoCard } from './vimeo-card';
import { ClockCard } from './clock-card';
import { CountdownCard } from './countdown-card';
import { CalendlyCard } from './calendly-card';
import { GithubCard } from './github-card';

// Grid constants  
const GRID_COLS = 4;
const ROW_HEIGHT_REM = 10; // auto-rows-[10rem]
const GAP_PX = 16; // gap-4
const MAX_COL_SPAN = 4;
const MAX_ROW_SPAN = 6;

/**
 * Corner resize handle – uses Pointer Events for reliable cross-browser drag.
 * Calculates new colSpan / rowSpan from the element's actual rendered dimensions.
 */
function ResizeHandle({
  linkId,
  colSpan,
  rowSpan,
  elementRef,
  onResizePreview,
  onResizeCommit,
}: {
  linkId: string;
  colSpan: number;
  rowSpan: number;
  elementRef: React.RefObject<HTMLDivElement>;
  onResizePreview: (cols: number, rows: number) => void;
  onResizeCommit: (linkId: string, cols: number, rows: number) => void;
}) {
  const isResizing = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only left-button for mouse; touch and pen always allowed
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    const el = elementRef.current;
    if (!el) return;

    isResizing.current = true;
    const handle = e.currentTarget as HTMLDivElement;
    handle.setPointerCapture(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = el.offsetWidth;
    const startH = el.offsetHeight;

    // Derive single-cell dimensions from current rendered size
    const cellW = (startW - (colSpan - 1) * GAP_PX) / colSpan;
    const cellH = (startH - (rowSpan - 1) * GAP_PX) / rowSpan;

    const computeSpans = (cx: number, cy: number) => {
      const dx = cx - startX;
      const dy = cy - startY;
      const newW = Math.max(cellW, startW + dx);
      const newH = Math.max(cellH, startH + dy);
      const newCols = Math.max(1, Math.min(MAX_COL_SPAN, Math.round((newW + GAP_PX) / (cellW + GAP_PX))));
      const newRows = Math.max(1, Math.min(MAX_ROW_SPAN, Math.round((newH + GAP_PX) / (cellH + GAP_PX))));
      return { newCols, newRows };
    };

    const onMove = (me: PointerEvent) => {
      const { newCols, newRows } = computeSpans(me.clientX, me.clientY);
      onResizePreview(newCols, newRows);
    };

    const onUp = (ue: PointerEvent) => {
      handle.releasePointerCapture(e.pointerId);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      isResizing.current = false;
      const { newCols, newRows } = computeSpans(ue.clientX, ue.clientY);
      onResizeCommit(linkId, newCols, newRows);
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
  }, [linkId, colSpan, rowSpan, elementRef, onResizePreview, onResizeCommit]);

  return (
    <div
      className="absolute bottom-0 right-0 z-30 w-8 h-8 flex items-end justify-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-se-resize"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      title="Drag to resize"
    >
      {/* Classic three-line resize indicator */}
      <svg width="10" height="10" viewBox="0 0 10 10" className="pointer-events-none text-white drop-shadow">
        <line x1="9" y1="3" x2="3" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
        <line x1="9" y1="6" x2="6" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
        <line x1="9" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      </svg>
    </div>
  );
}

function renderCardComponent(
  componentType: Link['type'] | undefined,
  props: {
    link: Link;
    ownerId?: string;
    appearance: AppearanceSettings;
    onEdit?: () => void;
    onDelete?: () => void;
    isEditable: boolean;
    dragHandleListeners?: React.HTMLAttributes<any>;
  }
): React.ReactNode {
  switch (componentType) {
    case 'text':
      return <TextCard {...props} />;
    case 'spotify':
      return <SpotifyLinkCard {...props} />;
    case 'youtube':
      return <YoutubeLinkCard {...props} />;
    case 'article':
      return <ArticleCard {...props} />;
    case 'blog-overview':
      return props.ownerId ? <BlogOverviewCard {...props} ownerId={props.ownerId} /> : null;
    case 'product':
      return <ProductCard {...props} />;
    case 'image':
      return <ImageCard {...props} />;
    case 'profile':
      return <ProfileCard {...props} />;
    case 'map':
      return <MapCard {...props} />;
    case 'instagram':
      return <InstagramCard {...props} />;
    case 'tiktok':
      return <TiktokCard {...props} />;
    case 'soundcloud':
      return <SoundcloudCard {...props} />;
    case 'vimeo':
      return <VimeoCard {...props} />;
    case 'clock':
      return <ClockCard {...props} />;
    case 'countdown':
      return <CountdownCard {...props} />;
    case 'calendly':
      return <CalendlyCard {...props} />;
    case 'github':
      return <GithubCard {...props} />;
    default:
      return <LinkCard {...props} />;
  }
}

function resolveComponentType(link: Link): Link['type'] {
  if (link.type) return link.type;
  if (link.url) {
    if (/spotify/.test(link.url)) return 'spotify';
    if (/youtube/.test(link.url)) return 'youtube';
  }
  return 'link';
}

// Sortable item with integrated resize handle
function SortableLinkItem(props: {
  link: Link;
  ownerId?: string;
  appearance: AppearanceSettings;
  onEdit?: () => void;
  onDelete?: () => void;
  onResizeCommit?: (linkId: string, cols: number, rows: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.link.id });

  // Preview state for live resize feedback
  const [previewCols, setPreviewCols] = useState<number | null>(null);
  const [previewRows, setPreviewRows] = useState<number | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Reset preview when link data changes (after commit)
  useEffect(() => {
    setPreviewCols(null);
    setPreviewRows(null);
  }, [props.link.colSpan, props.link.rowSpan]);

  const activeCols = previewCols ?? (props.link.colSpan || 1);
  const activeRows = previewRows ?? (props.link.rowSpan || 1);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : undefined,
    gridColumn: `span ${activeCols}`,
    gridRow: `span ${activeRows}`,
    opacity: isDragging ? 0.5 : 1,
  };

  // Combine dnd-kit ref with our measurement ref
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node);
    elementRef.current = node;
  }, [setNodeRef]);

  const handleResizePreview = useCallback((cols: number, rows: number) => {
    setPreviewCols(cols);
    setPreviewRows(rows);
  }, []);

  const handleResizeCommit = useCallback((linkId: string, cols: number, rows: number) => {
    setPreviewCols(cols);
    setPreviewRows(rows);
    props.onResizeCommit?.(linkId, cols, rows);
  }, [props.onResizeCommit]);

  const componentType = resolveComponentType(props.link);

  return (
    <div
      ref={combinedRef}
      style={style}
      {...attributes}
      className="group relative"
    >
      {renderCardComponent(componentType, {
        link: props.link,
        ownerId: props.ownerId,
        appearance: props.appearance,
        onEdit: props.onEdit,
        onDelete: props.onDelete,
        isEditable: true,
        dragHandleListeners: listeners,
      })}
      {/* Resize handle overlaid on the card */}
      <ResizeHandle
        linkId={props.link.id}
        colSpan={activeCols}
        rowSpan={activeRows}
        elementRef={elementRef as React.RefObject<HTMLDivElement>}
        onResizePreview={handleResizePreview}
        onResizeCommit={handleResizeCommit}
      />
      {/* Resize tooltip badge during preview */}
      {(previewCols !== null || previewRows !== null) && (
        <div className="absolute bottom-8 right-2 z-40 bg-black/80 text-white text-xs rounded px-2 py-0.5 pointer-events-none select-none">
          {activeCols}×{activeRows}
        </div>
      )}
    </div>
  );
}


interface LinkListProps {
  links: Link[];
  ownerId?: string;
  onAddLink?: () => void;
  onEditLink?: (link: Link) => void;
  onDeleteLink?: (link: Link) => void;
  onDragEnd?: (activeId: string, overId: string) => void;
  onResizeLink?: (linkId: string, colSpan: number, rowSpan: number) => void;
  appearance: AppearanceSettings;
  isEditable?: boolean;
}

export function LinkList({
  links,
  ownerId,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onDragEnd,
  onResizeLink,
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

  if (isEditable) {
    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={linkIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[10rem] gap-4">
            {sortedLinks.map((link) => (
              <SortableLinkItem
                key={link.id}
                link={link}
                ownerId={ownerId}
                appearance={appearance}
                onEdit={onEditLink ? () => onEditLink(link) : undefined}
                onDelete={onDeleteLink ? () => onDeleteLink(link) : undefined}
                onResizeCommit={onResizeLink}
              />
            ))}
            {onAddLink && (
              <Button
                variant="outline"
                className="w-full h-full hover:bg-accent/20 transition-all duration-300 flex flex-col items-center justify-center text-lg"
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
        const componentType = resolveComponentType(link);
        const style: React.CSSProperties = {
          gridColumn: `span ${link.colSpan || 1}`,
          gridRow: `span ${link.rowSpan || 1}`,
        };

        return (
          <div key={link.id} style={style}>
            {renderCardComponent(componentType, {
              link,
              ownerId,
              appearance,
              isEditable: false,
            })}
          </div>
        );
      })}
    </div>
  );
}
