import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TableComponent } from './table/table.component';
import { DetailsComponent } from './details/details.component';

export const routes: Routes = [
	{
		path: ':id',
		component: DetailsComponent,
		title: 'Details'
	},
	{
		path: '',
		component: TableComponent,
		title: 'Main',
	},
];
