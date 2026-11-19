import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewTask, Priority, PRIORITY_LABELS, Task } from '../../models/task.model';

/**
 * Formulaire réactif de création / modification.
 * Il ne parle pas à l'API : il émet les données valides, la page parente les enregistre.
 */
@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm {
  /** Tâche à modifier (absente = création). */
  task = input<Task | null>(null);
  submitting = input(false);
  submitLabel = input('Ajouter');
  saved = output<NewTask>();

  readonly priorities = Object.entries(PRIORITY_LABELS) as [Priority, string][];

  form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }),
    priority: new FormControl<Priority>('medium', { nonNullable: true, validators: [Validators.required] }),
    dueDate: new FormControl('', { nonNullable: true }),
    completed: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    // Pré-remplit le formulaire quand la tâche à modifier arrive.
    effect(() => {
      const t = this.task();
      if (t) {
        this.form.reset({
          title: t.title,
          description: t.description ?? '',
          priority: t.priority,
          dueDate: t.dueDate ?? '',
          completed: t.completed,
        });
      }
    });
  }

  get title() {
    return this.form.controls.title;
  }

  showError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saved.emit({
      title: v.title.trim(),
      description: v.description.trim() || null,
      priority: v.priority,
      dueDate: v.dueDate || null,
      completed: v.completed,
    });
    if (!this.task()) this.form.reset();
  }
}
