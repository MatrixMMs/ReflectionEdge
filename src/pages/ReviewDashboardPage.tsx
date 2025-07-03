import React, { useEffect, useState } from 'react';
import ReviewDashboard from '../components/review/ReviewDashboard';

const LOCAL_STORAGE_KEY = 'playbook-mindmap';

const mockTrades = [
  { id: '1', date: '2024-07-01', symbol: 'ES', direction: 'Long', pnl: 1200, playbookCardId: '1', comment: '' },
  { id: '2', date: '2024-07-01', symbol: 'ES', direction: 'Short', pnl: 275, playbookCardId: '2', comment: '' },
  { id: '3', date: '2024-07-01', symbol: 'ES', direction: 'Short', pnl: -50, playbookCardId: '3', comment: '' },
];

const ReviewDashboardPage: React.FC = () => {
  const [cards, setCards] = useState<{ id: string; name: string }[]>([]);
  const [trades, setTrades] = useState(mockTrades);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const { nodes: savedNodes } = JSON.parse(saved);
      setCards(savedNodes.map((n: any) => ({ id: n.id, name: n.data.name })));
    }
  }, []);

  return <ReviewDashboard trades={trades} cards={cards} setTrades={setTrades} />;
};

export default ReviewDashboardPage; 