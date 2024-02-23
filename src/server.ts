import { router } from "./infra/routes";
import express from 'express';
import cors from 'cors';
const B2 = require('b2');
import Backbone = require('backbone')

require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(router);

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY
});

b2.authorize().then(() => {
  console.log('Autenticado com sucesso');
  app.listen(PORT, () => { console.log('Server running'); });
}).catch((err: any) => {
  console.error('Erro ao autenticar:', err);
});
