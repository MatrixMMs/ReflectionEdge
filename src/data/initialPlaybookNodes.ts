// This file defines the initial nodes and edges for the Playbook mindmap. To add new scenarios, export additional node/edge sets from this file.

// Add NodeType import for type safety
import type { Node } from 'react-flow-renderer';
import type { PlaybookNodeData } from '../components/playbook/PlaybookSandbox';

export const initialNodes: Node<PlaybookNodeData>[] = [
  {
    id: '1',
    type: 'playbookCard',
    data: {
      type: 'philosophy',
      name: 'Protect Capital',
      description: "Rule #1: Don't lose money. Rule #2: Follow the process.",
    },
    position: { x: 350, y: 20 },
  },
  {
    id: '2',
    type: 'playbookCard',
    data: {
      type: 'setup',
      name: 'Butterfly + long OTM put',
      thesis: 'Short where she lands, long where she ain\'t',
      context: 'Volatile, post-news, high IV',
      notes: 'Look for IV crush after event.',
    },
    position: { x: 350, y: 140 },
  },
  {
    id: '3',
    type: 'playbookCard',
    data: {
      type: 'criteria',
      name: 'Entry Criteria',
      checklist: [
        'We are in long gamma',
        'Market is ranging/bullish',
        'No major news in next 2h',
      ],
      notes: 'Check VIX and SPX correlation.',
    },
    position: { x: 600, y: 240 },
  },
  {
    id: '4',
    type: 'playbookCard',
    data: {
      type: 'risk',
      name: 'Risk/Target',
      stop: 'Max loss $500',
      sizing: '2% of account',
      targets: 'Target 2:1 RR, scale at 1:1',
      notes: 'Adjust size for event risk.',
    },
    position: { x: 100, y: 240 },
  },
  {
    id: '5',
    type: 'playbookCard',
    data: {
      type: 'process',
      name: 'Pre-Trade Checklist',
      question: 'Have you checked all criteria and risk parameters?',
      notes: 'Confirm with trading partner before execution.',
    },
    position: { x: 350, y: 320 },
  },
  {
    id: '6',
    type: 'playbookCard',
    data: {
      type: 'review',
      name: 'Post-Trade Review',
      reviewNotes: 'Trade followed plan, but exited early due to news. Next time, set alert for news.',
      notes: 'Emotion: Slightly anxious before news.',
    },
    position: { x: 350, y: 440 },
  },
  {
    id: '7',
    type: 'playbookCard',
    data: {
      type: 'setup',
      name: 'Trend Reversal',
      thesis: 'Fade exhaustion after parabolic move',
      context: 'Late session, high volume spike',
      notes: 'Look for divergence on RSI.',
    },
    position: { x: 700, y: 140 },
  },
  {
    id: '8',
    type: 'playbookCard',
    data: {
      type: 'criteria',
      name: 'Reversal Criteria',
      checklist: [
        'RSI > 75',
        'Volume spike',
        'Failed breakout candle',
      ],
      notes: 'Watch for confirmation on 5-min chart.',
    },
    position: { x: 900, y: 240 },
  },
  {
    id: '9',
    type: 'playbookCard',
    data: {
      type: 'risk',
      name: 'Reversal Risk',
      stop: 'Stop above high',
      sizing: '1% of account',
      targets: 'First support below',
      notes: '',
    },
    position: { x: 700, y: 240 },
  },
  {
    id: '10',
    type: 'playbookCard',
    data: {
      type: 'review',
      name: 'Reversal Review',
      reviewNotes: 'Missed entry, setup valid but hesitated. Improve execution confidence.',
      notes: '',
    },
    position: { x: 900, y: 440 },
  },
];

export const initialEdges = [
  // Philosophy to Setup
  { id: 'e1-2', source: '1', target: '2', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  { id: 'e1-7', source: '1', target: '7', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  // Setup to Criteria
  { id: 'e2-3', source: '2', target: '3', sourceHandle: 'right-source', targetHandle: 'left-target' },
  { id: 'e7-8', source: '7', target: '8', sourceHandle: 'right-source', targetHandle: 'left-target' },
  // Setup to Risk
  { id: 'e2-4', source: '2', target: '4', sourceHandle: 'left-source', targetHandle: 'right-target' },
  { id: 'e7-9', source: '7', target: '9', sourceHandle: 'left-source', targetHandle: 'right-target' },
  // Setup to Process
  { id: 'e2-5', source: '2', target: '5', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  // Criteria to Process
  { id: 'e3-5', source: '3', target: '5', sourceHandle: 'bottom-source', targetHandle: 'left-target' },
  // Risk to Process
  { id: 'e4-5', source: '4', target: '5', sourceHandle: 'bottom-source', targetHandle: 'right-target' },
  // Process to Review
  { id: 'e5-6', source: '5', target: '6', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  // Reversal Criteria to Reversal Review
  { id: 'e8-10', source: '8', target: '10', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  // Reversal Risk to Reversal Review
  { id: 'e9-10', source: '9', target: '10', sourceHandle: 'bottom-source', targetHandle: 'left-target' },
]; 