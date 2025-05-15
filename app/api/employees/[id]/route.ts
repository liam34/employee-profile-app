// app/api/employees/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  id: string; // The [id] from the URL will be available here
}

// --- Function to GET a single Employee by ID ---
export async function GET(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    const { id } = params; // Get the ID from the URL

    // Use Prisma to find that specific employee
    const employee = await prisma.employee.findUnique({
      where: { id: id },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 }); // 404 "Not Found"
    }

    return NextResponse.json(employee, { status: 200 }); // "OK"

  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

// --- Function to UPDATE an Employee by ID ---
export async function PUT(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    const { id } = params; // Get the ID from the URL
    const data = await request.json(); // Get the updated data from the frontend
    const { name, email, position, startDate, department, photoUrl } = data;

    // Use Prisma to update the employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: id },
      data: {
        name,
        email,
        position,
        startDate: startDate ? new Date(startDate) : undefined, // Update only if provided
        department,
        photoUrl,
      },
    });

    return NextResponse.json(updatedEmployee, { status: 200 }); // "OK"

  } catch (error: any) {
    console.error("Error updating employee:", error);
    if (error.code === 'P2025') { // Prisma error code for "Record to update not found"
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ error: 'This email address is already in use by another employee.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

// --- Function to DELETE an Employee by ID ---
export async function DELETE(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    const { id } = params; // Get the ID from the URL

    // Use Prisma to delete the employee
    await prisma.employee.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Employee deleted successfully' }, { status: 200 }); // "OK"
    // You could also return status 204 "No Content" which is common for DELETE success

  } catch (error: any) {
    console.error("Error deleting employee:", error);
    if (error.code === 'P2025') { // Prisma error code for "Record to delete not found"
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}