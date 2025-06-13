import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { formatToolResult } from "./utils.js";
import {
  GoogleGenAI,
  FunctionCallingConfigMode,  
} from "@google/genai";
import {  controlLightDeclaration } from "../ai/google.js";

async function main() {
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
    while (true) {
      const question = "lanche 10";
      if (question.toLowerCase() === "exit") {
        break;
      }

      try {
        console.log('INIT')
        const response = await aiGemini.models.generateContent({
          model: "gemini-2.0-flash",
          contents: question,
          config: {
            toolConfig: {
              functionCallingConfig: {
                // Force it to call any function
                mode: FunctionCallingConfigMode.ANY,
                allowedFunctionNames: ["createMovementAtDatabase"],
              },
            },
            tools: [{ functionDeclarations: controlLightDeclaration }],
          },
        });        

        console.log('FIRST RESPONSE')
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

            const followUpResponse = await aiGemini.models.generateContent({
              model: "gemini-2.0-flash",
              contents: [question, formattedResult ],
              config: {
                toolConfig: {
                  functionCallingConfig: {
                    // Force it to call any function
                    mode: FunctionCallingConfigMode.ANY,
                    allowedFunctionNames: ["createMovementAtDatabase"],
                  },
                },
                tools: [{ functionDeclarations: controlLightDeclaration }],
              },
            });
            console.log('SECOND RESPONSE')

            if(followUpResponse.candidates){
              followUpResponse.candidates.map(value => {
                console.log('followUpResponse')
                console.log('value.content: ', value.content)
              })
            }

            if (followUpResponse.text) {
              console.log('followUpResponse.text: ', followUpResponse.text)
            }
          } catch (error: any) {
            console.log("error ", error);
          }
        }
      } catch (error: any) {
        console.log("while error ", error);
      }
    }

    process.exit(0);
  } catch (error: any) {
    console.log("general error ", error);
    process.exit(1);
  }
}

main().catch((error) => {
  process.exit(1);
});
