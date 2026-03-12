import { useRef, useEffect, useCallback, type MutableRefObject } from 'react';
import rough from 'roughjs';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { ColumnId, Card } from '../../types/types';
import CardComponent from '../Card/Card';
import CardCreationPad from '../CardCreationPad/CardCreationPad';
import './Column.css';

interface ColumnProps {
  id: ColumnId;
  title: string;
  emptyStateText: string;
  cards?: Card[];
  children?: React.ReactNode;
  isHighlighted?: boolean;
}

function Column({ id, title, emptyStateText, cards, children, isHighlighted }: ColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { setNodeRef: setDroppableRef } = useDroppable({ id });

  const setColumnRef = useCallback((node: HTMLDivElement | null) => {
    (containerRef as MutableRefObject<HTMLDivElement | null>).current = node;
    setDroppableRef(node);
  }, [setDroppableRef]);

  const cardIds = (cards ?? []).map((c) => c.id);

  const drawSketchyBorder = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const style = getComputedStyle(document.documentElement);
    const borderColor = style.getPropertyValue('--color-column-border').trim();
    const bgColor = style.getPropertyValue('--color-column-background').trim();

    const rc = rough.svg(svg);
    const padding = 3;
    svg.appendChild(
      rc.rectangle(padding, padding, width - padding * 2, height - padding * 2, {
        stroke: borderColor,
        strokeWidth: 2,
        roughness: 1.5,
        fill: bgColor,
        fillStyle: 'solid',
      })
    );
  }, []);

  useEffect(() => {
    drawSketchyBorder();

    const observer = new ResizeObserver(() => drawSketchyBorder());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [drawSketchyBorder]);

  const hasCards = (cards ?? []).length > 0;
  const isTodo = id === 'todo';
  const showEmptyState = !isTodo && !hasCards && !children;

  return (
    <div className={`column${isHighlighted ? ' column-highlighted' : ''}`} ref={setColumnRef} data-column-id={id} role="region" aria-label={title}>
      <svg
        className="column-border-canvas"
        ref={svgRef}
        aria-hidden="true"
      />
      <div className="column-inner">
        <h2 className="column-header">{title}</h2>
        <div className="column-cards">
          {isTodo && <CardCreationPad />}
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {(cards ?? []).map((card) => (
              <CardComponent key={card.id} card={card} isDone={id === 'done'} />
            ))}
          </SortableContext>
          {children}
          {showEmptyState && (
            <div className="column-empty-state">{emptyStateText}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Column;
