import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { CheckConstraint, Schema } from './interfaces';
import { NgForm } from '@angular/forms';

/**
 * Contains helper functions for validating form input. Functions designed to be binded to attributes in DOM.
 */
export class Validation {
	constructor(private readonly tableSchema: Schema[], private readonly checkConstraints: CheckConstraint[],
		private readonly form: NgForm,
		private readonly tableInfo?: { records: { [index: string]: any }[], pKeys: string[] }) { }
	
    readonly defaultPattern = /^\S(.*\S)?$/

	correctDataTypes(record: { [index: string]: any }) {
        for (let col in record) {
			if (typeof record[col] === 'string' && record[col].trim() === '') {
				record[col] = null;
			}
            else if (this.getColumnSchema(col)?.DATA_TYPE === 'bit' && record[col] === null) {
                record[col] = false;
            }
		}
	}


	getColumnSchema(column: string): Schema | undefined {
		return this.tableSchema.find(e => e['COLUMN_NAME'] === column);
	}


	getColMaxLength(column: string): number | null {
		const schema = this.getColumnSchema(column);
        if (!schema || schema.CHARACTER_MAXIMUM_LENGTH < 0) return null;
		return schema.CHARACTER_MAXIMUM_LENGTH;
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
		const constraint = this.checkConstraints.find(e => e.name.includes(column))
		const pattern = constraint?.definition.match(/(?<=').+(?=')/); // Gets pattern from check constraint.
		return pattern ? pattern[0] : this.defaultPattern;
	}


	/**
	 * Checks if primary key is a duplicate. Requires instantiating with records parameter.
	 * @param key 
	 * @returns boolean if duplicate key is present.
	 */
	// isDuplicateKey(key: string): boolean {
	// 	if (!this.tableInfo) { throw new Error("isDuplicateKey required tableInfo parameter. Did you forget to instantiate it?") };
	// 	for (let record of this.tableInfo.records) {
	// 		if (record[this.tableInfo.pKeys] === key) return true
	// 	}
	// 	return false;
	// }


	/**
	 * Displays corresponding error msg.
	 * @param col Column name
	 * @returns String containing error msg.
	 */
	getErrorMsg(col: string): string {
        if (!this.form.controls[col]) return '';
		let errors = this.form.controls[col].errors;
		if (!errors) return '';
		if (errors['required']) {
			return 'Field is required.';
		}
		else if (errors['pattern']) {
			if (errors['pattern'].requiredPattern == this.defaultPattern) {
				return 'Field cannot contain leading or trailing spaces.';
			}
			return `Incorrect format. Must match ${errors['pattern'].requiredPattern}`;
		}
		else if (errors['duplicateKey']) {
			return 'Primary key already exists in table.';
		}
		else if (errors['minlength']) {
			return `Must be ${errors['minlength']['requiredLength']} characters.` 
		}
		return ''
	}
}

// /**
//  * Validates that primary key is not duplicate.
//  */
// @Directive({
// 	selector: '[duplicateKeyValidator]',
// 	providers: [{ provide: NG_VALIDATORS, useExisting: DuplicateKeyValidatorDirective, multi: true }]
// })
// export class DuplicateKeyValidatorDirective implements Validator {
// 	@Input({ alias: 'duplicateKeyValidator', required: true }) validators!: Validation | null;

// 	validate(control: AbstractControl): ValidationErrors | null {
// 		if (!this.validators) return null;
// 		let result = this.validators.isDuplicateKey(control.value);
// 		return result ? { duplicateKey: true } : null;
// 	}
// }
