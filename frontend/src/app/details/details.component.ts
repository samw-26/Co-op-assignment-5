import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../table/table.service';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
	@Input() id!: string;
	table_name: string = 'authors';
	table_headers!: string[];
	record!: { [index: string]: string};
	table_pkey!: string;

	constructor(private tblservice: TableService) {}

	ngOnInit(): void {
		this.tblservice.getRecord(this.table_name, this.id).subscribe((row: { [index: string]: string }) => {
			this.record = row;
			this.table_headers = Object.keys(row);
		});
		this.tblservice.getPkName(this.table_name).subscribe(data => {
			this.table_pkey = data['COLUMN_NAME'];
		});
	}
}
