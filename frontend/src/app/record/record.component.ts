import { CommonModule } from '@angular/common';
import { Component, Input, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {/*  DuplicateKeyValidatorDirective, */ Validation } from '../validation';
import { CheckConstraint, Schema, SubmitInfo } from '../interfaces';
import { forkJoin, Observable } from 'rxjs';
import { TableService } from '../table.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { pageNotFound } from '../app.routes';
import { DeleteDialog } from '../details/delete.dialog.component';
import { MatButton } from '@angular/material/button';

export enum TableType {
	Details = 'details',
	Insert = 'insert'
}

@Component({
  selector: 'app-record',
  imports: [CommonModule, FormsModule, MatButton, RouterLink, /* DuplicateKeyValidatorDirective */],
  templateUrl: './record.component.html',
  styleUrl: './record.component.scss'
})
export class RecordComponent {
	readonly TableType = TableType // Allow access of enum in template.
	readonly detailsSubmitInfo: SubmitInfo = {
		name: 'Update',
		submitFunction: this.onUpdate.bind(this),
	}
	readonly insertSubmitInfo: SubmitInfo = {
		name: 'Insert',
		submitFunction: this.onInsert.bind(this)
	}
	tableInfo: Map<TableType, SubmitInfo> = new Map()

    table!: string;
	id!: string;
	@Input({required: true}) title!: string;
	@Input({required: true}) currentTableType!: TableType;

	record: { [index: string]: any } = {};
	tableHeaders: string[] = [];
	tableSchema!: Schema[];
	checkConstraints!: CheckConstraint[];

	recordForm = viewChild.required<NgForm>("recordForm");
	validators!: Validation;
	//placeholders: authors_columns = authors_placeholders;
	
	constructor(public tblservice: TableService, private dialog: MatDialog, private router: Router, private test: ActivatedRoute) {
		this.tableInfo.set(TableType.Details, this.detailsSubmitInfo);
		this.tableInfo.set(TableType.Insert, this.insertSubmitInfo);
	}

	ngOnInit() {
        this.test.params.subscribe(params => {
            this.id = params['id'];
            this.tblservice.tableName = params['table'];
        });
		let observables: {[index: string]: Observable<any>} = {
			table: this.tblservice.fetchTable(),
			pKeys: this.tblservice.getPks(),
			schema: this.tblservice.getSchema(),
			checkConstraints: this.tblservice.getCheckConstraints()
		}
		if (this.id) observables['record'] = this.tblservice.getRecord(this.id);

		forkJoin(observables).subscribe({
			next: ({ table, record, pKeys, schema, checkConstraints }) => {
                this.tableSchema = schema;
                this.tblservice.pKeys = pKeys;
                this.checkConstraints = checkConstraints;
                this.validators = new Validation(this.tableSchema, this.checkConstraints, this.recordForm(), {records: table, pKeys: this.tblservice.pKeys});
                if (record) { // Details page
                    this.record = record;
                    this.tableHeaders = Object.keys(this.record);
                    console.log('record:', this.record);
                }
                else { // Insert page
                    schema.forEach((c: Schema) => {
                        this.tableHeaders.push(c.COLUMN_NAME);
                    });
                    this.tableHeaders.forEach(col => {
                        this.record[col] = null;
                    });
                }
			},
			error: e => this.router.navigateByUrl(pageNotFound)
		}
		);	
	}

	getSubmitInfo(): SubmitInfo | undefined {
		return this.tableInfo.get(this.currentTableType)
	}

	onUpdate(): void {
		if (this.recordForm().valid) {
			this.validators.correctDataTypes(this.record);
			this.tblservice.updateRecord(this.record).subscribe({
                next: () => this.router.navigateByUrl(""),
                error: e => console.error(e.error)
            });
		}
	}
	
	onDelete(): void {
		// const dialogRef = this.dialog.open(DeleteDialog, {
		// 	data: { id: this.record[this.tblservice.pKeys] }
		// });
		// dialogRef.afterClosed().subscribe(confirmed => {
        //     if (confirmed) {
        //         this.tblservice.deleteRecord(this.id).subscribe(() => {
        //             this.router.navigateByUrl("/");
        //         });
        //     }
        // });
	}

	onInsert(): void {
		if (this.recordForm().valid) {
			this.validators.correctDataTypes(this.record);
			this.tblservice.insertRecord(this.record).subscribe({
				next: () => this.router.navigateByUrl(""),
				error: e => console.error(e.error)
			});
		}
	}

}
