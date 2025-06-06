import express from 'express';
import { processIncomingMessage } from '../services/message-processor';

export const whatsappRouter = express.Router();

whatsappRouter.post('/webhook', async (req, res) => {
  const { message, phoneNumber } = req.body;

  const responseMessage = await processIncomingMessage(message, phoneNumber);  

  res.status(200).send(responseMessage)  
});