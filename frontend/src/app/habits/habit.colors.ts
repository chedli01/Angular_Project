export type HabitColors = {
  bg: string;
  accent: string; 
  light: string;   
};

export function getHabitColors(color: string): HabitColors {
  const colors: Record<string, HabitColors> = {
    blue: {
      bg: 'bg-blue-500',
      accent: 'text-blue-500',
      light: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-500',
      accent: 'text-green-500',
      light: 'bg-green-100'
    },
    teal: {
      bg: 'bg-teal-500',
      accent: 'text-teal-500',
      light: 'bg-teal-100'
    },
    yellow: {
      bg: 'bg-yellow-400',
      accent: 'text-yellow-500',
      light: 'bg-yellow-100'
    },
    red: {
      bg: 'bg-red-500',
      accent: 'text-red-500',
      light: 'bg-red-100'
    }
  };

  return colors[color] ?? colors['blue']; 
}
