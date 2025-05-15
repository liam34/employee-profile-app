import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.employee.deleteMany();

  // Add sample employees
  const employees = [
    {
      name: 'John Doe',
      email: 'john.doe@company.com',
      position: 'Senior Software Engineer',
      department: 'Engineering',
      startDate: new Date('2022-01-15'),
      photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      position: 'Product Manager',
      department: 'Product',
      startDate: new Date('2022-03-20'),
      photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      position: 'UX Designer',
      department: 'Design',
      startDate: new Date('2022-06-10'),
      photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
      name: 'Sarah Williams',
      email: 'sarah.williams@company.com',
      position: 'Marketing Specialist',
      department: 'Marketing',
      startDate: new Date('2022-08-05'),
      photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      name: 'David Brown',
      email: 'david.brown@company.com',
      position: 'DevOps Engineer',
      department: 'Engineering',
      startDate: new Date('2022-11-15'),
      photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  ];

  for (const employee of employees) {
    await prisma.employee.create({
      data: employee
    });
  }

  console.log('Sample employee data has been seeded!');

  // Create admin users
  const adminPassword = await hash('admin123', 12);
  const admins = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
    },
    {
      email: 'power1@example.com',
      name: 'Power User 1',
    },
    {
      email: 'power2@example.com',
      name: 'Power User 2',
    },
    {
      email: 'power3@example.com',
      name: 'Power User 3',
    },
    {
      email: 'power4@example.com',
      name: 'Power User 4',
    },
    {
      email: 'newadmin@example.com',
      name: 'New Admin User',
    },
  ];

  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        password: adminPassword,
        name: admin.name,
      },
    });
  }

  console.log('Admin users created:', admins.map(a => a.email));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 