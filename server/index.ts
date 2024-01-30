import express, { RequestHandler } from "express";

const app = express();

type User = {};

const users: Array<User> = [];

const corsMiddleware: RequestHandler = (req, res, next) => {
	const origin = req.headers.origin;
	res.setHeader("Access-Control-Allow-Origin", origin || "*");
	res.setHeader("Access-Control-Allow-Methods", req.method);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	next();
};

app.use(corsMiddleware);
app.use(express.json());

app.get("/users", (req, res) => {
	return res.json(users);
});

app.post<{}, any, { id: string; user: string; publicKey: string }>("/users", (req, res) => {
	const body = req.body;
	users.push(body);
	return res.sendStatus(201);
});

app.listen(3000, () => {
	console.log("Server is listening on port 3000");
});
