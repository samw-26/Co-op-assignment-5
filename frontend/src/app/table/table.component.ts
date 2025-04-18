import { Component, ViewChild } from '@angular/core';
import { CommonModule} from '@angular/common';
import { TableService } from '../table.service';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatSelectModule} from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';


@Component({
	selector: 'app-table',
	imports: [
            CommonModule, RouterLink, MatButtonModule, 
            ReactiveFormsModule, MatTableModule, MatPaginatorModule,
            MatSortModule, MatSelectModule, MatInputModule
        ],
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss'
})
export class TableComponent {
    tables: string[] = [];
	tableNameSelect = new FormControl('');
	tableRows!: { [index: string]: string }[];
    filteredRows = new MatTableDataSource<{[index: string]: any}>([]);
	tableHeaders!: string[];
    pKeys: string[] = [];

    @ViewChild(MatTable) table!: MatTable<{[index: string]: any}>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

	constructor(public tblservice: TableService) {}

    
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

    ngAfterViewInit() {
        this.filteredRows.paginator = this.paginator;
        this.filteredRows.sort = this.sort;
    }

    filterRows(target: EventTarget | null) {
        if (!target) return;
        let input = target as HTMLInputElement;
        let query = input.value;
        if (query === '') {this.filteredRows.data = this.tableRows; return}
        this.filteredRows.data = this.tableRows.filter((row) => {
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
                this.tableRows = this.filteredRows.data = rows;
                this.pKeys = pkeys;
            },
            error: (e) => {
                Promise.reject(e);
            }
        });
    }
}

