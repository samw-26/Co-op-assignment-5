import { Component, Input, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../table/table.service';
import { Schema } from '../interfaces';
import { forkJoin } from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialog } from './delete.dialog.component';
import { pageNotFound } from '../app.routes';
import { FormsModule } from '@angular/forms';

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
	record!: { [index: string]: string};
	tableSchema!: Schema[]
	tablePKey!: string;

	constructor(private tblservice: TableService, private dialog: MatDialog, private router: Router) {}

	ngOnInit(): void {
		forkJoin({
			record: this.tblservice.getRecord(this.tableName, this.id),
			pkey: this.tblservice.getPkName(this.tableName),
			schema: this.tblservice.getSchema(this.tableName)
		  }).subscribe({
			next: ({ record, pkey, schema }) => {
				if (record) {
					this.record = record;
					this.tableHeaders = Object.keys(this.record);
					this.tablePKey = pkey.COLUMN_NAME;
					this.tableSchema = schema;
					console.log(this.tableSchema)
				}
			},
			error: (e) => {
				this.router.navigateByUrl(pageNotFound)
			}
		  }
		);
	}

	onUpdate(): void {

	}

	onDelete(): void {
		const dialogRef = this.dialog.open(DeleteDialog, {
			data: {id: this.record[this.tablePKey]}
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.tblservice.deleteRecord(this.tableName, this.id).subscribe(()=>{
					this.router.navigateByUrl("/");
				});
			}
		});
	}

	private getColumnSchema(column: string) {
		return this.tableSchema.find(e => e["COLUMN_NAME"] === column);
	}

	protected getColMaxLength(column: string) {
		return this.tableSchema.find(e => e["COLUMN_NAME"] === column)?.CHARACTER_MAXIMUM_LENGTH
	}

	protected isRequired(column: string) {
		let schema = this.getColumnSchema(column);
		if (schema) {
			return schema.IS_NULLABLE === "NO" ? true : false;
		}
		return false;
	}
	
}
