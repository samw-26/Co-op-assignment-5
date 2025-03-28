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