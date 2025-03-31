import { Component, Input, viewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../table.service';
import { CheckConstraint, Schema } from '../interfaces';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialog } from './delete.dialog.component';
import { pageNotFound } from '../app.routes';
import { FormsModule, NgForm } from '@angular/forms';
import { tableName } from '../table/table.component';
import { Validation } from '../validation';


@Component({
	selector: 'app-details',
	imports: [CommonModule, MatButtonModule, RouterLink, FormsModule],
	templateUrl: './details.component.html',
	styleUrl: './details.component.scss'
})
export class DetailsComponent {
	@Input() id!: string;
	tableHeaders!: string[];
	record!: { [index: string]: any };
	tableSchema!: Schema[];
	checkConstraints!: CheckConstraint[];
	tablePKey!: string;
	detailsForm = viewChild.required<NgForm>("detailsForm");
	validators!: Validation;

	constructor(private tblservice: TableService, private dialog: MatDialog, private router: Router) { }

	ngOnInit(): void {
		forkJoin({
			record: this.tblservice.getRecord(tableName, this.id),
			pkey: this.tblservice.getPkName(tableName),
			schema: this.tblservice.getSchema(tableName),
			checkConstraints: this.tblservice.getCheckConstraints(tableName)
		}).subscribe({
			next: ({ record, pkey, schema, checkConstraints }) => {
				if (record && pkey && schema && checkConstraints) {
					this.record = record;
					this.tableHeaders = Object.keys(this.record);
					this.tablePKey = pkey.COLUMN_NAME;
					this.tableSchema = schema;
					this.checkConstraints = checkConstraints;
					this.validators = new Validation(this.tableSchema, this.checkConstraints);
				}
				else {
					this.router.navigateByUrl(pageNotFound);
				}
			},
			error: e => this.router.navigateByUrl(pageNotFound)
		}
		);
	}


	onUpdate(): void {
		if (this.detailsForm().valid) {
			this.validators.correctDataTypes(this.record);
			this.tblservice.updateRecord(tableName, this.id, this.record).subscribe(() => {
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
				this.tblservice.deleteRecord(tableName, this.id).subscribe(() => {
					this.router.navigateByUrl("/");
				});
			}
		});
	}
}
