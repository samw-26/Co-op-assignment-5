import sql from "msnodesqlv8";
import express from "express"
import {ParamsDictionary} from 'express-serve-static-core'
import cors from "cors"
import SqlString from 'tsqlstring';

const app = express();
const port = 5000;
const config: string = "server=ON44C03490451\\MSSQLSERVER01;Database=pubs;Trusted_Connection=true;Driver={SQL Server}"

app.use(cors());
app.listen(port, () => {
	console.log("Website served on http://localhost:" + port);
});


function queryDb(req: express.Request, res: express.Response, connErr: MsNodeSqlV8.Error, conn: MsNodeSqlV8.Connection, queryStr: string) {
	if (connErr) {
		console.log(connErr);
		res.status(500).send("Could not open connection to SQL Server.");
		return;
	}

	conn.query(queryStr, (queryErr?: MsNodeSqlV8.Error, result?: MsNodeSqlV8.sqlRecordType[]) => {
		if (queryErr) {
			console.log(queryErr);
			res.status(500).send("Error executing query.");
		} 
		else {
			if (req.method === "GET" && result!.length > 0) {
				res.send(result);
			} 
			else if (req.method !== "GET"){
				res.send("Query executed.");
			}
			else {
				res.status(404).send("No results found from query.");
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
	const pk = await response.json();
	return pk[0]['COLUMN_NAME'];
}


app.get('/api/:table/pk', (req: express.Request, res: express.Response) => {
	let queryStr = SqlString.format("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = ?", [req.params.table]);
	sqlQueryWrapper(req, res, queryStr);
});


app.get('/api/:table/schema', (req: express.Request, res: express.Response) => {
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


app.get('/api/:table/:id?', async (req: express.Request, res: express.Response) => {
	let queryStr: string = "";
	if (req.params.id) {
		let idName: string = await getPrimaryKey(req.params.table);
		queryStr = SqlString.format("SELECT * FROM ?? WHERE ??=?", [req.params.table, idName, req.params.id]);
	} else {
		queryStr = SqlString.format("SELECT * FROM ??", [req.params.table]);
	}
	sqlQueryWrapper(req, res, queryStr);
});

app.delete('/api/:table/:id', async (req: express.Request, res: express.Response) => {
	let idName =  await getPrimaryKey(req.params.table);
	let queryStr = SqlString.format("DELETE FROM ?? WHERE ?? = ?", [req.params.table, idName, req.params.id]);
	sqlQueryWrapper(req, res, queryStr);
});



