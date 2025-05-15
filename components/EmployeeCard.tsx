// components/EmployeeCard.tsx
import React from 'react';
import Image from 'next/image';
import { Employee } from '@/types/employee'; // Adjust path if needed

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-50 shadow-lg rounded-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="flex items-center space-x-4">
        {employee.photoUrl ? (
          <Image
            src={employee.photoUrl}
            alt={employee.name}
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-400 flex items-center justify-center text-gray-600 text-2xl">
            {employee.name.charAt(0)}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{employee.name}</h2>
          <p className="text-indigo-700">{employee.position}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-gray-800">
        <p><strong>Email:</strong> {employee.email}</p>
        {employee.department && <p><strong>Department:</strong> {employee.department}</p>}
        <p><strong>Start Date:</strong> {new Date(employee.startDate).toLocaleDateString()}</p>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => onEdit(employee)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(employee.id)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;