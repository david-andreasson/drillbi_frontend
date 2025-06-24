import React from 'react';

interface Props {
  preselectedCourse?: string;
}

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './ui/PrimaryButton';
import { toast } from 'react-hot-toast';
import { useCourses } from './CourseSelection/useCourses';

const QuestionCreatePage: React.FC<Props> = ({ preselectedCourse }) => {
  const { t, i18n } = useTranslation();
  const [refreshCourses, setRefreshCourses] = useState(0);
  const { courses, loading: loadingCourses, error: errorCourses } = useCourses(refreshCourses);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(preselectedCourse);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { optionLabel: 'A', optionText: '', isCorrect: false },
    { optionLabel: 'B', optionText: '', isCorrect: false },
    { optionLabel: 'C', optionText: '', isCorrect: false },
    { optionLabel: 'D', optionText: '', isCorrect: false },
  ]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    setRefreshCourses(rc => rc + 1);
  }, []);

  useEffect(() => {
    if (preselectedCourse && courses.length > 0) {
      const match = courses.find(c => c.name === preselectedCourse);
      if (match) {
        setSelectedCourse(preselectedCourse);
      }
    }
  }, [preselectedCourse, courses]);

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(opts => opts.map((opt, i) => i === idx ? { ...opt, optionText: value } : opt));
  };
  const handleCorrectChange = (idx: number) => {
    setCorrectIndex(idx);
    setOptions(opts => opts.map((opt, i) => ({ ...opt, isCorrect: i === idx })));
  };
  const MAX_IMAGE_SIZE_MB = 5;
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
    if (file) {
      console.log('Selected image size:', file.size, 'bytes. Limit:', maxBytes, 'bytes.');
    }
    if (file && file.size > maxBytes) {
      setImage(null);
      setImagePreview(null);
      setImageError(t('questionCreate.imageTooLarge'));
      return;
    }
    setImageError(null);
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Prepare backend call
  const sendQuestionToBackend = async () => {
    try {
      const formData = new FormData();
      formData.append('questionText', questionText);
      formData.append('options', JSON.stringify(options));
      formData.append('correctIndex', correctIndex !== null ? String(correctIndex) : '');
      if (image) {
        formData.append('image', image);
      }
      if (selectedCourse) {
        formData.append('courseName', selectedCourse);
      }

      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE}/api/v2/questions/create`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      if (response.status === 401 || response.status === 403) {
        import('react-hot-toast').then(({ toast }) => toast.error(t('auth.sessionExpired'), { duration: 5000, position: 'top-center' }));
        throw new Error('auth.sessionExpired');
      }
      if (!response.ok) {
        throw new Error('error.questionCreateFailed');
      }
      // Handle the returned QuestionDTO object
      const data = await response.json();
      // Show uploaded image directly after saving if desired
      if (data.imageUrl) {
        setImagePreview(data.imageUrl);
      }
      return data;
    } catch (err: any) {
      toast.error(t('questionCreate.apiError') + (err?.message || err));
      throw err;
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      setError(t('questionCreate.selectCourse'));
      return;
    }
    if (!questionText.trim() || options.some(opt => !opt.optionText.trim()) || correctIndex === null) {
      setError(t('questionCreate.error'));
      return;
    }
    setError(null);
    try {
      const result = await sendQuestionToBackend();
      setSuccess(true);
      toast.success(t('questionCreate.success'), { duration: 3500, position: 'top-center' });
      // Reset form after question is saved
      setQuestionText('');
      setOptions([
        { optionLabel: 'A', optionText: '', isCorrect: false },
        { optionLabel: 'B', optionText: '', isCorrect: false },
        { optionLabel: 'C', optionText: '', isCorrect: false },
        { optionLabel: 'D', optionText: '', isCorrect: false },
      ]);
      setCorrectIndex(null);
      setImage(null);
      setImagePreview(null);
      setError(null);
      setRefreshCourses(rc => rc + 1);
    } catch (err: any) {
      if (err.message && err.message.startsWith('error.')) {
        setError(t(err.message));
      } else {
        setError(t('error.questionCreateFailed'));
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-neutral-900 dark:text-neutral-100 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {t('questionCreate.title')}
      </h2>
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center text-lg font-semibold">
          {t('questionCreate.success')}
          <div className="text-green-900 text-base mt-2">{t('questionCreate.nextStep')}</div>
        </div>
      )}
      {errorCourses && (
        <div className="text-red-500 dark:text-red-400 text-sm mt-2">{t('questionCreate.coursesError', errorCourses)}</div>
      )}
      <div className="mb-4">
        <label className="block font-semibold mb-1 dark:text-neutral-100">{t('questionCreate.selectCourse')}</label>
        <select
          className="w-full border rounded px-3 py-2 bg-white text-neutral-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
          value={selectedCourse || ''}
          onChange={e => setSelectedCourse(e.target.value)}
          disabled={loadingCourses}
        >
          <option value="" disabled>{t('questionCreate.selectCoursePlaceholder')}</option>
          {courses.map(c => (
            <option key={c.name} value={c.name}>{c.displayName || c.name}</option>
          ))}
        </select>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image upload */}
        <div className="mb-4">
          <label className="block font-semibold mb-1 dark:text-neutral-100">Bild (valfritt)</label>
          <input type="file" accept="image/*" className="mb-2" onChange={handleImageChange} />
          {imageError && (
            <div className="flex items-center text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded px-3 py-2 mb-2 text-sm">
              <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              {imageError}
            </div>
          )}
          <div className="w-full h-32 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-400 dark:text-neutral-100 rounded">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-32 object-contain" />
            ) : (
              <span>{t('questionCreate.noImageSelected')}</span>
            )}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1 dark:text-neutral-100">{t('questionCreate.questionText')}</label>
          <textarea
            className="w-full border rounded px-3 py-2 bg-gray-200 text-neutral-900 placeholder-gray-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-gray-400 dark:border-neutral-700"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            required
            rows={3}
            placeholder={t('questionCreate.questionTextPlaceholder')}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 dark:text-neutral-100">{t('questionCreate.options')}</label>
          <div className="grid grid-cols-1 gap-2">
            {options.map((opt, idx) => (
              <div key={opt.optionLabel} className="flex items-center gap-2">
                <span className="mr-2 font-bold w-6 text-center dark:text-neutral-100">{opt.optionLabel}</span>
                <span className="mr-2 font-bold w-6 text-center">{opt.optionLabel}</span>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2 bg-gray-200 text-neutral-900 placeholder-gray-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-gray-400 dark:border-neutral-700"
                  placeholder={t('questionCreate.optionPlaceholder', { label: opt.optionLabel })}
                  value={opt.optionText}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  required
                />
                <div className="flex items-center min-w-[100px] justify-end">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctIndex === idx}
                    onChange={() => handleCorrectChange(idx)}
                    className="accent-orange-500 ml-2"
                    required
                  />
                  {correctIndex === idx && (
                    <span className="text-xs text-orange-600 ml-1 font-semibold">{t('questionCreate.correctAnswer')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {error && <div className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</div>}
        <PrimaryButton type="submit" className="w-full mt-2 bg-orange-400 hover:bg-orange-500 text-white">
          {t('questionCreate.create')}
        </PrimaryButton>
      </form>
    </div>
  );
};

export default QuestionCreatePage;
