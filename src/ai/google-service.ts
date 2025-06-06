import { GoogleGenerativeAI } from "@google/generative-ai";


export interface AIResponse {
    action: 'insert' | 'query' | 'invalid';
    data?: any;
    sql?: string; // Query SQL gerada pela IA
  }

export const interpretMessage = async (message: string, phoneNumber: string): Promise<AIResponse> => {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

  const prompt = `
  Você é um agente de finanças pessoais para uma aplicação, seu papel é análisar uma mensagem, 
  que pode ser uma mensagem de um gasto como: lanche 10, ou uma entrada, salario 10.000, 
  ou uma consulta sobre gastos como: com o que mais gastei dinheiro nos ultimos dez dias.
  Diante disso suas respostas só podem ser um JSON e não um texto.  

  Fique atento a qual categoria você define os itens, por exemplo, ja vi você colocando gasto com um par de 'meias'
  na categoria 'Alimentos', isso esta incorreto.

  Você deve análisar corretamente quando o cliente esta querendo fazer uma consulta aos gastos que ele teve,
  seja por categoria, valor ou data, ou data junto com categoria, enfim. Para que você construa uma Query que 
  retorne exatamente o que ele esta solicitando para visualizar1.

Analise a seguinte mensagem recebida via WhatsApp: "${message}"

Não retorne o JSON com esse padrão: json antes do objeto

Se for uma operação financeira para inserir, gere:
{
  action: 'insert',
  data: {
    description: string,
    category: string,
    amount: number,
    type: 'income' | 'expense',
    date: ISODateString,
    phoneNumber: '${phoneNumber}'
  }
}

Se for uma consulta, gere:
{
  action: 'query',
  sql: 'SQL QUERY COMPLETA SOBRE A TABELA Transaction COM AS COLUNAS description, category, amount, type, date, phoneNumber BASEADO NA MENSAGEM RECEBIDA via WhatsApp'
}

Se não for relacionada a finanças, retorne:
{ action: 'invalid' }
`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text().toString();  
  console.log('JSON.stringify(text) ', text)
  return JSON.parse(text);
};