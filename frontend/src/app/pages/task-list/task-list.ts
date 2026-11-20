import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, interval } from 'rxjs';
import { Modal } from '../../components/modal/modal';
import { TaskCard } from '../../components/task-card/task-card';
import { PRIORITY_LABELS, Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { filterTasks, PriorityFilter, StatusFilter } from './task-filter';

/** Rafraîchissement automatique de la liste (ms). */
export const REFRESH_INTERVAL = 30_000;

@Component({
  selector: 'app-task-list',
  imports: [FormsModule, RouterLink, TaskCard, Modal],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList implements OnInit {
  private taskService = inject(TaskService);
  private destroyRef = inject(DestroyRef);

  // État
  tasks = signal<Task[]>([]);
  loading = signal(false);
  error = signal('');
  actionError = signal('');
  toDelete = signal<Task | null>(null);

  // Critères de filtre (liés aux champs via [(ngModel)])
  query = signal('');
  priority = signal<PriorityFilter>('all');
  status = signal<StatusFilter>('all');
  readonly priorityLabels = PRIORITY_LABELS;

  // État dérivé : jamais stocké deux fois
  filteredTasks = computed(() =>
    filterTasks(this.tasks(), { query: this.query(), priority: this.priority(), status: this.status() }),
  );
  count = computed(() => this.tasks().length);
  remaining = computed(() => this.tasks().filter((t) => !t.completed).length);

  /**
   * ngOnInit : appelé une seule fois, quand le composant est prêt.
   * C'est ici qu'on déclenche la requête HTTP (et pas dans le constructor,
   * réservé à l'injection des dépendances).
   */
  ngOnInit(): void {
    console.log('[TaskList] ngOnInit → chargement des tâches');
    this.loadTasks();

    // Flux infini : arrêté automatiquement à la destruction du composant (pas de fuite)
    interval(REFRESH_INTERVAL)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTasks(true));
  }

  loadTasks(silent = false): void {
    if (!silent) this.loading.set(true);
    this.error.set('');
    this.taskService
      .getTasks()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (tasks) => this.tasks.set(tasks),
        error: () => this.error.set('Échec du chargement des tâches.'),
      });
  }

  toggle(task: Task): void {
    this.actionError.set('');
    this.taskService.updateTask(task.id, { completed: !task.completed }).subscribe({
      next: (updated) => this.tasks.update((items) => items.map((t) => (t.id === updated.id ? updated : t))),
      error: () => this.actionError.set(`Impossible de mettre à jour « ${task.title} ».`),
    });
  }

  confirmDelete(): void {
    const task = this.toDelete();
    if (!task) return;
    this.toDelete.set(null);
    this.actionError.set('');
    this.taskService.deleteTask(task.id).subscribe({
      next: () => this.tasks.update((items) => items.filter((t) => t.id !== task.id)),
      error: () => this.actionError.set(`Impossible de supprimer « ${task.title} ».`),
    });
  }

  resetFilters(): void {
    this.query.set('');
    this.priority.set('all');
    this.status.set('all');
  }
}
