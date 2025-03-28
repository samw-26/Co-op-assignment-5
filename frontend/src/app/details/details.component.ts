import { Component, Input, viewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../table/table.service';
import { CheckConstraint, Schema } from '../interfaces';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialog } from './delete.dialog.component';
import { pageNotFound } from '../app.routes';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
	selector: 'app-details',
	imports: [CommonModule, MatButtonModule, RouterLink, FormsModule],
	templateUrl: './details.component.html',
	styleUrl: './details.component.scss'
})
export class DetailsComponent {
	@Input() id!: string;
	tableName: string = 'authors';
	tableHeaders!: string[];
	record!: { [index: string]: any };
	tableSchema!: Schema[];
	checkConstraints!: CheckConstraint[];
	tablePKey!: string;
	detailsForm = viewChild.required<NgForm>("detailsForm");

	constructor(private tblservice: TableService, private dialog: MatDialog, private router: Router) { }

	ngOnInit(): void {
		forkJoin({
			record: this.tblservice.getRecord(this.tableName, this.id),
			pkey: this.tblservice.getPkName(this.tableName),
			schema: this.tblservice.getSchema(this.tableName),
			checkConstraints: this.tblservice.getCheckConstraints(this.tableName)
		}).subscribe({
			next: ({ record, pkey, schema, checkConstraints }) => {
				if (record) {
					this.record = record;
					this.tableHeaders = Object.keys(this.record);
					this.tablePKey = pkey.COLUMN_NAME;
					this.tableSchema = schema;
					this.checkConstraints = checkConstraints;
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


	onUpdate(): void {
		if (this.detailsForm().valid) {
			for (let col in this.record) {
				const schema = this.getColumnSchema(col);
				if (schema?.DATA_TYPE === "bit") {
					this.record[col] = this.record[col] === "true";
				}
			}
			this.tblservice.updateRecord(this.tableName, this.id, this.record).subscribe(() => {
				this.router.navigateByUrl("/");
			});
		}
	}


	onDelete(): void {
		const dialogRef = this.dialog.open(DeleteDialog, {
			data: { id: this.record[this.tablePKey] }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.tblservice.deleteRecord(this.tableName, this.id).subscribe(() => {
					this.router.navigateByUrl("/");
				});
			}
		});
	}


	private getColumnSchema(column: string): Schema | undefined {
		return this.tableSchema.find(e => e["COLUMN_NAME"] === column);
	}


	protected getColMaxLength(column: string): number | null {
		const schema = this.getColumnSchema(column);
		if (schema?.DATA_TYPE === "bit") {
			return 5; // false is 5 characters
		}
		return schema?.CHARACTER_MAXIMUM_LENGTH ?? null;
	}


	protected getColMinLength(column: string) {
		const schema = this.getColumnSchema(column)
		return schema?.DATA_TYPE === 'char' ? schema.CHARACTER_MAXIMUM_LENGTH : null;
	}


	protected isRequired(column: string) {
		const schema = this.getColumnSchema(column);
		return schema?.IS_NULLABLE === "NO";
	}


	protected getPattern(column: string) {
		if (this.getColumnSchema(column)?.DATA_TYPE === "bit") {
			return "true|false"
		}
		const constraint = this.checkConstraints.find(e => e.name.includes(column))
		const pattern = constraint?.definition.match(/(?<=').+(?=')/);
		return pattern ? pattern[0] : "";
	}


}
