// Importando os módulos necessários
import cors from "cors";
import express from "express";
import { router } from "./infra/routes";
require("dotenv").config()

// Configurando o servidor Express
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(router);

// Iniciando o servidor na porta especificada
app.listen(PORT, () => {
	console.log(`Server running on ${PORT}!`);
});
