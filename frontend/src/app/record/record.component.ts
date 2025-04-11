import { CommonModule } from '@angular/common';
import { Component, Input, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {/*  DuplicateKeyValidatorDirective, */ Validation } from '../validation';
import { CheckConstraint, Schema, SubmitInfo } from '../interfaces';
import { forkJoin, Observable, lastValueFrom } from 'rxjs';
import { TableService } from '../table.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DeleteDialog } from '../details/delete.dialog.component';
import { MatButton } from '@angular/material/button';
import { randexp } from 'randexp';

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
    ids!: {[index: string]: string};
	@Input({required: true}) title!: string;
	@Input({required: true}) currentTableType!: TableType;

	record: { [index: string]: any } = {};
    placeholders: { [index: string]: string } = {}
	tableHeaders: string[] = [];
	tableSchema!: Schema[];
	checkConstraints!: CheckConstraint[];
	recordForm = viewChild.required<NgForm>("recordForm");
	validators!: Validation;

	constructor(public tblservice: TableService, private dialog: MatDialog, private router: Router, private routeParams: ActivatedRoute) {
		this.tableInfo.set(TableType.Details, this.detailsSubmitInfo);
		this.tableInfo.set(TableType.Insert, this.insertSubmitInfo);
	}

	ngOnInit() {
        this.routeParams.params.subscribe(params => this.tblservice.tableName = params['table']);
        this.routeParams.queryParams.subscribe(queryParams => this.ids = queryParams);
		let observables: {[index: string]: Observable<any>} = {
			table: this.tblservice.fetchTable(),
			pKeys: this.tblservice.getPks(),
			schema: this.tblservice.getSchema(),
			checkConstraints: this.tblservice.getCheckConstraints()
		}
		if (Object.keys(this.ids).length) observables['record'] = this.tblservice.getRecord(this.ids);

		forkJoin(observables).subscribe({
			next: ({ table, record, pKeys, schema, checkConstraints }) => {
                this.tableSchema = schema;
                this.checkConstraints = checkConstraints;
                this.validators = new Validation(this.tableSchema, this.checkConstraints, this.recordForm(), {records: table, pKeys: pKeys});
                if (record) { // Details page
                    let promises = [];
                    for (let key in record) {
                        promises.push(new Promise<void>(resolve => {
                            this.tblservice.isIdentity(key).subscribe(identity => {
                                if (identity) delete record[key];
                                resolve();
                            });
                        }));
                    }
                    Promise.all(promises).then(() => {
                        this.record = record;
                        this.tableHeaders = Object.keys(record);
                        this.tableHeaders.forEach(this.createPlaceHolder, this);
                    });
                }
                else { // Insert page
                    schema.forEach((c: Schema) => {
                        this.tblservice.isIdentity(c.COLUMN_NAME).subscribe(identity => {
                            if (!identity) this.tableHeaders.push(c.COLUMN_NAME);
                            this.record[c.COLUMN_NAME] = null;
                            this.createPlaceHolder(c.COLUMN_NAME);
                        });
                    });
                }
                
			},
			error: e => console.error(e)
		}
		);	
	}

    
    createPlaceHolder(col: string) {
        this.tableHeaders.forEach(col => {
            let pattern = this.validators.getPattern(col);
            this.placeholders[col] = pattern == this.validators.defaultPattern ? '' : randexp(pattern);
        });
    }

	getSubmitInfo(): SubmitInfo | undefined {
		return this.tableInfo.get(this.currentTableType)
	}

	onUpdate(): void {
		if (this.recordForm().valid) {
			this.validators.correctDataTypes(this.record);
			this.tblservice.updateRecord(this.ids, this.record).subscribe({
                next: () => this.router.navigateByUrl(""),
                error: e => console.error(e.error)
            });
		}
	}
	
	onDelete(): void {
		const dialogRef = this.dialog.open(DeleteDialog);
		dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.tblservice.deleteRecord(this.ids).subscribe(() => {
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
				error: e => console.error(e.error)
			});
		}
	}

}
