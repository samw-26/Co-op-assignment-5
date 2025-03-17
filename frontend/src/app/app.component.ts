import { Component } from '@angular/core';
import { TableComponent } from './table/table.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
	<router-outlet></router-outlet>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
	title='routing-app'
}