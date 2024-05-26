// Importa o PrismaClient do pacote @prisma/client
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate'

// Cria uma instância do PrismaClient chamada prismaClient
export const prismaClient = new PrismaClient().$extends(withAccelerate())


