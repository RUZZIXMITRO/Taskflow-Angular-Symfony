import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { TaskForm } from '../../components/task-form/task-form';
import { NewTask, Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

/** Page de création (/tasks/new) et de modification (/tasks/:id/edit). */
@Component({
  selector: 'app-task-editor',
  imports: [TaskForm, RouterLink],
  template: `
    <a routerLink="/tasks" class="back">← Retour à la liste</a>
    <div class="panel">
      <h2>{{ isEdit() ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h2>

      @if (loading()) {
        <p class="state" role="status"><span class="spinner"></span> Chargement…</p>
      } @else {
        @if (error()) {
          <p class="alert alert--error" role="alert">{{ error() }}</p>
        }
        @if (!isEdit() || task()) {
          <app-task-form
            [task]="task()"
            [submitting]="submitting()"
            [submitLabel]="isEdit() ? 'Enregistrer' : 'Ajouter'"
            (saved)="save($event)" />
        }
      }
    </div>
  `,
})
export class TaskEditor implements OnInit {
  private taskService = inject(TaskService);
  private router = inject(Router);

  /** :id de la route, absent en création. */
  id = input<string>();
  isEdit = computed(() => !!this.id());

  task = signal<Task | null>(null);
  loading = signal(false);
  submitting = signal(false);
  error = signal('');

  ngOnInit(): void {
    if (!this.isEdit()) return;
    this.loading.set(true);
    this.taskService
      .getTask(Number(this.id()))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (t) => this.task.set(t),
        error: (err: HttpErrorResponse) =>
          this.error.set(err.status === 404 ? 'Cette tâche n’existe pas.' : 'Échec du chargement.'),
      });
  }

  save(data: NewTask): void {
    this.submitting.set(true);
    this.error.set('');
    const request$: Observable<Task> = this.isEdit()
      ? this.taskService.updateTask(Number(this.id()), data)
      : this.taskService.createTask(data);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (t) => this.router.navigate(['/tasks', t.id]),
      error: (err: HttpErrorResponse) => this.error.set(this.messageFor(err)),
    });
  }

  private messageFor(err: HttpErrorResponse): string {
    if (err.status === 422 && err.error?.errors) {
      // Erreurs de validation renvoyées par Symfony : { errors: { champ: message } }
      return Object.values(err.error.errors as Record<string, string>).join(' ');
    }
    return 'L’enregistrement a échoué. Réessayez.';
  }
}
