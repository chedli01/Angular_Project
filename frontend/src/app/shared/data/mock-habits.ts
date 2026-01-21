import { Habit } from '../models/habit.model';

export const MOCK_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Morning Exercise',
    icon: '💪',
    color: '#3B82F6',
    description: '30 minutes workout',
    completed: false,
    streak: 5,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Read Book',
    icon: '📚',
    color: '#10B981',
    description: 'Read for 20 minutes',
    completed: true,
    streak: 12,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Meditation',
    icon: '🧘',
    color: '#8B5CF6',
    description: '10 minutes mindfulness',
    completed: false,
    streak: 8,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Drink Water',
    icon: '💧',
    color: '#06B6D4',
    description: '8 glasses of water',
    completed: true,
    streak: 20,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Learn Coding',
    icon: '💻',
    color: '#F59E0B',
    description: 'Practice for 1 hour',
    completed: false,
    streak: 3,
    createdAt: new Date('2024-01-01')
  }
];
