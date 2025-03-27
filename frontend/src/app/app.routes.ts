import { Routes } from '@angular/router';
import { TableComponent } from './table/table.component';
import { DetailsComponent } from './details/details.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const pageNotFound = "error/404"
export const routes: Routes = [
	{
		path: pageNotFound,
		component: PageNotFoundComponent,
		title: "404 Page Not Found"
	},
	{
		path: ":id",
		component: DetailsComponent,
		title: "Details"
	},
	{
		path: "",
		component: TableComponent,
		title: "Main",
	},
	{
		path: "**",
		redirectTo: pageNotFound
	}
];
