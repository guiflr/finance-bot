import express from 'express';
import { main } from '../mcp/mcp-client';

export const whatsappRouter = express.Router();

whatsappRouter.post('/webhook', async (req, res) => {
  const { message, phoneNumber } = req.body;

  const responseMessage = await main(message, phoneNumber);  

  res.status(200).send(responseMessage)  
});