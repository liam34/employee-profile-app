// app/page.tsx
'use client'; // This component needs to be a client component for useState, useEffect, and event handlers

import React, { useState, useEffect, useCallback } from 'react';
import EmployeeCard from '@/components/EmployeeCard';
import { EmployeeForm } from '@/components/EmployeeForm';
import { Employee } from '@/types/employee'; // Adjust path if needed
import { SearchBar } from '@/components/SearchBar';

export default function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching employees...');
      const response = await fetch('/api/employees');
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch employees');
      }
      
      const data: Employee[] = await response.json();
      console.log('Received employees:', data);
      setEmployees(data);
    } catch (err: unknown) {
      console.error('Error in fetchEmployees:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFormSubmit = async (
    employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> | Employee
  ) => {
    const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
    const method = editingEmployee ? 'PUT' : 'POST';

    try {
      console.log('Submitting employee data:', employeeData);
      
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(employeeData),
      });

      // Log the response status and headers
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Try to parse the response as JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        console.error('Failed to parse error response as JSON:', e);
        throw new Error('Server returned an invalid response');
      }

      if (!response.ok) {
        throw new Error(errorData.error || `Failed to ${editingEmployee ? 'update' : 'add'} employee`);
      }

      await fetchEmployees(); // Re-fetch employees to update the list
      setShowForm(false);
      setEditingEmployee(null);
    } catch (err: unknown) {
      console.error('Error submitting form:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('An unknown error occurred while submitting the form');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`/api/employees/${employeeId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete employee');
        }
        await fetchEmployees(); // Re-fetch
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          alert(`Error: ${err.message}`);
        } else {
          setError('An unknown error occurred');
          alert('An unknown error occurred');
        }
      }
    }
  };

  const openAddForm = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  }

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (employee.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-end mb-2">
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Logout
        </button>
      </div>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-700">Employee Profiles</h1>
      </header>

      {!showForm && (
        <div className="mb-6 flex justify-between items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          <button
            onClick={openAddForm}
            className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 whitespace-nowrap"
          >
            Add New Employee
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <EmployeeForm
            onSubmit={handleFormSubmit}
            initialData={editingEmployee}
            onCancel={closeForm}
          />
        </div>
      )}

      {isLoading && <p className="text-center text-gray-600">Loading employees...</p>}
      {error && !isLoading && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{`Error: ${error}`}</p>}

      {!isLoading && !error && employees.length === 0 && !showForm && (
        <p className="text-center text-gray-600 text-lg">No employees found. Add one to get started!</p>
      )}

      {!showForm && employees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}