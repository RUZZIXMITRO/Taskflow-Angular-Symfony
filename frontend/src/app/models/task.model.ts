/**
 * Priorité d'une tâche.
 * Union littérale : seules ces trois valeurs sont acceptées par TypeScript
 * ('urgent' provoquerait une erreur de compilation).
 */
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: Priority;
  /** Date limite au format ISO 'yyyy-MM-dd' (optionnelle). */
  dueDate?: string | null;
}

/** Données envoyées à l'API pour créer une tâche (l'id est attribué par le serveur). */
export type NewTask = Omit<Task, 'id'>;

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};
