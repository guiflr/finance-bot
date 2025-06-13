// MCP Server com ferramentas usando @modelcontextprotocol/sdk

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { z } from "zod";
import { prisma } from "../prisma/client";

async function getMovementsByCategory({ category }: { category: string }) {
  const movements = await prisma.movements.findMany({
    where: { category: { equals: category } },
  });
  const formattedMovements = movements.map((movement) => ({
    type: "text" as const,
    text: JSON.stringify(movement.description),
  }));
  return { content: formattedMovements };
}

const server = new McpServer({
  name: "Movements MCP Server",
  version: "1.0.0",
});

// Ferramenta: Consulta por categoria
server.tool(
  "getMovementsByCategory",
  "busca uma movimentação por categoria",
  {
    category: z.string(),
  },
  getMovementsByCategory
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
  "Busca movimentos entre duas datas",
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
      text: JSON.stringify(movement.description),
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

export { server };
