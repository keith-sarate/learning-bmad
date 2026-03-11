import type { Card as CardType } from '../../types/types';
import './Card.css';

interface CardProps {
  card: CardType;
}

function Card({ card }: CardProps) {
  return (
    <div
      className="card"
      style={{ backgroundColor: `var(--color-card-${card.color})` }}
      data-card-id={card.id}
    >
      <p className="card-title">{card.title}</p>
    </div>
  );
}

export default Card;
