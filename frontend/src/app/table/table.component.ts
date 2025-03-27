import { Component, inject } from '@angular/core';
import { CommonModule} from '@angular/common';
import { TableService } from './table.service';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { routes } from '../app.routes';

@Component({
	selector: 'app-table',
	imports: [CommonModule, RouterLink, MatButtonModule],
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss'
})
export class TableComponent {
	tableName: string = 'authors';
	tableRows!: { [index: string]: string }[];
	tableHeaders!: string[];
	tablePKey!: string;
	
	constructor(private tblservice: TableService) {}

	ngOnInit(): void {
		forkJoin({
			rows: this.tblservice.fetchTable(this.tableName),
			pkey: this.tblservice.getPkName(this.tableName)
		}).subscribe(({rows, pkey}) => {
			this.tableHeaders = Object.keys(rows[0]);
			this.tableRows = rows;
			this.tablePKey = pkey['COLUMN_NAME'];
		});
	}
}
