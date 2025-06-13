import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  FunctionDeclaration,
  Type,
} from "@google/genai";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const controlLightDeclaration: FunctionDeclaration[] = [
  {
    name: "getMovementsByCategory",
    description: "busca uma movimentação por categoria",
    parameters: {
      type: Type.OBJECT,
      description: "Parâmetros para buscar item pela categoria",
      properties: {
        category: {
          type: Type.STRING,
        },
      },
      required: ["category"],
    },
  },
  {
    name: "createMovementAtDatabase",
    description: "Adiciona uma movimentação na base de dados",
    parameters: {
      type: Type.OBJECT,
      description: "Adiciona uma movimentação na base de dados, dados que devem ser criados dinamicamente: date => data de criação(agora), description => lanche, restaurante, salario algo que que a pessoa tenha descrido na mensagem, category => ao que se refere a descrição, lanche por exemplo esta na categoria Alimentação, category_slug => categoria sem caracteres especiais, type => expense ou entry, phoneNumber => 41999999999",
      properties: {
        date: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        category_slug: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        type: { type: Type.STRING },
        phoneNumber: { type: Type.STRING },
      },
      required: [
        "date",
        "description",
        "category",
        "category_slug",
        "amount",
        "type",
        "phoneNumber",
      ],
    },
  },
];

export const aiGemini = new GoogleGenAI({
  apiKey: "",
});
