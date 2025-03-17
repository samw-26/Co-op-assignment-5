import sql from "msnodesqlv8";
import express from "express"
import cors from "cors"

const app = express();
app.use(cors());
const port = 5000;

let config: string = "server=ON44C03490451\\MSSQLSERVER01;Database=pubs;Trusted_Connection=true;Driver={SQL Server}"

app.get('/api/:table', (req, res) => {
	sql.open(config, (err: MsNodeSqlV8.Error, conn: MsNodeSqlV8.Connection) => {
		let table = req.params.table;
		let querystr: string = `SELECT * FROM ${table}`;
		conn.query(querystr, (err: any, result:any, more:boolean|undefined) => {
			if (err) console.log(err);
			else {
				res.send(result);
			}
		})
	});
});

app.listen(port, () => {
	console.log("Website served on http://localhost:" + port);
});


