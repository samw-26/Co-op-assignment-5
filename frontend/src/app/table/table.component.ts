import { Component, inject } from '@angular/core';
import { CommonModule} from '@angular/common';
import { TableService } from './table.service';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-table',
	imports: [CommonModule, RouterLink],
	templateUrl: './table.component.html',
	styleUrl: './table.component.css'
})
export class TableComponent {
	table_name: string = 'authors';
	table_rows!: { [index: string]: string }[];
	table_headers!: string[];
	table_pkey!: string;

	constructor(private tblservice: TableService) {}

	ngOnInit(): void {
		this.tblservice.fetchTable(this.table_name).subscribe(rows => {
			this.table_headers = Object.keys(rows[0]);
			this.table_rows = rows;
		});
		this.tblservice.getPkName(this.table_name).subscribe(data => {
			this.table_pkey = data['COLUMN_NAME'];
		});
	}
}
