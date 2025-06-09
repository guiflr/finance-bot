import { prisma } from "../prisma/client";

export const saveTransaction = async (transaction: any) => {
    return prisma.movements.create({ data: {...transaction, date: new Date()} });
  };