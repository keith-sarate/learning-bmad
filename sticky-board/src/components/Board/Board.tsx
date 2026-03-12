import { useRef, useEffect, useCallback, useState } from 'react';
import rough from 'roughjs';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  closestCenter,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent, CollisionDetection } from '@dnd-kit/core';
import type { ColumnConfig, Card, ColumnId } from '../../types/types';
import { useBoardContext } from '../../context/BoardContext';
import Column from '../Column/Column';
import { audioService } from '../../services/audioService';
import TrashZone from '../TrashZone/TrashZone';
import StorageNotice from '../StorageNotice/StorageNotice';
import './Board.css';

const COLUMNS: ColumnConfig[] = [
  { id: 'todo',       title: 'To Do',       emptyStateText: 'Your tasks go here' },
  { id: 'inProgress', title: 'In Progress', emptyStateText: 'Drag cards here to start' },
  { id: 'done',       title: 'Done',        emptyStateText: 'Completed tasks land here' },
];

const COLUMN_IDS: ColumnId[] = ['todo', 'inProgress', 'done'];

// Custom collision detection: pointer-within first (most accurate for columns),
// then rect intersection, then closest center as final fallback.
const collisionDetection: CollisionDetection = (args) => {
  // If pointer is directly inside a droppable, that wins immediately
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    // Prefer column or trash hits over card hits so the column is always the target
    const containerHit = pointerCollisions.find(
      ({ id }) => COLUMN_IDS.includes(id as ColumnId) || id === 'trash'
    );
    if (containerHit) return [containerHit];
    return pointerCollisions;
  }
  // Fall back to rect intersection (handles slow/edge cursor movement)
  const intersecting = rectIntersection(args);
  return intersecting.length > 0 ? intersecting : closestCenter(args);
};

function Board() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardSvgRef = useRef<SVGSVGElement>(null);
  const { boardState, dispatch } = useBoardContext();
  const [activeOverColumnId, setActiveOverColumnId] = useState<ColumnId | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const drawBoardBackground = useCallback(() => {
    const container = containerRef.current;
    const svg = boardSvgRef.current;
    if (!container || !svg) return;

    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const style = getComputedStyle(document.documentElement);
    const strokeColor = style.getPropertyValue('--color-column-border').trim();
    const bgColor = style.getPropertyValue('--color-board-background').trim();

    const rc = rough.svg(svg);
    const padding = 4;
    svg.appendChild(
      rc.rectangle(padding, padding, width - padding * 2, height - padding * 2, {
        stroke: strokeColor,
        strokeWidth: 2.5,
        roughness: 1.8,
        fill: bgColor,
        fillStyle: 'solid',
      })
    );
  }, []);

  useEffect(() => {
    drawBoardBackground();

    const observer = new ResizeObserver(() => drawBoardBackground());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [drawBoardBackground]);

  function handleDragStart(event: DragStartEvent) {
    const cardId = event.active.id as string;
    dispatch({ type: 'SET_DRAGGING', payload: { cardId } });
    setActiveCard(boardState.cards[cardId] ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setActiveOverColumnId(null);
      return;
    }
    const overId = over.id as string;
    if (COLUMN_IDS.includes(overId as ColumnId)) {
      setActiveOverColumnId(overId as ColumnId);
    } else {
      // over.id is a card ID — find which column that card belongs to
      const col = COLUMN_IDS.find((c) => boardState.columns[c].includes(overId));
      setActiveOverColumnId(col ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // ALWAYS clear dragging first — even on cancelled drag (no over target)
    dispatch({ type: 'CLEAR_DRAGGING' });
    setActiveOverColumnId(null);
    setActiveCard(null);

    if (!over) return; // drag cancelled — card returns to original position

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return; // dropped on itself — no change

    // Trash zone — delete card (no audio, per architecture communication patterns)
    if (overId === 'trash') {
      dispatch({ type: 'DELETE_CARD', payload: { cardId: activeId } });
      return;
    }

    const columnIds = COLUMN_IDS;

    // Determine source column
    const fromColumn = columnIds.find((col) =>
      boardState.columns[col].includes(activeId)
    );
    if (!fromColumn) return;

    // Is the drop target a column (e.g. empty column droppable)?
    const isOverColumn = columnIds.includes(overId as ColumnId);

    if (isOverColumn) {
      const toColumn = overId as ColumnId;
      if (fromColumn === toColumn) return; // hovering over own column — no change
      const toIndex = boardState.columns[toColumn].length; // append at end of target column
      dispatch({
        type: 'MOVE_CARD',
        payload: { cardId: activeId, fromColumn, toColumn, toIndex },
      });
      audioService.playDrop(); // ← valid column drop
    } else {
      // over.id is a card ID — find which column the target card is in
      const toColumn = columnIds.find((col) =>
        boardState.columns[col].includes(overId)
      );
      if (!toColumn) return;

      const toIndex = boardState.columns[toColumn].indexOf(overId);

      if (fromColumn === toColumn) {
        // Within-column reorder
        const fromIndex = boardState.columns[fromColumn].indexOf(activeId);
        if (fromIndex === toIndex) return; // same slot — no change
        dispatch({
          type: 'REORDER_CARD',
          payload: { columnId: fromColumn, fromIndex, toIndex },
        });
        audioService.playDrop(); // ← within-column reorder
      } else {
        // Cross-column move — insert before the card being hovered over
        dispatch({
          type: 'MOVE_CARD',
          payload: { cardId: activeId, fromColumn, toColumn, toIndex },
        });
        audioService.playDrop(); // ← cross-column move
      }
    }
  }

  return (
    <div className="board" ref={containerRef} role="main">
      <svg
        className="board-canvas"
        ref={boardSvgRef}
        aria-hidden="true"
      />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          {COLUMNS.map((col) => {
            const columnCards = boardState.columns[col.id]
              .map(id => boardState.cards[id])
              .filter((c): c is Card => Boolean(c));
            return (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                emptyStateText={col.emptyStateText}
                cards={columnCards}
                isHighlighted={activeOverColumnId === col.id}
              />
            );
          })}
        </div>
        <TrashZone />
        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div
              className="card is-dragging"
              style={{
                backgroundColor: `var(--color-card-${activeCard.color})`,
                transform: 'rotate(var(--card-drag-tilt-angle))',
                boxShadow: '0 8px 24px var(--color-card-shadow)',
              }}
            >
              <p className="card-title">{activeCard.title}</p>
              {activeCard.description && (
                <p className="card-description">{activeCard.description}</p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <StorageNotice />
    </div>
  );
}

export default Board;
