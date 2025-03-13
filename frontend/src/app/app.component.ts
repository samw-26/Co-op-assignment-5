import { Component } from '@angular/core';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'app-root',
  imports: [TableComponent],
  template: `
	<h1>First Angular App</h1>
	<app-table></app-table>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
}