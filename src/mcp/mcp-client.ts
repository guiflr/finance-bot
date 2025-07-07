import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { formatToolResult } from "./utils.js";
import {
  GoogleGenAI,
  FunctionCallingConfigMode,  
} from "@google/genai";
import {  controlLightDeclaration } from "../ai/google.js";
import { categories } from "../utils/categories.js";
import { incomingCategories } from "../utils/incoming-categories.js";

export async function main(message: string, phoneNumber: string) {
  try {
    const aiGemini = new GoogleGenAI({ apiKey: "",  });
      console.log('[mcpClient - INIT]')
    const mcpClient = new McpClient({
      name: "mcp-sse-demo",
      version: "1.0.0",
    });

    console.log('[SSEClientTransport - INIT]')
    const transport = new SSEClientTransport(
      new URL("http://localhost:8083/sse")
    );
    console.log('[transport - INIT]')
    await mcpClient.connect(transport);    
    const { tools } = await mcpClient.listTools();
    console.log('[TOOLS]: ', tools)
    console.log('[mcpClient - CONNECTED]')
    
      const question = message
      if (question.toLowerCase() === "exit") {
        throw new Error('EXIT COMMAND')
      }

      try {
        const system = `se inspire nestas categorias de produtos para criar ou buscar categorias de gastos: ${categories} e categorias de entradas: ${incomingCategories}. 
        Você é um agente financeiro, de acordo com este texto de um usuário: ${question}         
        defina se isso tem a ver com uma solicitação de consulta apenas ou um dado que ele esta querendo inserir nos seus gastos ou como um ganho(entrada)`
        console.log('INIT')
        console.log('questionquestion ', question)
        const response = await aiGemini.models.generateContent({
          model: "gemini-2.0-flash",
          contents: system,
          config: {
            toolConfig: {
              functionCallingConfig: {
                // Force it to call any function
                mode: FunctionCallingConfigMode.ANY,
                allowedFunctionNames: ["createMovementAtDatabase", 'getMovementsByCategorySlug', 
                  'getMovementsBetweenDates', 'getMovementsByDescription', 'getEntryMovementsByBetweenDates', 'getExpenseMovementsByBetweenDates'],
              },
            },
            tools: [{ functionDeclarations: controlLightDeclaration }],
          },
        });        

        console.log('FIRST RESPONSE')
        console.log('[response.functionCalls SIZE]: ', response.functionCalls?.length)
        for (const content of response.functionCalls!) {
          try {
            console.log('[CONTENT TOOL]: ', {
              name: content.name!,
              arguments: content.args,
            })
            const result = await mcpClient.callTool({
              name: content.name!,
              arguments: content.args,
            });
            console.log('[RESULT] = mcpClient.callTool: ', result)

            const formattedResult = formatToolResult(result);

            console.log('[formattedResult]:  ', formattedResult)

            const system = `Você é um agente financeiro, de acordo com este texto de um usuário: ${question}, e o retorno de uma ferramenta: ${formattedResult}. 
            
            Retorne um texto não muito grande ao usuário baseado nesse contexto da pergunta os dados retornados da ferramenta.
            Quando receber um resultado de array vazio responda com uma mensagem no sentido de nada ter sido encontrado, mas você tem liberdade para retornar está mensagem.
            
            Quando não receber nada da ferramenta, um array vazio por exemplo, seja direto e use poucas palavras, então responda ao usuário que não tem dados para serem mostrados no contexto do que ele está perguntando.          
            `

            const followUpResponse = await aiGemini.models.generateContent({
              model: "gemini-2.0-flash",
              contents: system,         
            });
            console.log('SECOND RESPONSE')

            if(followUpResponse.candidates){
              followUpResponse.candidates.map(value => {
                console.log('followUpResponse')
                console.log('value.content: ', JSON.stringify(value.finishMessage))
              })
            }            

            if (followUpResponse.text) {
              console.log('followUpResponse.text: ', followUpResponse.text)
            }
          } catch (error: any) {
            return error
          }
        }
      } catch (error: any) {
        return error
      }
    

    process.exit(0);
  } catch (error: any) {
    console.log("general error ", error);
    return error
  }
}
