import { Component, Input, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../table/table.service';
import { Schema } from '../interfaces';
import { forkJoin } from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialog } from './delete.dialog.component';

@Component({
  selector: 'app-details',
  imports: [CommonModule, MatButtonModule, RouterLink],
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

	constructor(private tblservice: TableService, private dialog: MatDialog) {}

	ngOnInit(): void {
		forkJoin({
			record: this.tblservice.getRecord(this.tableName, this.id),
			pkey: this.tblservice.getPkName(this.tableName),
			schema: this.tblservice.getSchema(this.tableName)
		  }).subscribe(({ record, pkey, schema }) => {
			this.record = record;
			this.tableHeaders = Object.keys(record);
			this.tablePKey = pkey.COLUMN_NAME;
			this.tableSchema = schema;
		});
	}

	onDelete(): void {
		const dialogRef = this.dialog.open(DeleteDialog, {
			data: {id: this.record[this.tablePKey]}
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				console.log("Deleting...")
				//this.tblservice.
			}
		});
	}
}
