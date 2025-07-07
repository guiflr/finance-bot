import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  FunctionDeclaration,
  Type,
} from "@google/genai";
import { categories } from "../utils/categories";
import { storeMessages } from "../utils/create-examples";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const controlLightDeclaration: FunctionDeclaration[] = [
  {
    name: "getMovementsByDescription",
    description: "busca movimentações pela descrição, usado como um LIKE na base dados para encontrar itens baseado numa descrição",
    parameters: {
      type: Type.OBJECT,
      description: "busca movimentações pela descrição, usado como um LIKE na base dados para encontrar itens baseado numa descrição",
      properties: {
        description: {
          description: `algumas descrições para te dar mais contexto: ${categories}`,
          type: Type.STRING,
        },
      },
      required: ["description"],
    },
  },
  {
    name: "getMovementsByCategorySlug",
    description: "busca uma movimentação pelo slug da categoria",
    parameters: {
      type: Type.OBJECT,
      description: "busca uma movimentação pelo slug da categoria",
      properties: {
        category_slug: {
          description: `alguns slugs de categoria para te dar mais contexto: ${categories}`,
          type: Type.STRING,
        },
      },
      required: ["category_slug"],
    },
  },
  {
    name: "createMovementAtDatabase",
    description: `Adiciona uma movimentação na base de dados, dados que devem ser criados dinamicamente: date => data de criação use esta aqui ${new Date().toISOString()} mas passe para o formato de data do SQL, description => lanche, restaurante, salario algo que que a pessoa tenha descrido na mensagem, category => ao que se refere a descrição, lanche por exemplo esta na categoria Alimentação, category_slug => categoria sem caracteres especiais, type => expense ou entry, phoneNumber => 41999999999
    
    ${storeMessages}
    `,
    parameters: {
      type: Type.OBJECT,      
      properties: {
        date: { type: Type.STRING, default: new Date() },
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
  {
    name: "defaultMessageWhenNotCanDefineMessage",
    description: "Mensagem de erro padrão quando não consegue definir se uma mensagem do usuário é uma consulta ou um comando na base dados.",    
  },
  {
    name: "getMovementsBetweenDates",
    description: `Busca movimentações de sáidas(expense) entre duas datas, utilize esta data como referência, ela é a DATA DE AGORA: ${new Date().toISOString()}  
    para criar novas datas ou formatar alguma data para passar como parâmetro, troque o dias, mês ou horário de startDate e endDate para buscar dados passados, 
    por exemplo se o usuário pede os dados do dia de hoje, você deverá alterar o horario da data buscando da meia noite de hoje até as 23:59 de hoje para encontrar todos os dados de hoje, e assim por diante, faça isso sempre que precisar buscar dados por data, 
    seja de hoje, ontem ou qualquer outro dia, sempre faça essa formatação para que busque os dados dos dias e horários corretos`,
    parameters: {
      type: Type.OBJECT,
      description: "Busca movimentações de sáidas(expense) entre duas datas",
      properties: {
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
        },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "getEntryMovementsByBetweenDates",
    description: `Ferramenta para buscar os ganhos de um usuário, apenas passe as datas e a ferramenta erá buscar apenas movimentações de ganhos(entry),
    entradas, lucros do usuário, utilize esta data como referência, ela é a DATA DE AGORA: ${new Date().toISOString()}  
    para criar novas datas ou formatar alguma data para passar como parâmetro, troque o dias, mês ou horário de startDate e endDate para buscar dados passados, 
    por exemplo se o usuário pede os dados do dia de hoje, você deverá alterar o horario da data buscando da meia noite de hoje até as 23:59 de hoje para encontrar todos os dados de hoje, e assim por diante, faça isso sempre que precisar buscar dados por data, 
    seja de hoje, ontem ou qualquer outro dia, sempre faça essa formatação para que busque os dados dos dias e horários corretos`,
    parameters: {
      type: Type.OBJECT,
      description: "Busca movimentações de entradas(entry) entre duas datas",
      properties: {
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
        },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "getExpenseMovementsByBetweenDates",
    description: `Ferramenta para buscar os gastos de um usuário, apenas passe as datas e a ferramenta erá buscar apenas movimentações de ganhos(expense),
    gastos, despesas do usuário, utilize esta data como referência, ela é a DATA DE AGORA: ${new Date().toISOString()}  
    para criar novas datas ou formatar alguma data para passar como parâmetro, troque o dias, mês ou horário de startDate e endDate para buscar dados passados, 
    por exemplo se o usuário pede os dados do dia de hoje, você deverá alterar o horario da data buscando da meia noite de hoje até as 23:59 de hoje para encontrar todos os dados de hoje, e assim por diante, faça isso sempre que precisar buscar dados por data, 
    seja de hoje, ontem ou qualquer outro dia, sempre faça essa formatação para que busque os dados dos dias e horários corretos`,
    parameters: {
      type: Type.OBJECT,
      description: "Busca movimentações de gastos(expense) entre duas datas",
      properties: {
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
        },
      required: ["startDate", "endDate"],
    },
  },
];

export const aiGemini = new GoogleGenAI({
  apiKey: "",
});
