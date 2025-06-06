import { prisma } from "../prisma/client";

export const rawQuery = async (sql: string) => {
    return  prisma.$queryRawUnsafe(sql);
}