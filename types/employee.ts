// types/employee.ts
export interface Employee {
    id: string;
    createdAt: string; // Dates will be stringified when sent as JSON
    updatedAt: string;
    name: string;
    email: string;
    position: string;
    department?: string | null;
    startDate: string;
    photoUrl?: string | null;
  }