import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Task } from '../../models/task.model';
import { filterTasks } from './task-filter';
import { TaskList } from './task-list';

const TASKS: Task[] = [
  { id: 1, title: 'Lire le cours Angular', completed: false, priority: 'high' },
  { id: 2, title: 'Installer le CLI', completed: true, priority: 'low' },
  { id: 3, title: 'Créer TaskFlow', completed: false, priority: 'medium' },
];

describe('filterTasks', () => {
  it('filtre par titre (insensible à la casse)', () => {
    const r = filterTasks(TASKS, { query: 'ANGULAR', priority: 'all', status: 'all' });
    expect(r.map((t) => t.id)).toEqual([1]);
  });

  it('filtre par priorité', () => {
    const r = filterTasks(TASKS, { query: '', priority: 'low', status: 'all' });
    expect(r.map((t) => t.id)).toEqual([2]);
  });

  it('filtre terminées / non terminées', () => {
    expect(filterTasks(TASKS, { query: '', priority: 'all', status: 'completed' }).map((t) => t.id)).toEqual([2]);
    expect(filterTasks(TASKS, { query: '', priority: 'all', status: 'active' }).map((t) => t.id)).toEqual([1, 3]);
  });
});

describe('TaskList', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function createWithTasks(tasks: Task[]) {
    const fixture = TestBed.createComponent(TaskList);
    fixture.detectChanges(); // ngOnInit → GET /api/tasks
    http.expectOne('/api/tasks').flush(tasks);
    fixture.detectChanges();
    return fixture;
  }

  it('computed() renvoie les bonnes tâches quand un critère change', () => {
    const fixture = createWithTasks(TASKS);
    const list = fixture.componentInstance;
    expect(list.filteredTasks().length).toBe(3);

    list.priority.set('high');
    expect(list.filteredTasks().map((t) => t.id)).toEqual([1]);

    list.priority.set('all');
    list.status.set('active');
    list.query.set('task');
    expect(list.filteredTasks().map((t) => t.id)).toEqual([3]);
    fixture.destroy();
  });

  it('affiche le message vide quand il n’y a aucune tâche', () => {
    const fixture = createWithTasks([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aucune tâche pour l’instant');
    fixture.destroy();
  });

  it('affiche une erreur et un bouton Réessayer en cas d’échec', () => {
    const fixture = TestBed.createComponent(TaskList);
    fixture.detectChanges();
    http.expectOne('/api/tasks').flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Échec du chargement');
    expect(el.querySelector('.alert button')?.textContent).toContain('Réessayer');
    fixture.destroy();
  });
});
