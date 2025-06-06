import { GoogleGenerativeAI } from "@google/generative-ai";
import { interpretMessage } from "../ai/google-service";
import { saveTransaction } from "../repositories/create";
import { rawQuery } from "../repositories/raw-query";

const evaluateAnswer = async (text: string, data?: any) => {  
  let feedbackPrompt = `Gere uma mensagem personalizada de resposta ao usuário com base nesta ação: ${JSON.stringify(text)}.

   ${data ? `E aqui está o resultado que a ação da query retornou: ${data}` : ''} 
  `;
  const feedbackModel = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!).getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  const feedbackResult = await feedbackModel.generateContent(feedbackPrompt);
  const feedbackText = feedbackResult.response.text();
  return feedbackText
}

export const processIncomingMessage = async (message: string, phoneNumber: string) => {
  const aiResponse = await interpretMessage(message, phoneNumber);  
  console.log('aiResponse.action ', aiResponse.action)
  switch (aiResponse.action) {
    case 'insert':
      const data = await saveTransaction({ ...aiResponse.data });
      return evaluateAnswer(JSON.stringify(aiResponse), data);

    case 'query':
      let transactions;
      if (aiResponse.sql) {
        const sql = aiResponse.sql.toLowerCase();
        if (!sql.startsWith('select') || !sql.includes('transaction')) {
          throw new Error('Query não autorizada');
        }
        transactions = await rawQuery(aiResponse.sql)
        return evaluateAnswer(JSON.stringify(aiResponse), transactions);
      }
      return  evaluateAnswer(JSON.stringify(aiResponse));

    case 'invalid':
    default:
      return evaluateAnswer(JSON.stringify(aiResponse));
  }
};