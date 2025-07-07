// MCP Server com ferramentas usando @modelcontextprotocol/sdk

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { z } from "zod";
import { prisma } from "../prisma/client";

async function getMovementsByCategorySlug({ category_slug }: { category_slug: string }) {
  const movements = await prisma.movements.findMany({
    where: { category_slug: { equals: category_slug } },
  });
  const formattedMovements = movements.map((movement) => ({
    type: "text" as const,
    text: JSON.stringify(movement),
  }));
  return { content: formattedMovements };
}

async function getMovementsByDescription({ description }: { description: string }) {
  const movements = await prisma.movements.findMany({
    where: { description: { contains: description } },
  });
  const formattedMovements = movements.map((movement) => ({
    type: "text" as const,
    text: JSON.stringify(movement),
  }));
  return { content: formattedMovements };
}

async function getEntryMovementsByBetweenDates({ endDate, startDate }: { startDate: string; endDate: string }) {
  const movements = await prisma.movements.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      AND: {
        type: 'entry'
      }
    },
  });
  const formattedMovements = movements.map((movement) => ({
    type: "text" as const,
    text: JSON.stringify(movement),
  }));
  return { content: formattedMovements };
}

async function getExpenseMovementsByBetweenDates({ endDate, startDate }: { startDate: string; endDate: string }) {
  const movements = await prisma.movements.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      AND: {
        type: 'expense'
      }
    },
  });
  const formattedMovements = movements.map((movement) => ({
    type: "text" as const,
    text: JSON.stringify(movement),
  }));
  return { content: formattedMovements };
}

const server = new McpServer({
  name: "Movements MCP Server",
  version: "1.0.0",
});

// Ferramenta: Consulta por categoria
server.tool(
  "getMovementsByCategorySlug",
  "busca uma movimentação por categoria",
  {
    category_slug: z.string(),
  },
  getMovementsByCategorySlug
);

// Ferramenta: Consulta por descrição
server.tool(
  "getMovementsByDescription",
  "busca uma movimentação por pela descrição",
  {
    description: z.string(),
  },
  getMovementsByDescription
);

// Ferramenta: Consulta ganhos por data
server.tool(
  "getEntryMovementsByBetweenDates",
  "busca uma movimentação de ganho(entry) por data",
  {
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  },
  getEntryMovementsByBetweenDates
);

// Ferramenta: Consulta gastos por data
server.tool(
  "getExpenseMovementsByBetweenDates",
  "Busca movimentações de gastos(entry) entre duas datas",
  {
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  },
  getExpenseMovementsByBetweenDates
);


// Ferramenta: Consulta por últimos X dias
server.tool(
  "getMovementsLastDays",
  "Busca movimentos dos últimos X dias",
  {
    days: z.number(),
  },
  async ({ days }) => {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const movements = await prisma.movements.findMany({
      where: {
        date: {
          gte: sinceDate,
        },
      },
    });
    const formattedMovements = movements.map((movement) => ({
      type: "text" as const,
      text: JSON.stringify(movement.description),
    }));
    return { content: formattedMovements };
  }
);

// Ferramenta: Consulta entre duas datas
server.tool(
  "getMovementsBetweenDates",
  "Busca movimentações de sáidas(expense) entre duas datas",
  {
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  },
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const movements = await prisma.movements.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });
    const formattedMovements = movements.map((movement) => ({
      type: "text" as const,
      text: JSON.stringify(movement),
    }));
    return { content: formattedMovements };
  }
);

server.tool(
  "createMovementAtDatabase",
  "Adiciona uma movimentação na base de dados",
  {
    date: z.string().datetime(),
    description: z.string(),
    category: z.string(),
    category_slug: z.string(),
    amount: z.number(),
    type: z.string(),
    phoneNumber: z.string(),
  },
  async (data: {
    date: string;
    description: string;
    category: string;
    category_slug: string;
    amount: number;
    type: string;
    phoneNumber: string;
  }) => {
    const created = await prisma.movements.create({ data });
    const formattedMovements = {
      type: "text" as const,
      text: JSON.stringify(created),
    };
    return { content: [formattedMovements] };
  }
);

server.tool(
  "defaultMessageWhenNotCanDefineMessage",
  "Mensagem de erro padrão quando não consegue definir se uma mensagem do usuário é uma consulta ou um comando na base dados.",
  {},
  async () => {   
    const formattedMovements = {
      type: "text" as const,
      text: 'Não consegui definir se você está querendo fazer uma consulta ou inserir um gasto ou um ganho',
    }
    return { content: [formattedMovements] };
  }
);

export { server };
