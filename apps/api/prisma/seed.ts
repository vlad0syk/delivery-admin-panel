import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.$executeRaw`
    INSERT INTO "User" (id, email, password)
    VALUES ('f1abbbb0-02fc-4c44-b46e-3e5fd468ba2e', 'test@gmail.com', '$2b$10$auZaxyWN/gPkcHO5IgGxTu67xSf5FLsaliSCF2DF67buCiUYdE3AW')
    ON CONFLICT (email) DO UPDATE 
    SET password = EXCLUDED.password, id = EXCLUDED.id;
  `

    console.log("Successfully inserted test user:", user)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
