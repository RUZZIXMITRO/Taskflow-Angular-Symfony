import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Modal } from '../../components/modal/modal';
import { PRIORITY_LABELS, Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-detail',
  imports: [RouterLink, DatePipe, Modal],
  templateUrl: './task-detail.html',
})
export class TaskDetail implements OnInit {
  private taskService = inject(TaskService);
  private router = inject(Router);

  /** Paramètre :id de la route (withComponentInputBinding). */
  id = input.required<string>();

  task = signal<Task | null>(null);
  loading = signal(false);
  error = signal('');
  notFound = signal(false);
  confirmOpen = signal(false);
  readonly priorityLabels = PRIORITY_LABELS;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.taskService
      .getTask(Number(this.id()))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (t) => this.task.set(t),
        error: (err: HttpErrorResponse) =>
          err.status === 404 ? this.notFound.set(true) : this.error.set('Échec du chargement de la tâche.'),
      });
  }

  toggle(): void {
    const t = this.task();
    if (!t) return;
    this.taskService.updateTask(t.id, { completed: !t.completed }).subscribe({
      next: (updated) => this.task.set(updated),
      error: () => this.error.set('Impossible de mettre à jour la tâche.'),
    });
  }

  remove(): void {
    const t = this.task();
    if (!t) return;
    this.confirmOpen.set(false);
    this.taskService.deleteTask(t.id).subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: () => this.error.set('Impossible de supprimer la tâche.'),
    });
  }
}
