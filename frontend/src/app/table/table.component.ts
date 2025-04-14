import { Component } from '@angular/core';
import { CommonModule} from '@angular/common';
import { TableService } from '../table.service';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';


@Component({
	selector: 'app-table',
	imports: [CommonModule, RouterLink, MatButtonModule, ReactiveFormsModule],
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss'
})
export class TableComponent {
    tables: string[] = [];
	tableNameSelect = new FormControl('');
	tableRows!: { [index: string]: string }[];
    filteredRows!: { [index: string]: string }[];
	tableHeaders!: string[];
    pKeys: string[] = [];

	constructor(public tblservice: TableService) {}

    filterRows(target: EventTarget | null) {
        if (!target) return;
        let input = target as HTMLInputElement;
        let query = input.value;
        if (query === '') {this.filteredRows = this.tableRows; return}
        this.filteredRows = this.tableRows.filter((row) => {
            for (let colVal of Object.values(row)) {
                if (colVal === null) continue;
                colVal=String(colVal);
                if (colVal.toLowerCase().includes(query.toLowerCase())) return true;
            }
            return false;
        });
    }

    getRecordRoute(row: { [index: string]: string }): string {
        let route: string = `${this.tblservice.tableName}/`;
        Object.entries(row).forEach(col => {
            if (this.pKeys.includes(col[0])) {
                route += route.endsWith('/') ? '?' : '&';
                route += `${col[0]}=${col[1]}`;
            }
        });
        return route;
    }

    getQueryParams(row: { [index: string]: string }): {[index: string]: string} {
        let params: {[index: string]: string} = {};
        Object.entries(row).forEach(col => {
            if (this.pKeys.includes(col[0])) {
                params[col[0]] = col[1];
            }
        });
        return params;
    }

    selectValidator(): ValidatorFn {
        return (): ValidationErrors | null => {
            return this.tables.includes(this.tableNameSelect.value ?? '') ? null : {InvalidValue: {value: this.tableNameSelect.value}}; 
        };
    }

    onTableChange() {
        if (!this.tableNameSelect.valid) {console.log("not valid"); return;}
        this.tblservice.tableName = this.tableNameSelect.value ?? '';
        this.loadTable();
    }

    loadTable() {
        forkJoin({
            rows: this.tblservice.fetchTable(),
            pkeys: this.tblservice.getPks(),
        }).subscribe({
            next: ({rows, pkeys}) => {
                this.tableHeaders = Object.keys(rows[0]);
                this.tableRows = this.filteredRows = rows;
                this.pKeys = pkeys;
            },
            error: (e) => {
                Promise.reject(e);
            }
        });
    }

	async ngOnInit() {
        await new Promise<void>((resolve, reject) => {
            this.tblservice.getTables().subscribe({
                next: (tablesObj) => {
                    if (!this.tblservice.tableName) this.tblservice.tableName = tablesObj[0].TABLE_NAME;
                    this.tableNameSelect.setValue(this.tblservice.tableName);
                    let newTables: string[] = tablesObj.map(e => e.TABLE_NAME);
                    this.tables = newTables;
                    resolve();
                },
                error: (e) => {
                    reject(e);
                }
            });
        })
        .then(() => {
            this.loadTable();
        })
        .catch((e) => {
            console.error(e);
        });
	}
}

