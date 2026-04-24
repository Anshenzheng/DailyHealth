import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar *ngIf="isLoggedIn"></app-navbar>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
