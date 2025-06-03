import React from 'react';
import CourseCreateForm from './CourseCreateForm';

interface Props {
  onCancel?: () => void;
  onAddQuestions?: (course: { name: string; displayName: string; description: string }) => void;
}

const CourseCreatePage: React.FC<Props> = ({ onCancel, onAddQuestions }) => {
  // TODO: Implementera navigation till frågeskaparsidan (med förvald kurs)
  const handleAddQuestions = (course: { name: string; displayName: string; description: string }) => {
    // Här ska navigation ske, t.ex. via context eller prop från App
    // Exempel: navigateToQuestionCreate(course.name)
    alert('Navigera till frågeskaparsidan med kurs: ' + course.name);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <CourseCreateForm onCancel={onCancel} onAddQuestions={onAddQuestions ?? handleAddQuestions} />
    </div>
  );
};

export default CourseCreatePage;
