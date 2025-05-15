// app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Our Prisma client

// --- Function to CREATE a new Employee ---
export async function POST(request: NextRequest) {
  try {
    const data = await request.json(); // Get data from the frontend (e.g., name, email)
    const { name, email, position, startDate, department, photoUrl } = data;

    // Basic check: Ensure required fields are there
    if (!name || !email || !position || !startDate) {
      return NextResponse.json({ error: 'Missing required fields: name, email, position, startDate are required.' }, { status: 400 });
    }

    // Use Prisma to create the employee in the database
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        position,
        startDate: new Date(startDate), // Make sure startDate is a proper Date
        department, // This can be null/undefined if optional
        photoUrl,   // This can be null/undefined if optional
      },
    });

    // Send back the newly created employee
    return NextResponse.json(newEmployee, { status: 201 }); // 201 means "Created"

  } catch (error: any) {
    console.error("Error creating employee:", error);
    // Check if it's an error because the email already exists
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ error: 'This email address is already in use.' }, { status: 409 }); // 409 Conflict
    }
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 }); // 500 means "Server error"
  }
}

// --- Function to GET all Employees ---
export async function GET() {
  try {
    // Use Prisma to find all employees, order them by when they were created
    const employees = await prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc', // Show newest first
      },
    });

    // Send back the list of employees
    return NextResponse.json(employees, { status: 200 }); // 200 means "OK"

  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}