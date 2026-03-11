import type { Card as CardType } from '../../types/types';
import './Card.css';

interface CardProps {
  card: CardType;
  isDone?: boolean;
}

function Card({ card, isDone }: CardProps) {
  return (
    <div
      className={`card${isDone ? ' is-done' : ''}`}
      style={{ backgroundColor: `var(--color-card-${card.color})` }}
      data-card-id={card.id}
    >
      <p className="card-title">{card.title}</p>
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}
    </div>
  );
}

export default Card;
