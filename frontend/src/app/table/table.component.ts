import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../table.service';
import {MatTableModule} from '@angular/material/table';
@Component({
  selector: 'app-table',
  imports: [CommonModule, MatTableModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
	tableData: { [key: string]: any}[] = [];
	tableHeaders: string[] = [];
	tableName: string = "authors";
	tableLoaded: boolean = false;

	constructor(private tblservice : TableService) {}
	ngOnInit(): void {
		this.tblservice.getTable(this.tableName).subscribe((data: any) => {
			this.tableData = data;
			this.tableHeaders = Object.keys(data[0]);
			this.tableLoaded = true;
		});
	}

}
