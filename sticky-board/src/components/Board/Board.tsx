import { useRef, useEffect, useCallback, useState } from 'react';
import rough from 'roughjs';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
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

function Board() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardSvgRef = useRef<SVGSVGElement>(null);
  const { boardState, dispatch } = useBoardContext();
  const [activeOverColumnId, setActiveOverColumnId] = useState<ColumnId | null>(null);

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
    dispatch({ type: 'SET_DRAGGING', payload: { cardId: event.active.id as string } });
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setActiveOverColumnId(null);
      return;
    }
    const overId = over.id as string;
    const columnIds: ColumnId[] = ['todo', 'inProgress', 'done'];
    if (columnIds.includes(overId as ColumnId)) {
      setActiveOverColumnId(overId as ColumnId);
    } else {
      // over.id is a card ID — find which column that card belongs to
      const col = columnIds.find((c) => boardState.columns[c].includes(overId));
      setActiveOverColumnId(col ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // ALWAYS clear dragging first — even on cancelled drag (no over target)
    dispatch({ type: 'CLEAR_DRAGGING' });
    setActiveOverColumnId(null);

    if (!over) return; // drag cancelled — card returns to original position

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return; // dropped on itself — no change

    // Trash zone — delete card (no audio, per architecture communication patterns)
    if (overId === 'trash') {
      dispatch({ type: 'DELETE_CARD', payload: { cardId: activeId } });
      return;
    }

    const columnIds: ColumnId[] = ['todo', 'inProgress', 'done'];

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
    <div className="board" ref={containerRef}>
      <svg
        className="board-canvas"
        ref={boardSvgRef}
        aria-hidden="true"
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
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
      </DndContext>
      <StorageNotice />
    </div>
  );
}

export default Board;
