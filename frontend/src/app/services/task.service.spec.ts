import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NewTask, Task } from '../models/task.model';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;

  const newTask: NewTask = { title: 'Lire le cours', completed: false, priority: 'high', dueDate: '2026-11-15' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  // Aucune requête inattendue
  afterEach(() => http.verify());

  it('crée une tâche via POST /api/tasks avec le bon corps', () => {
    let result: Task | undefined;
    service.createTask(newTask).subscribe((t) => (result = t));

    const req = http.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTask);

    req.flush({ id: 1, ...newTask }, { status: 201, statusText: 'Created' });
    expect(result?.id).toBe(1);
  });

  it('liste les tâches via GET /api/tasks', () => {
    service.getTasks().subscribe();
    const req = http.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('modifie une tâche via PATCH /api/tasks/{id}', () => {
    service.updateTask(7, { completed: true }).subscribe();
    const req = http.expectOne('/api/tasks/7');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ completed: true });
    req.flush({ id: 7, ...newTask, completed: true });
  });

  it('supprime une tâche via DELETE /api/tasks/{id}', () => {
    service.deleteTask(7).subscribe();
    const req = http.expectOne('/api/tasks/7');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it("n'envoie aucune requête sans subscribe()", () => {
    service.getTasks(); // pas d'abonnement
    http.expectNone('/api/tasks');
  });
});
