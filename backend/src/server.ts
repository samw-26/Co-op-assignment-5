import sql from 'msnodesqlv8';
import express from 'express'
import {ParamsDictionary} from 'express-serve-static-core'
import cors from 'cors'
import SqlString from 'tsqlstring';
import {ServerResponse} from '@frontend/app/interfaces'

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
			if (req.method === "GET" && result!.length > 0) {
				res.send(result);
			} 
			else if (req.method !== "GET"){
				res.send({message:"Query executed."});
			}
			else {
				res.send([]);
			}
		}
	});

}


function sqlQueryWrapper(req: express.Request, res: express.Response, queryStr: string) {
	sql.open(config, (err: MsNodeSqlV8.Error, conn: MsNodeSqlV8.Connection) => {
		queryDb(req, res, err, conn, queryStr);
	});
}


async function getPrimaryKey(table: string) {
	const response = await fetch(`http://localhost:5000/api/${table}/pk`);
	if (response.status !== 200) {return null}
	const pk = await response.json();
	return pk[0]['COLUMN_NAME'];
}


/**
 * Route for getting primary key of table.
 */
app.get("/api/:table/pk", (req: express.Request, res: express.Response) => {
	let queryStr = SqlString.format("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = ?", [req.params.table]);
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
 * Route for getting entire table or record.
 */
app.get("/api/:table/:id?", async (req: express.Request, res: express.Response) => {
	let queryStr: string = "";
	if (req.params.id) {
		let idName: string = await getPrimaryKey(req.params.table);
		queryStr = SqlString.format("SELECT * FROM ?? WHERE ?? = ?", [req.params.table, idName, req.params.id]);
	} else {
		queryStr = SqlString.format("SELECT * FROM ??", [req.params.table]);
	}
	sqlQueryWrapper(req, res, queryStr);
});


/**
 * Route for updating record. Request body contains entire updated record.
 */
app.put("/api/:table/:id", async (req: express.Request, res: express.Response) => {
	let idName: string = await getPrimaryKey(req.params.table);
	let queryStr = SqlString.format("UPDATE ?? SET ? WHERE ?? = ?", [req.params.table, req.body, idName, req.body[idName]]);
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
	let idName =  await getPrimaryKey(req.params.table);
	let queryStr = SqlString.format("DELETE FROM ?? WHERE ?? = ?", [req.params.table, idName, req.params.id]);
	sqlQueryWrapper(req, res, queryStr);
});



