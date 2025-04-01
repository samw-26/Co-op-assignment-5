import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DuplicateKeyValidatorDirective, Validation } from '../validation';
import { authors_columns } from '../interfaces';
import { authors_placeholders } from '../../placeholders';

@Component({
  selector: 'app-record',
  imports: [CommonModule, FormsModule, DuplicateKeyValidatorDirective],
  templateUrl: './record.component.html',
  styleUrl: './record.component.scss'
})
export class RecordComponent {
	@Input({required: true}) title!: string;
	@Input({required: true}) tableHeaders!: string[];
	@Input({required: true}) tablePKey!: string;
	@Input({required: true}) record!: { [index: string]: any};
	@Input({required: true}) validators!: Validation;
	@Input({required: true}) onSubmit!: Function;
	@Input({required: true}) submitText!: string;
	@Input() onDelete!: Function;
	@Input() showDelete!: boolean;
	@Input() disablePKey!: boolean
	placeholders: authors_columns = authors_placeholders;

	ngOnInit() {

	}

	/**
	 * Ensures component contains all needed inputs.
	 */
	validateInputs() {
		if (!(this.onDelete && this.showDelete)) {
			throw new Error("Both onDelete and showDelete functions must be defined if one is provided.");
		}
	}

}
