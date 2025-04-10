import { CommonModule } from '@angular/common';
import { Component, Input, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DuplicateKeyValidatorDirective, Validation } from '../validation';
import { authors_columns, CheckConstraint, Schema, SubmitInfo } from '../interfaces';
import { authors_placeholders } from '../../placeholders';
import { forkJoin, Observable } from 'rxjs';
import { TableService } from '../table.service';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { pageNotFound } from '../app.routes';
import { DeleteDialog } from '../details/delete.dialog.component';
import { MatButton } from '@angular/material/button';

export enum TableType {
	Details = 'details',
	Insert = 'insert'
}

@Component({
  selector: 'app-record',
  imports: [CommonModule, FormsModule, MatButton, RouterLink, DuplicateKeyValidatorDirective],
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


	@Input() id!: string;
	@Input({required: true}) title!: string;
	@Input({required: true}) currentTableType!: TableType;

	record: { [index: string]: any } = {};
	tableHeaders: string[] = [];
	tablePKey!: string;
	tableSchema!: Schema[];
	checkConstraints!: CheckConstraint[];

	recordForm = viewChild.required<NgForm>("recordForm");
	validators!: Validation;
	//placeholders: authors_columns = authors_placeholders;
	
	constructor(private tblservice: TableService, private dialog: MatDialog, private router: Router) {
		this.tableInfo.set(TableType.Details, this.detailsSubmitInfo);
		this.tableInfo.set(TableType.Insert, this.insertSubmitInfo);
	}

	ngOnInit() {
		let observables: {[index: string]: Observable<any>} = {
			table: this.tblservice.fetchTable(),
			pkey: this.tblservice.getPks(),
			schema: this.tblservice.getSchema(),
			checkConstraints: this.tblservice.getCheckConstraints()
		}
		if (this.id) observables['record'] = this.tblservice.getRecord(this.id);

		forkJoin(observables).subscribe({
			next: ({ table, record, pkey, schema, checkConstraints }) => {
				if (table && pkey && schema && checkConstraints) {
					this.tableSchema = schema;
					this.tablePKey = pkey.COLUMN_NAME;
					this.checkConstraints = checkConstraints;
					this.validators = new Validation(this.tableSchema, this.checkConstraints, this.recordForm(), {records: table, pkey: this.tablePKey});
					if (record) {
						this.record = record;
						this.tableHeaders = Object.keys(this.record);
					}
					else {
						schema.forEach((c: Schema) => {
							this.tableHeaders.push(c.COLUMN_NAME);
						});
						this.tableHeaders.forEach(col => {
							this.record[col] = null;
						});
					}
				}
				else {
					this.router.navigateByUrl(pageNotFound);
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
			console.log(this.record);
			this.validators.correctDataTypes(this.record);
			this.tblservice.updateRecord(this.id, this.record).subscribe(() => {
				this.router.navigateByUrl("");
			});
		}
	}
	
	onDelete(): void {
		const dialogRef = this.dialog.open(DeleteDialog, {
			data: { id: this.record[this.tablePKey] }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.tblservice.deleteRecord(this.id).subscribe(() => {
					this.router.navigateByUrl("/");
				});
			}
		});
	}

	onInsert(): void {
		if (this.recordForm().valid) {
			this.validators.correctDataTypes(this.record);
			this.tblservice.insertRecord(this.record).subscribe({
				next: () => this.router.navigateByUrl(""),
				error: e => console.log(e.error)
			});
		}
	}

}
