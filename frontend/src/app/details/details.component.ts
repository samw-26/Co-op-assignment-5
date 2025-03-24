import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../table/table.service';
import { Schema } from '../interfaces';
import { forkJoin } from 'rxjs';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-details',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
	@Input() id!: string;
	tableName: string = 'authors';
	tableHeaders!: string[];
	record!: { [index: string]: string};
	tableSchema!: Schema[]
	tablePKey!: string;

	constructor(private tblservice: TableService) {}

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
}
