import { prisma } from "../prisma/client";

export const rawQuery = async (sql: string) => {
    console.log('query ', sql)
    return  prisma.$queryRawUnsafe(sql);
}