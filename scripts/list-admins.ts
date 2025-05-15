import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

async function main() {
  try {
    console.log('Fetching all admin users...');
    const admins = await prisma.admin.findMany();
    
    console.log('Found', admins.length, 'admin users:');
    admins.forEach((admin: Admin) => {
      console.log({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        createdAt: admin.createdAt
      });
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 