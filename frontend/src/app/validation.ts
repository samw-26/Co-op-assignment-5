import { Injectable } from "@angular/core";
import { CheckConstraint, Schema } from "./interfaces";

export class Validation {
	tableSchema: Schema[] = [];
	checkConstraints: CheckConstraint[] = [];

	constructor(tableSchema: Schema[], checkConstraints: CheckConstraint[]) {
		this.tableSchema = tableSchema;
		this.checkConstraints = checkConstraints;
	}
	
	getColumnSchema(column: string): Schema | undefined {
		return this.tableSchema.find(e => e["COLUMN_NAME"] === column);
	}


	getColMaxLength(column: string): number | null {
		const schema = this.getColumnSchema(column);
		if (schema?.DATA_TYPE === "bit") {
			return 5; // false is 5 characters
		}
		return schema?.CHARACTER_MAXIMUM_LENGTH ?? null;
	}


	getColMinLength(column: string) {
		const schema = this.getColumnSchema(column)
		return schema?.DATA_TYPE === 'char' ? schema.CHARACTER_MAXIMUM_LENGTH : null;
	}


	isRequired(column: string) {
		const schema = this.getColumnSchema(column);
		return schema?.IS_NULLABLE === "NO";
	}


	getPattern(column: string) {
		if (this.getColumnSchema(column)?.DATA_TYPE === "bit") {
			return "^true$|^false$"
		}
		const constraint = this.checkConstraints.find(e => e.name.includes(column))
		const pattern = constraint?.definition.match(/(?<=').+(?=')/);
		return pattern ? pattern[0] : "";
	}
}