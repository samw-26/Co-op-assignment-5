import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { CheckConstraint, Schema } from './interfaces';

/**
 * Contains helper functions for validating form input. Functions designed to be binded to attributes in DOM.
 */
export class Validation {
	constructor(private readonly tableSchema: Schema[], private readonly checkConstraints: CheckConstraint[], private readonly tableInfo?: { records: { [index: string]: any }[], pkey: string }) { }


	private convertToBit(record: { [index: string]: any }) {
		for (let col in record) {
			const schema = this.getColumnSchema(col);
			if (schema?.DATA_TYPE === 'bit') {
				record[col] = record[col] === 'true';
			}
		}
	}


	private convertToNull(record: { [index: string]: any }) {
		for (let col in record) {
			if (typeof record[col] === 'string' && record[col].trim() === '') {
				record[col] = null;
			}
		}
	}


	correctDataTypes(record: { [index: string]: any }) {
		this.convertToBit(record);
		this.convertToNull(record);
	}


	getColumnSchema(column: string): Schema | undefined {
		return this.tableSchema.find(e => e['COLUMN_NAME'] === column);
	}


	getColMaxLength(column: string): number | null {
		const schema = this.getColumnSchema(column);
		if (schema?.DATA_TYPE === 'bit') {
			return 5; // false is 5 characters
		}
		return schema?.CHARACTER_MAXIMUM_LENGTH ?? null;
	}


	getColMinLength(column: string): number | null {
		const schema = this.getColumnSchema(column)
		return schema?.DATA_TYPE === 'char' ? schema.CHARACTER_MAXIMUM_LENGTH : null;
	}


	isRequired(column: string): boolean {
		const schema = this.getColumnSchema(column);
		return schema?.IS_NULLABLE === 'NO';
	}


	getPattern(column: string): string | RegExp {
		if (this.getColumnSchema(column)?.DATA_TYPE === 'bit') {
			return '^true$|^false$'
		}
		const constraint = this.checkConstraints.find(e => e.name.includes(column))
		const pattern = constraint?.definition.match(/(?<=').+(?=')/);
		return pattern ? pattern[0] : /^\S(.*\S)?$/;
	}


	/**
	 * Checks if primary key is a duplicate. Requires instantiating with records parameter.
	 * @param key 
	 * @returns boolean if duplicate key is present.
	 */
	isDuplicateKey(key: string): boolean {
		if (!this.tableInfo) { throw Error("isDuplicateKey required tableInfo parameter. Did you forget to instantiate it?") };
		for (let record of this.tableInfo.records) {
			if (record[this.tableInfo.pkey] === key) return true
		}
		return false;
	}
}

/**
 * Custom validator wrapper.
 */
@Directive({
	selector: '[customValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: CustomValidatorDirective, multi: true }]
})
export class CustomValidatorDirective implements Validator {
	@Input({ alias: 'customValidator', required: true }) validators!: Validation;

	validate(control: AbstractControl): ValidationErrors | null {
		let result = this.validators.isDuplicateKey(control.value);
		return result ? { duplicateKey: true } : null;
	}
}
