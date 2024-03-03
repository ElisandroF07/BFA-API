import cors from "cors";
import express from "express";
import { router } from "./infra/routes";
require("dotenv").config({
	path: process.env.NODE_ENV === "development" ? ".env.dev" : ".env",
});

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(PORT, () => {
	console.log("Server running!");
});
