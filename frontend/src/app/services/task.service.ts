import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NewTask, Task } from '../models/task.model';

/**
 * Accès à l'API REST Symfony des tâches.
 * Les composants affichent, le service gère les données.
 *
 * Contrat d'API :
 *  GET    /api/tasks        → 200 Task[]
 *  GET    /api/tasks/{id}   → 200 Task · 404
 *  POST   /api/tasks        → 201 Task · 422
 *  PATCH  /api/tasks/{id}   → 200 Task · 404 · 422
 *  DELETE /api/tasks/{id}   → 204 · 404
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: NewTask): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, changes: Partial<NewTask>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, changes);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
