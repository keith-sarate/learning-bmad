import { useRef, useEffect, useCallback } from 'react';
import rough from 'roughjs';
import type { ColumnConfig, Card } from '../../types/types';
import { useBoardContext } from '../../context/BoardContext';
import Column from '../Column/Column';
import './Board.css';

const COLUMNS: ColumnConfig[] = [
  { id: 'todo',       title: 'To Do',       emptyStateText: 'Your tasks go here' },
  { id: 'inProgress', title: 'In Progress', emptyStateText: 'Drag cards here to start' },
  { id: 'done',       title: 'Done',        emptyStateText: 'Completed tasks land here' },
];

function Board() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardSvgRef = useRef<SVGSVGElement>(null);
  const { boardState } = useBoardContext();

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

  return (
    <div className="board" ref={containerRef}>
      <svg
        className="board-canvas"
        ref={boardSvgRef}
        aria-hidden="true"
      />
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
            />
          );
        })}
      </div>
    </div>
  );
}

export default Board;
