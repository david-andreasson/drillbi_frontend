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
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simple validation
  const validate = () => {
    if (!name.trim() || !displayName.trim() || !description.trim()) {
      setError(t('courseCreate.allFieldsRequired'));
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
      // Keep values if user wants to add questions directly
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
    <div className="max-w-xl w-[28rem] mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{t('courseCreate.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">{t('courseCreate.courseNameLabel')}</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder={t('courseCreate.courseNamePlaceholder')}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">{t('courseCreate.displayNameLabel')}</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            placeholder={t('courseCreate.displayNamePlaceholder')}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">{t('courseCreate.descriptionLabel')}</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            placeholder={t('courseCreate.descriptionPlaceholder')}
          />
        </div>
        {error && <div className="text-red-500">{t('courseCreate.error', error)}</div>}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-2 text-center text-lg font-semibold">
            <div>{t('courseCreate.success')}</div>
            <div className="text-green-700 text-base mt-1">{t('courseCreate.addQuestionsInfo')}</div>
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
