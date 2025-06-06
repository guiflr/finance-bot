import express from 'express';
import cors from 'cors'
import { whatsappRouter } from './api/whatsapp-controller';

const app = express();
app.use(cors())
app.use(express.json());

app.use('/whatsapp', whatsappRouter);

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});