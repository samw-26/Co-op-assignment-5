import express from "express"
import cors from "cors"

const app = express();
const port = 5000;

app.get('/', (req, res) => {
	res.send('Hello World from Node.js server!');
  });

app.listen(port, () => {
	console.log("Website served on http://localhost:" + port);
})