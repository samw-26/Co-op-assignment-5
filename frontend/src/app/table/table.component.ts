import { Component, inject } from '@angular/core';
import { CommonModule} from '@angular/common';
import { TableService } from '../table.service';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

export let tableName: string = "authors";

@Component({
	selector: 'app-table',
	imports: [CommonModule, RouterLink, MatButtonModule, FormsModule],
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss'
})
export class TableComponent {
    tables: string[] = [];
	tableName: string = tableName;
	tableRows!: { [index: string]: string }[];
	tableHeaders!: string[];
	tablePKey!: string;

	constructor(private tblservice: TableService, private router: Router) {}

	ngOnInit(): void {
        
		forkJoin({
			rows: this.tblservice.fetchTable(tableName),
			pkey: this.tblservice.getPkName(tableName),
            tablesObj: this.tblservice.getTables(),
		}).subscribe({
			next: ({rows, pkey, tablesObj}) => {
                this.tableHeaders = Object.keys(rows[0]);
                this.tableRows = rows;
                this.tablePKey = pkey['COLUMN_NAME'];

                tablesObj.forEach(table => {
                    this.tables.push(table.TABLE_NAME);
                });
			},
			error: (e) => {
				this.router.navigateByUrl("");
			}
		});
	}
}

