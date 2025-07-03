export * from './advancedTags';

export interface PlaybookNodeData {
  label: string;
  type: string;
  description?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in-progress' | 'completed';
  tags?: string[];
  dueDate?: string;
  assignee?: string;
}

export interface NodeType {
  type: string;
  label: string;
  icon: string;
  color: string;
} 