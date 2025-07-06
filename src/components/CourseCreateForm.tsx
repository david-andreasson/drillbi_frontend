import React, { useState } from 'react';
import { fetchWithAuth } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './ui/PrimaryButton';

interface Props {
  onCreated?: (course: { name: string; displayName: string; description: string }) => void;
  onCancel?: () => void;
  onAddQuestions?: (course: { name: string; displayName: string; description: string }) => void;
}

const CourseCreateForm: React.FC<Props> = ({ onCreated, onCancel, onAddQuestions }) => {
  const { t, i18n } = useTranslation();
  // DEBUG: Log i18n instance and language
  console.log('CourseCreateForm i18n instance:', i18n);
  console.log('CourseCreateForm i18n.language:', i18n.language);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  // Slugify function (copied from TextToQuiz)
  const toSlug = (input: string) =>
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-\u036f]/g, '')
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // Auto-generate slug if displayName changes and name not manually edited
  React.useEffect(() => {
    if (!displayName) return;
    const slug = toSlug(displayName);
    if (!nameTouched) setName(slug);
  }, [displayName]);

  // Name validation: only allow a-z, 0-9, dash
  const isNameValid = !name || /^[a-z0-9-]+$/.test(name);
  const nameError = !isNameValid ? t('courseCreate.nameInvalid') : null;

  // Simple validation
  const validate = () => {
    if (!displayName.trim()) {
      setError(t('courseCreate.displayNameRequired'));
      return false;
    }
    if (!name.trim()) {
      setError(t('courseCreate.courseNameRequired'));
      return false;
    }
    if (!isNameValid) {
      setError(t('courseCreate.nameInvalid'));
      return false;
    }
    setError(null);
    return true;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/v2/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          displayName,
          description,
        })
      });
      if (!res.ok) {
        let errorMsg = 'courseCreate.errorUnknown';
        try {
          const text = await res.text();
          // If backend returns an error key, use it directly
          if (text && text.startsWith('error.')) {
            errorMsg = text.trim();
          }
        } catch {}
        throw new Error(errorMsg);
      }
      setSuccess(true);
      if (onCreated) onCreated({ name, displayName, description });
      // Clear form fields after success (unless user is about to add questions)
      setDisplayName('');
      setName('');
      setDescription('');
      setNameTouched(false);
    } catch (err: any) {
      // If error is a backend error key, translate via t()
      if (err.message && err.message.startsWith('error.')) {
        setError(t(err.message));
      } else {
        setError(t('courseCreate.errorUnknown'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-[28rem] mx-auto bg-white dark:bg-neutral-900 p-8 rounded shadow dark:text-neutral-100">
      <h2 className="text-2xl font-bold mb-4">{t('courseCreate.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">{t('courseCreate.displayNameLabel')}</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-200 text-neutral-900 placeholder-gray-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-gray-400 dark:border-neutral-700"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            placeholder={t('courseCreate.displayNamePlaceholder')}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">{t('courseCreate.courseNameLabel')}</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-200 text-neutral-900 placeholder-gray-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-gray-400 dark:border-neutral-700"
            value={name}
            onChange={e => { setName(e.target.value); setNameTouched(true); }}
            placeholder={t('courseCreate.courseNamePlaceholder')}
            aria-invalid={!isNameValid}
          />
          {nameError && (
            <div className="text-sm text-red-500 dark:text-red-400 mt-1">{nameError}</div>
          )}
          {!nameTouched && displayName && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('courseCreate.autoSuggestedName')}</div>
          )}
        </div>
        <div>
          <label className="block font-semibold mb-1">{t('courseCreate.descriptionLabel')}</label>
          <textarea
            className="w-full border rounded px-3 py-2 bg-gray-200 text-neutral-900 placeholder-gray-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-gray-400 dark:border-neutral-700"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            placeholder={t('courseCreate.descriptionPlaceholder')}
          />
        </div>
        {error && <div className="text-red-500 dark:text-red-400">{t('courseCreate.error', { error })}</div>}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200 px-4 py-3 rounded mb-2 text-center text-lg font-semibold">
            <div>{t('courseCreate.success')}</div>
            <div className="text-green-700 dark:text-green-300 text-base mt-1">{t('courseCreate.addQuestionsInfo')}</div>
          </div>
        )}
        <PrimaryButton type="submit" className="w-full" disabled={loading}>
          {loading ? t('courseCreate.saving') : t('courseCreate.create')}
        </PrimaryButton>
        {onCancel && (
          <button
            type="button"
            className="w-full mt-2 text-sm underline text-gray-700 dark:text-gray-200"
            onClick={onCancel}
          >
            {t('courseCreate.cancel')}
          </button>
        )}
        {success && onAddQuestions && (
          <PrimaryButton
            type="button"
            className="w-full mt-4 bg-orange-400 hover:bg-orange-500 text-white"
            onClick={() => onAddQuestions({ name, displayName, description })}
          >
            {t('courseCreate.addQuestions')}
          </PrimaryButton>
        )}
      </form>
    </div>
  );
};

export default CourseCreateForm;
