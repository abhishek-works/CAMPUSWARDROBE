const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Connect to the DB
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log(`NeonDB PostgreSQL Connected via Prisma`);
  } catch (error) {
    console.error(`Error connecting to NeonDB Prisma: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
