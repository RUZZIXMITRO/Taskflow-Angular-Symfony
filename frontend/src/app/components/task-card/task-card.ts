import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRIORITY_LABELS, Task } from '../../models/task.model';

/** Carte d'une tâche : reçoit la tâche (input) et remonte les actions (output). */
@Component({
  selector: 'app-task-card',
  imports: [RouterLink, DatePipe, UpperCasePipe],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  task = input.required<Task>();
  toggled = output<Task>();
  deleted = output<Task>();

  priorityLabel = computed(() => PRIORITY_LABELS[this.task().priority]);

  isOverdue = computed(() => {
    const t = this.task();
    if (!t.dueDate || t.completed) return false;
    return t.dueDate < new Date().toISOString().slice(0, 10);
  });
}
