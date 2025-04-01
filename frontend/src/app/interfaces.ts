export interface authors_columns {
	au_id: string,
	au_lname: string,
	au_fname: string,
	phone: string,
	address: string,
	city: string,
	state: string,
	zip: string,
	contract: string
	[key: string]: any; 
}

export interface Schema {
	COLUMN_NAME: string,
    IS_NULLABLE: string,
    DATA_TYPE: string,
    CHARACTER_MAXIMUM_LENGTH: number,
    NUMERIC_PRECISION: number,
    NUMERIC_SCALE: number
}


export interface CheckConstraint {
	name: string,
	definition: string
}


export interface PrimaryKey {
	COLUMN_NAME: string
}


export interface ServerResponse {
	errorCode: number | undefined,
	message: string
}