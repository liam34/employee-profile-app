// app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '@/lib/prisma';

// --- Function to CREATE a new Employee ---
export async function POST(request: NextRequest) {
  try {
    // Log the incoming request
    console.log('Received POST request to /api/employees');
    
    const data = await request.json(); // Get data from the frontend (e.g., name, email)
    console.log('Request data:', data);
    
    const { name, email, position, startDate, department, photoUrl } = data;

    // Basic check: Ensure required fields are there
    if (!name || !email || !position || !startDate) {
      console.log('Missing required fields:', { name, email, position, startDate });
      return NextResponse.json(
        { error: 'Missing required fields: name, email, position, startDate are required.' },
        { status: 400 }
      );
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

    console.log('Successfully created employee:', newEmployee);
    return NextResponse.json(newEmployee, { status: 201 }); // 201 means "Created"

  } catch (error: unknown) {
    console.error("Error creating employee:", error);
    // Check if it's a Prisma error
    if (error instanceof PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes('email')
      ) {
        return NextResponse.json(
          { error: 'This email address is already in use.' },
          { status: 409 }
        );
      }
    }
    
    // Check if it's a database connection error
    if (error instanceof Error && 
        (error.message.includes('connect') || error.message.includes('connection'))) {
      return NextResponse.json(
        { error: 'Database connection error. Please check your database configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create employee. Please try again.' },
      { status: 500 }
    );
  }
}

// --- Function to GET all Employees ---
export async function GET() {
  try {
    console.log('Received GET request to /api/employees');
    
    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (connError) {
      console.error('Database connection error:', connError);
      return new NextResponse(
        JSON.stringify({ error: 'Database connection failed. Please check your database configuration.' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    console.log('Attempting to fetch employees from database...');
    const employees = await prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Successfully found ${employees.length} employees:`, employees);
    return new NextResponse(
      JSON.stringify(employees),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: unknown) {
    console.error("Error fetching employees:", error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error instanceof PrismaClientKnownRequestError) {
        console.error('Prisma error code:', error.code);
        return new NextResponse(
          JSON.stringify({ error: `Database error: ${error.message}` }),
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      if (error.message.includes('connect') || error.message.includes('connection')) {
        return new NextResponse(
          JSON.stringify({ error: 'Database connection error. Please check your database configuration.' }),
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch employees. Please try again.' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}