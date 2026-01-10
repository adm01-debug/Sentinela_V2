import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  id: string;
  message: string;
}

export const FormError: React.FC<FormErrorProps> = ({ id, message }) => (
  <div
    id={id}
    role="alert"
    aria-live="polite"
    className="flex items-center gap-2 text-sm text-red-600 mt-1"
  >
    <AlertCircle size={16} aria-hidden="true" />
    <span>{message}</span>
  </div>
);

export default FormError;
