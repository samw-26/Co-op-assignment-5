import { Component } from '@angular/core';
import { RecordComponent, TableType } from '../record/record.component';



@Component({
  selector: 'app-insert',
  imports: [RecordComponent],
  templateUrl: './insert.component.html',
  styleUrl: './insert.component.scss'
})
export class InsertComponent {
	readonly TableType = TableType;
}
