import { Component, Input } from '@angular/core';
import { RecordComponent, TableType } from '../record/record.component';

@Component({
	selector: 'app-details',
	imports: [RecordComponent],
	templateUrl: './details.component.html',
	styleUrl: './details.component.scss'
})
export class DetailsComponent {
	@Input() id!: string;
	readonly TableType = TableType;
}
