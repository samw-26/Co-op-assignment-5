import { Component, inject } from '@angular/core';
import { CommonModule} from '@angular/common';
import { TableService } from '../table.service';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { routes } from '../app.routes';

export const tableName: string = "authors";

@Component({
	selector: 'app-table',
	imports: [CommonModule, RouterLink, MatButtonModule],
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss'
})
export class TableComponent {
	tableRows!: { [index: string]: string }[];
	tableHeaders!: string[];
	tablePKey!: string;
	tableName: string = tableName;
	constructor(private tblservice: TableService, private router: Router) {}

	ngOnInit(): void {
		forkJoin({
			rows: this.tblservice.fetchTable(tableName),
			pkey: this.tblservice.getPkName(tableName)
		}).subscribe({
			next: ({rows, pkey}) => {
				if (rows && pkey) {
					this.tableHeaders = Object.keys(rows[0]);
					this.tableRows = rows;
					this.tablePKey = pkey['COLUMN_NAME'];
				}
			},
			error: (e) => {
				this.router.navigateByUrl("");
			}
		});
	}
}

