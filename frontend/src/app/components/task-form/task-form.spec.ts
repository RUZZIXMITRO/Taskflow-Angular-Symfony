import { TestBed } from '@angular/core/testing';
import { NewTask } from '../../models/task.model';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  function setup() {
    const fixture = TestBed.createComponent(TaskForm);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('est invalide si le titre fait moins de 3 caractères', () => {
    const { component } = setup();
    component.form.controls.title.setValue('ab');
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.title.hasError('minlength')).toBe(true);
  });

  it('est valide avec un titre de 3 caractères ou plus', () => {
    const { component } = setup();
    component.form.controls.title.setValue('abc');
    expect(component.form.valid).toBe(true);
  });

  it('a « medium » comme priorité par défaut', () => {
    const { component } = setup();
    expect(component.form.controls.priority.value).toBe('medium');
  });

  it('désactive le bouton et affiche une erreur après interaction', async () => {
    const { fixture, component, el } = setup();
    component.form.controls.title.setValue('ab');
    component.form.controls.title.markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(el.querySelector<HTMLButtonElement>('button[type=submit]')?.disabled).toBe(true);
    expect(el.querySelector('.error')?.textContent).toContain('3 caractères minimum');
  });

  it("n'émet rien si le formulaire est invalide, émet les données sinon", () => {
    const { component } = setup();
    const emitted: NewTask[] = [];
    component.saved.subscribe((t) => emitted.push(t));

    component.save();
    expect(emitted.length).toBe(0);

    component.form.patchValue({ title: '  Réviser Angular ', priority: 'high', dueDate: '2026-12-01' });
    component.save();
    expect(emitted).toEqual([
      { title: 'Réviser Angular', description: null, priority: 'high', dueDate: '2026-12-01', completed: false },
    ]);
  });
});
