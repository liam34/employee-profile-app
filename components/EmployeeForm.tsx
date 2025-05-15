// components/EmployeeForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Employee } from '@/types/employee';
import Image from 'next/image';

interface EmployeeFormProps {
  onSubmit: (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> | Employee) => Promise<void>;
  initialData?: Employee | null; // For editing
  onCancel?: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setPosition(initialData.position);
      setDepartment(initialData.department || '');
      setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '');
      if (initialData.photoUrl) {
        setPhotoPreview(initialData.photoUrl);
      }
    } else {
      // Reset form for new employee
      setName('');
      setEmail('');
      setPosition('');
      setDepartment('');
      setStartDate('');
      setPhotoFile(null);
      setPhotoPreview('');
    }
  }, [initialData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Photo size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let photoUrl = initialData?.photoUrl || null;
      
      if (photoFile) {
        // Here you would typically upload the file to your server or cloud storage
        // For now, we'll use the base64 string as the photo URL
        photoUrl = photoPreview;
      }

      const employeeData = {
        name,
        email,
        position,
        department: department || null,
        startDate,
        photoUrl,
      };

      if (initialData) {
        await onSubmit({ ...initialData, ...employeeData });
      } else {
        await onSubmit(employeeData as Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      
      <div>
        <label htmlFor="name" className={labelClasses}>Full Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClasses}>Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="position" className={labelClasses}>Position</label>
        <input
          type="text"
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="department" className={labelClasses}>Department (Optional)</label>
        <input
          type="text"
          id="department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="startDate" className={labelClasses}>Start Date</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Photo</label>
        <div className="mt-2 flex items-center space-x-4">
          {photoPreview && (
            <div className="relative w-20 h-20">
              <Image
                src={photoPreview}
                alt="Preview"
                width={80}
                height={80}
                className="w-full h-full object-cover rounded-full"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {photoPreview ? 'Change Photo' : 'Upload Photo'}
            </label>
            <p className="mt-1 text-sm text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 text-white rounded-md ${isLoading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} transition-colors`}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
};