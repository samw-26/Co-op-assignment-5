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
		res.status(500).send("Could not open connection to SQL Server");
		return;
	}

	conn.query(queryStr, (queryErr?: MsNodeSqlV8.Error, result?: { [index: string]: string }[]) => {
		if (queryErr) {
			console.log(queryErr);
			res.status(500).send("Error executing query");
		} else {
			if (result!.length > 0) {
				res.send(result);
			} else {
				res.status(404).send("No results found from query");
			}
		}
	});

}


function sqlOpenWrapper(req: express.Request, res: express.Response, queryStr: string) {
	sql.open(config, (err: MsNodeSqlV8.Error, conn: MsNodeSqlV8.Connection) => {
		queryDb(req, res, err, conn, queryStr);
	});
}


app.get('/api/:table/pk', (req: express.Request, res: express.Response) => {
	let queryStr = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = '${req.params.table}'`;
	sqlOpenWrapper(req, res, queryStr);
});


app.get('/api/:table/schema', (req: express.Request, res: express.Response) => {
	let queryStr = `
	SELECT 
		COLUMN_NAME, 
		IS_NULLABLE, 
		DATA_TYPE, 
		CHARACTER_MAXIMUM_LENGTH, 
		NUMERIC_PRECISION, 
		NUMERIC_SCALE 
	FROM INFORMATION_SCHEMA.COLUMNS 
	WHERE TABLE_NAME = '${req.params.table}'
	`
	sqlOpenWrapper(req, res, queryStr);
});


app.get('/api/:table/:id?', async (req: express.Request, res: express.Response) => {
	let queryStr: string = "";
	if (req.params.id) {
		let idName: string = await fetch("http://localhost:5000/api/authors/pk").then(response => response.json().then(pk => idName = pk[0]['COLUMN_NAME']));
		console.log(queryStr)
		queryStr = SqlString.format("SELECT * FROM ?? WHERE au_id=?", [req.params.table, req.params.id]);
		console.log(queryStr)
	} else {
		queryStr = `SELECT * FROM ${req.params.table}`;
	}
	sqlOpenWrapper(req, res, queryStr);
});

app.put('/api/:table/:pk/:id', (req: express.Request, res: express.Response) => {
	let queryStr = `DELETE FROM ${req.params.table} WHERE ${req.params.pk} = ${req.params.id}`
});



