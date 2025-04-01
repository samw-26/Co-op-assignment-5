import { CommonModule } from '@angular/common';
import { Component, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TableService } from '../table.service';
import { forkJoin } from 'rxjs';
import { tableName } from '../table/table.component';
import { authors_columns, CheckConstraint, Schema } from '../interfaces';
import { Router, RouterLink } from '@angular/router';
import { pageNotFound } from '../app.routes';
import { Validation, DuplicateKeyValidatorDirective } from '../validation';
import { MatButtonModule } from '@angular/material/button';
import { authors_placeholders } from '../../placeholders';


@Component({
  selector: 'app-insert',
  imports: [FormsModule, CommonModule, MatButtonModule, RouterLink, DuplicateKeyValidatorDirective],
  templateUrl: './insert.component.html',
  styleUrl: './insert.component.scss'
})
export class InsertComponent {
	tableHeaders: string[] = [];
	record: { [index: string]: any} = {};
	placeholders: authors_columns = authors_placeholders
	tableSchema!: Schema[];
	checkConstraints!: CheckConstraint[];
	tablePKey!: string;
	insertForm = viewChild.required<NgForm>("insertForm");
	validators!: Validation;
	isDuplicate: boolean = false;
	
	constructor(private tblservice: TableService, private router: Router) {}
	ngOnInit(): void {
		forkJoin({
			records: this.tblservice.fetchTable(tableName),
			schema: this.tblservice.getSchema(tableName),
			pkey: this.tblservice.getPkName(tableName),
			checkConstraints: this.tblservice.getCheckConstraints(tableName)
		}).subscribe({
			next: ({ records, schema, pkey, checkConstraints }) => {
				if (records && schema && pkey && checkConstraints) {
					schema.forEach(c => {
						this.tableHeaders.push(c.COLUMN_NAME);
					});
					this.tableHeaders.forEach(col => {
						this.record[col] = null;
					});
					this.tablePKey = pkey.COLUMN_NAME;
					this.tableSchema = schema;
					this.checkConstraints = checkConstraints;
					this.validators = new Validation(this.tableSchema, this.checkConstraints, this.insertForm(),{records: records, pkey: this.tablePKey});
				}
				else {
					this.router.navigateByUrl(pageNotFound);
				}
			},
			error: (e) => {
				this.router.navigateByUrl(pageNotFound);
			}
		}
		);
	}


	onInsert(): void {
		if (this.insertForm().valid) {
			this.validators.correctDataTypes(this.record);
			this.tblservice.insertRecord(tableName, this.record).subscribe({
				next: () => this.router.navigateByUrl(""),
				error: e => console.log(e.error)
			});
		}
	}
}
