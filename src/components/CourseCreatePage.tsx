import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCreateForm from './CourseCreateForm';

interface Props {
  onCancel?: () => void;
  onAddQuestions?: (course: { name: string; displayName: string; description: string }) => void;
}

const CourseCreatePage: React.FC<Props> = ({ onCancel, onAddQuestions }) => {
  const navigate = useNavigate();

  const handleAddQuestions = (course: { name: string; displayName: string; description: string }) => {
    // Navigera till frågeskaparsidan med kursnamnet som parameter
    navigate(`/questions/create?course=${encodeURIComponent(course.name)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <CourseCreateForm 
        onCancel={onCancel} 
        onAddQuestions={onAddQuestions ?? handleAddQuestions} 
      />
    </div>
  );
};

export default CourseCreatePage;
