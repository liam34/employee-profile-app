const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Please provide email and new password');
    process.exit(1);
  }

  try {
    const hashedPassword = await hash(newPassword, 12);
    
    const admin = await prisma.admin.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    console.log('Admin password updated successfully for:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 