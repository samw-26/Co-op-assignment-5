import { Component, Input } from '@angular/core';
import { TableService } from '../table.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
	@Input() id!: string;
	tableData: { [key: string]: any}[] = [];
	tableHeaders: string[] = [];
	tableName: string = "authors";
	tableLoaded: boolean = false;

	constructor(private tblservice: TableService) {}
	ngOnInit(): void {
		this.tblservice.getRecord(this.tableName, this.id).subscribe((data: Object[]) => {
			this.tableData = data;
			this.tableHeaders = Object.keys(data[0]);
			this.tableLoaded = true;
			console.log(data);
		});
	}
}
