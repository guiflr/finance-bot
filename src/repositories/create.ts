import { prisma } from "../prisma/client";

export const saveTransaction = async (transaction: any) => {
    return prisma.transaction.create({ data: transaction });
  };