import sql from 'msnodesqlv8';
import express from 'express'
import cors from 'cors'
import SqlString from 'tsqlstring';
import {ServerResponse, PrimaryKey} from '@frontend/app/interfaces'


const app = express();
const port = 5000;
const config: string = "server=ON44C03490451\\MSSQLSERVER01;Database=pubs;Trusted_Connection=true;Driver={SQL Server}"

app.use(cors());
app.use(express.json());
app.listen(port, () => {
	console.log("Website served on http://localhost:" + port);
});


function queryDb(req: express.Request, res: express.Response, connErr: MsNodeSqlV8.Error, conn: MsNodeSqlV8.Connection, queryStr: string) {
	if (connErr) {
		let resMsg: ServerResponse = {
			errorCode: connErr?.code,
			message: connErr?.message
		}
		res.status(500).send(resMsg);
		return;
	}

	conn.query(queryStr, (queryErr?: MsNodeSqlV8.Error, result?: MsNodeSqlV8.sqlRecordType[], more?: boolean) => {
		if (queryErr) {
			let resMsg: ServerResponse = {
				errorCode: queryErr?.code,
				message: queryErr?.message
			}
			res.status(500).send(resMsg);
		} 
		else {
			if (req.method === "GET") {
				res.send(result);
			} 
			else {
				res.send({message:"Query executed."});
			}
		}
	});

}


function sqlQueryWrapper(req: express.Request, res: express.Response, queryStr: string) {
	sql.open(config, (err: MsNodeSqlV8.Error, conn: MsNodeSqlV8.Connection) => {
		queryDb(req, res, err, conn, queryStr);
	});
}


async function getPrimaryKeys(table: string) {
	const response = await fetch(`http://localhost:5000/api/${table}/pk`);
	if (response.status !== 200) {return null}
	return await response.json().then(data => data.map((e: PrimaryKey)  => {
        return e.Column_Name;
    }));
}


async function addQueryConditions(table:string, id: string, baseQuery: string) {
    let queryStr = baseQuery;
    let pKeyValues = id.split("+");
    let pKeys: string[] = await getPrimaryKeys(table);
    if (pKeyValues.length !== pKeys.length) throw new Error(`Unexpected number of primary keys, received ${pKeyValues.length}, expected ${pKeys.length}`);
    for (let i=0; i < pKeyValues.length; i++) {
        if (i === 0) queryStr += SqlString.format(" WHERE ??=?", [pKeys[i], pKeyValues[i]]);
        else queryStr += SqlString.format(" AND ?? = ?", [pKeys[i], pKeyValues[i]])
    }
    return queryStr;
}


/**
 * Route for getting all tables.
 */
app.get("/api/tables", (req: express.Request, res: express.Response) => {
	let queryStr = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'";
	sqlQueryWrapper(req, res, queryStr);
});

/**
 * Route for getting primary key(s) of table.
 */
app.get("/api/:table/pk", (req: express.Request, res: express.Response) => {
	let queryStr = SqlString.format(`
        SELECT Col.Column_Name from 
            INFORMATION_SCHEMA.TABLE_CONSTRAINTS Tab, 
            INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE Col 
        WHERE 
            Col.Constraint_Name = Tab.Constraint_Name
            AND Col.Table_Name = Tab.Table_Name
            AND Tab.Constraint_Type = 'PRIMARY KEY'
            AND Col.Table_Name = ?`, [req.params.table]);
	sqlQueryWrapper(req, res, queryStr);
});


/**
 * Route for getting table schema.
 */
app.get("/api/:table/schema", (req: express.Request, res: express.Response) => {
	let queryStr = SqlString.format(`
		SELECT 
			COLUMN_NAME, 
			IS_NULLABLE, 
			DATA_TYPE, 
			CHARACTER_MAXIMUM_LENGTH, 
			NUMERIC_PRECISION, 
			NUMERIC_SCALE 
		FROM INFORMATION_SCHEMA.COLUMNS 
		WHERE TABLE_NAME = ?
		`, [req.params.table])
	sqlQueryWrapper(req, res, queryStr);
});


/**
 * Route for getting table check constraints.
 * Check constraint in format: CK__<table name>__<column name>...
 */
app.get("/api/:table/ck", (req: express.Request, res: express.Response) => {
	let queryStr = SqlString.format("SELECT name, definition FROM sys.check_constraints WHERE name LIKE ?", ["%" + req.params.table + "%"]);
	sqlQueryWrapper(req, res, queryStr);
});


/**
 * Route for getting entire table or record. For records with multiple primary keys, separate primary keys with '+'
 */
app.get("/api/:table/:id?", async (req: express.Request, res: express.Response) => {
	let queryStr: string = SqlString.format("SELECT * FROM ??", [req.params.table]);
	if (req.params.id) {
        queryStr = await addQueryConditions(req.params.table, req.params.id, queryStr);
	}
    sqlQueryWrapper(req, res, queryStr);
});


/**
 * Route for updating record. Request body contains entire updated record.
 */
app.put("/api/:table/:id", async (req: express.Request, res: express.Response) => {
	let queryStr = SqlString.format("UPDATE ?? SET ?", [req.params.table, req.body]);
    queryStr = await addQueryConditions(req.params.table, req.params.id, queryStr);
	sqlQueryWrapper(req, res, queryStr);
});


/**
 * Route for inserting record. Request body contains new record.
 */
app.post("/api/:table/insert", (req: express.Request, res: express.Response) => {
	let queryStr = SqlString.format("INSERT INTO ?? VALUES (?)", [req.params.table, Object.values(req.body)]);
	sqlQueryWrapper(req, res, queryStr);
});


/**
 * Route for deleting record.
 */
app.delete("/api/:table/:id", async (req: express.Request, res: express.Response) => {
	let queryStr = SqlString.format("DELETE FROM ??", [req.params.table]);
    queryStr = await addQueryConditions(req.params.table, req.params.id, queryStr);
	sqlQueryWrapper(req, res, queryStr);
});



