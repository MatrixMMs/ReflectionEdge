import React, { useState } from 'react';

interface Trade {
  id: string;
  date: string;
  symbol: string;
  direction: string;
  pnl: number;
  grade?: string;
  playbookCardId?: string;
  comment?: string;
}

interface Card {
  id: string;
  name: string;
}

interface ReviewDashboardProps {
  trades: Trade[];
  cards: Card[];
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ trades, cards, setTrades }) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterCard, setFilterCard] = useState('');
  const filtered = trades.filter(t =>
    (!filterDate || t.date === filterDate) &&
    (!filterCard || t.playbookCardId === filterCard)
  );

  const handleCommentChange = (id: string, comment: string) => {
    setTrades(ts => ts.map(t => t.id === id ? { ...t, comment } : t));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: 'var(--text-main)', fontSize: 28, marginBottom: 16 }}>Review Dashboard</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <select value={filterCard} onChange={e => setFilterCard(e.target.value)}>
          <option value="">All Cards</option>
          {cards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
        </select>
      </div>
      <table style={{ width: '100%', background: 'var(--background-secondary)', color: 'var(--text-main)', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: 'var(--background-main)' }}>
            <th>Date</th>
            <th>Symbol</th>
            <th>Direction</th>
            <th>P&L</th>
            <th>Card</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(trade => (
            <tr key={trade.id}>
              <td>{trade.date}</td>
                              <td style={{ color: 'var(--text-main)' }}>{trade.symbol}</td>
              <td>{trade.direction}</td>
              <td>{trade.pnl}</td>
              <td>{cards.find(c => c.id === trade.playbookCardId)?.name || '-'}</td>
              <td>
                <input
                  type="text"
                  value={trade.comment || ''}
                  onChange={e => handleCommentChange(trade.id, e.target.value)}
                  style={{ width: 180 }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewDashboard; 