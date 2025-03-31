import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableService } from '../table.service';
import { forkJoin } from 'rxjs';
import { tableName } from '../table/table.component';
import { CheckConstraint, Schema } from '../interfaces';
import { Router, RouterLink } from '@angular/router';
import { pageNotFound } from '../app.routes';
import { Validation } from '../validation';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-insert',
  imports: [FormsModule, CommonModule, MatButtonModule, RouterLink],
  templateUrl: './insert.component.html',
  styleUrl: './insert.component.scss'
})
export class InsertComponent {
	record: { [index: string]: string} = {};
	tableHeaders: string[] = [];
	tableSchema!: Schema[];
	checkConstraints!: CheckConstraint[];
	tablePKey: string = "";
	validators!: Validation;
	
	constructor(private tblservice: TableService, private router: Router) {}
	ngOnInit(): void {
		forkJoin({
			schema: this.tblservice.getSchema(tableName),
			pkey: this.tblservice.getPkName(tableName),
			checkConstraints: this.tblservice.getCheckConstraints(tableName)
		}).subscribe({
			next: ({ schema, pkey, checkConstraints }) => {
				if (schema && pkey && checkConstraints) {
					schema.forEach(c => {
						this.tableHeaders.push(c.COLUMN_NAME);
					});
					this.tablePKey = pkey.COLUMN_NAME;
					this.tableSchema = schema;
					this.checkConstraints = checkConstraints;
					this.validators = new Validation(this.tableSchema, this.checkConstraints);
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

	}
}
