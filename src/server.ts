import { router } from "./infra/routes";
import express from 'express';
import cors from 'cors';
require('dotenv').config()

const app = express();
const PORT = process.env.PORT;


app.use(cors())
app.use(express.json());
app.use(router);


app.listen(PORT, () => { console.log('Server running')});
