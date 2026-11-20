import { Priority, Task } from '../../models/task.model';

export type PriorityFilter = 'all' | Priority;
export type StatusFilter = 'all' | 'active' | 'completed';

export interface TaskFilters {
  query: string;
  priority: PriorityFilter;
  status: StatusFilter;
}

/** Fonction pure (facile à tester) : filtre par titre, priorité et statut. */
export function filterTasks(tasks: Task[], { query, priority, status }: TaskFilters): Task[] {
  const q = query.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) &&
      (priority === 'all' || t.priority === priority) &&
      (status === 'all' || (status === 'completed' ? t.completed : !t.completed)),
  );
}
