import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Validation } from '../validation';
import { CheckConstraint, Schema, SubmitInfo } from '../interfaces';
import { forkJoin, Observable } from 'rxjs';
import { TableService } from '../table.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DeleteDialog } from '../details/delete.dialog.component';
import { randexp } from 'randexp';
import { MatDialog } from '@angular/material/dialog';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatFormField, MatInputModule } from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { HttpErrorResponse } from '@angular/common/http';

export enum TableType {
	Details = 'details',
	Insert = 'insert'
}

@Component({
  selector: 'app-record',
  imports: [CommonModule, FormsModule, MatButton, RouterLink, 
            MatTableModule, MatInputModule, MatFormFieldModule,
            MatCheckboxModule,],
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

    ids!: {[index: string]: string};
	@Input({required: true}) title!: string;
	@Input({required: true}) currentTableType!: TableType;
    @ViewChild(MatTable) table!: MatTable<{[index: string]: any}>;

	record = new MatTableDataSource<{[index: string]: any}>([{}]);
    placeholders: { [index: string]: string } = {}
	tableHeaders: string[] = [];
	tableSchema!: Schema[];
	checkConstraints!: CheckConstraint[];
	recordForm = viewChild.required<NgForm>("recordForm");
	validators!: Validation;
    submitError: string = "";

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
                    let promises: Promise<void>[] = [];
                    for (let key in record) {
                        promises.push(new Promise<void>(resolve => {
                            this.tblservice.isIdentity(key).subscribe(identity => {
                                if (identity) delete record[key];
                                resolve();
                            });
                        }));
                    }
                    Promise.all(promises).then(() => {
                        this.record.data[0] = record;
                        this.tableHeaders = Object.keys(record);
                        this.tableHeaders.forEach(this.createPlaceHolder, this);
                    });
                }
                else { // Insert page
                    let tempHeaders = schema.map((e: Schema) => e.COLUMN_NAME);
                    let promises: Promise<void>[] = [];
                    tempHeaders.forEach((e: string) => {
                        promises.push(new Promise<void>(resolve => {
                            this.tblservice.isIdentity(e).subscribe(identity => {
                                if (identity) {
                                    tempHeaders.splice(tempHeaders.findIndex((x: string)=>x===e), 1);
                                }
                                else {
                                    this.record.data[0][e] = null;
                                    this.createPlaceHolder(e);
                                }
                                resolve();
                            });
                        }));
                    });
                    Promise.all(promises).then(() => this.tableHeaders = tempHeaders);
                }
                
			},
			error: e => console.error(e)
		}
		);	
	}

    fieldConverter(e: Event) {
        const EXPANDED = "expanded";
        let btn = e.currentTarget as HTMLInputElement;
        let formField = btn.closest("mat-form-field");
        if (!formField) throw Error("Form field not found");
        if (formField.hasAttribute(EXPANDED)) {
            formField.removeAttribute(EXPANDED);
            btn.style.transform = "";
        } else {
            formField.setAttribute(EXPANDED, "");
            btn.style.transform = "rotate(180deg)";
        }
    }

    isExpanded(formField: MatFormField) {
        return formField._elementRef.nativeElement.hasAttribute("expanded");
    }


    
    createPlaceHolder(col: string) {
        let pattern = this.validators.getPattern(col);
        this.placeholders[col] = pattern == this.validators.defaultPattern ? '' : randexp(pattern);
    }

	getSubmitInfo(): SubmitInfo | undefined {
		return this.tableInfo.get(this.currentTableType)
	}

    getErrorMsg(error: HttpErrorResponse): string {
        let msg: string = error.error.message;
        msg = msg.slice(msg.lastIndexOf("]")+1);
        return msg;
    }

    subscribeHandler(): Object {
        return {
            next: () => this.router.navigateByUrl(""),
            error: (e: HttpErrorResponse) => {
                let msg = this.getErrorMsg(e);
                this.submitError = msg;
                console.error(msg);
            },
        };
    }

	onUpdate(): void {
		if (this.recordForm().valid) {
			this.validators.correctDataTypes(this.record);
			this.tblservice.updateRecord(this.ids, this.record.data[0]).subscribe(this.subscribeHandler());
		}
	}
	
	onDelete(): void {
		const dialogRef = this.dialog.open(DeleteDialog);
		dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.tblservice.deleteRecord(this.ids).subscribe(this.subscribeHandler());
            }
        });
	}

	onInsert(): void {
		if (this.recordForm().valid) {
			this.validators.correctDataTypes(this.record.data[0]);
			this.tblservice.insertRecord(this.record.data[0]).subscribe(this.subscribeHandler());
		}
	}

}
