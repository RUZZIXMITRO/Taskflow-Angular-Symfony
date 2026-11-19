import { Component, input, output } from '@angular/core';

/**
 * Modale réutilisable : le parent projette un titre ([modal-title]),
 * un contenu (par défaut) et des actions ([modal-actions]) avec ng-content.
 */
@Component({
  selector: 'app-modal',
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `
    @if (open()) {
      <div class="backdrop" (click)="closed.emit()"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div id="modal-title" class="modal__title">
          <ng-content select="[modal-title]" />
        </div>
        <div class="modal__body">
          <ng-content />
        </div>
        <div class="modal__actions">
          <ng-content select="[modal-actions]" />
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop { position: fixed; inset: 0; background: rgb(15 23 42 / 0.45); z-index: 10; }
    .modal {
      position: fixed; z-index: 11; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: min(92vw, 440px); background: var(--surface); border-radius: var(--radius);
      padding: 1.5rem; box-shadow: 0 20px 50px rgb(0 0 0 / 0.25);
    }
    .modal__title { font-size: 1.15rem; font-weight: 600; margin-bottom: .5rem; }
    .modal__body { color: var(--text-muted); }
    .modal__actions { display: flex; justify-content: flex-end; gap: .5rem; margin-top: 1.25rem; }
  `,
})
export class Modal {
  open = input(false);
  closed = output<void>();

  onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
