import React from 'react';

const TestLayoutPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 bg-red-200 w-full">
      <div className="bg-blue-200 w-64 h-64 mx-auto my-10 flex items-center justify-center text-lg font-bold">
        Test
      </div>
    </div>
  );
};

export default TestLayoutPage;
