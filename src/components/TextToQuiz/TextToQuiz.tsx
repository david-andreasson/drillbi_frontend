import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QuestionDTO } from '../../types/QuestionDTO';
import { useTranslation } from 'react-i18next';
import Textarea from '../ui/Textarea';
import PrimaryButton from '../ui/PrimaryButton';
import QuestionPreviewList from './QuestionPreviewList';
import LanguageSelector from './LanguageSelector';
import { QuestionSessionProvider, useQuestionSession } from './QuestionSessionContext';
import toast from 'react-hot-toast';


interface UserInfo {
  role: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const toSlug = (input: string) =>
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-\u036f]/g, '')
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

interface InnerTextToQuizProps {
  onReview: (courseName: string) => void;
}

const InnerTextToQuiz: React.FC<InnerTextToQuizProps> = ({ onReview }) => {
  const { t, i18n } = useTranslation();

  const [text, setText] = useState('');
  const [language, setLanguage] = useState<'sv' | 'en'>(i18n.language as 'sv' | 'en');
  const aiModel = localStorage.getItem('aiModel') || 'openai';
  const [estimatedQuestions, setEstimatedQuestions] = useState<number | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [regeneratingQuestionIndex, setRegeneratingQuestionIndex] = useState<number | null>(null);
  const [regeneratingOptionsIndex, setRegeneratingOptionsIndex] = useState<number | null>(null);

  const {
    questions,
    savedFlags,
    setQuestions,
    onToggleSave,
    onRegenerateQuestion,
    onRegenerateOptions,
  } = useQuestionSession();

  // Fetch current user role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<UserInfo>(
          `${API_BASE}/api/v2/users/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserRole(res.data.role);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // Auto-generate slug for name
  useEffect(() => {
    if (!displayName) return;
    const slug = toSlug(displayName);
    if (!name || name === slug) setName(slug);
  }, [displayName]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const overLimit = wordCount > 500;

  const estimateQuestions = (text: string) => {
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (count === 0) return null;
    if (count < 50) return 1;
    if (count < 100) return 2;
    if (count < 150) return 3;
    if (count < 200) return 4;
    if (count < 250) return 5;
    if (count < 300) return 6;
    if (count < 350) return 7;
    if (count < 400) return 8;
    if (count < 450) return 9;
    if (count < 500) return 10;
    return 10; // Max 10 frågor
  };

  useEffect(() => {
    setEstimatedQuestions(estimateQuestions(text));
  }, [text]);

  const handleGenerate = async (maxQuestions?: number) => {
    if (!text || overLimit) {
      toast.error(t('textToQuiz.fillFields'));
      return;
    }
    setLoading(true);
    setQuestions(null, text);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post<QuestionDTO[]>(
        `${API_BASE}/api/v2/generate-questions`,
        { text, courseName: '', language, maxQuestions, aiModel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(data, text);
    } catch (err: any) {
      toast.error(err.response?.data || t('textToQuiz.errorGenerating'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    const selected = questions?.filter((_, i) => savedFlags[i]) || [];
    if (!selected.length || !displayName.trim() || !name.trim()) {
      toast.error(t('textToQuiz.fillFields'));
      return;
    }
    const enriched = selected.map(q => ({
      ...q,
      courseName: name.trim(),
      courseDisplayName: displayName.trim(),
      courseDescription: description.trim(),
    }));
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/api/v2/questions/batch`,
        enriched,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      toast.success(t('textToQuiz.saveSuccess'));
      onReview(name.trim());
    } catch (err: any) {
      toast.error(err.response?.data || t('textToQuiz.saveError'));
    }
  };

  const handleRegenerateQuestion = async (index: number) => {
    setRegeneratingQuestionIndex(index);
    try { await onRegenerateQuestion(index, language); } finally { setRegeneratingQuestionIndex(null); }
  };

  const handleRegenerateOptions = async (index: number) => {
    setRegeneratingOptionsIndex(index);
    try { await onRegenerateOptions(index, language, aiModel); } finally { setRegeneratingOptionsIndex(null); }
  };

  if (loadingUser) return null;
  if (!['ROLE_EDUCATOR', 'ROLE_ADMIN'].includes(userRole || '')) return null;

  return (
    <div className="relative px-4 py-6 max-w-3xl mx-auto text-[#4A4A48]">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('textToQuiz.title')}</h2>

      <div className="relative">
        <Textarea
          placeholder={t('textToQuiz.textPlaceholder') || ''}
          value={text}
          onChange={e => {
            setText(e.target.value);
            setEstimatedQuestions(estimateQuestions(e.target.value));
          }}
          className="w-full mb-4 p-3 border rounded bg-gray-200 text-gray-900 placeholder-gray-700"
        />
      </div>

      {/* Word count, estimate & generate */}
      <div className="mb-6 text-center text-sm">
        <span style={{ fontWeight: 500 }}>
          {t('textToQuiz.wordCount')}: <span style={{ color: overLimit ? 'red' : undefined }}>{wordCount}</span> / 500
        </span>
        {text && estimatedQuestions !== null && (
          <div className="mt-2 text-gray-600">
            {t('textToQuiz.estimatedQuestions', { count: estimatedQuestions })}
          </div>
        )}
        {/* Språkval */}
        <div className="mt-2">
          <LanguageSelector language={language} setLanguage={setLanguage} />
        </div>
        <div className="mt-2">
          <PrimaryButton onClick={() => handleGenerate(estimatedQuestions ?? 1)} disabled={overLimit || !text || loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 mr-1 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t('textToQuiz.generating')}
              </span>
            ) : t('textToQuiz.generateBtn')}
          </PrimaryButton>
        </div>
      </div>

      {/* Preview generated questions */}
      {questions && (
        <QuestionPreviewList
          questions={questions}
          savedFlags={savedFlags}
          onToggleSave={onToggleSave}
          onRegenerateQuestion={handleRegenerateQuestion}
          onRegenerateOptions={handleRegenerateOptions}
          regeneratingQuestionIndex={regeneratingQuestionIndex}
          regeneratingOptionsIndex={regeneratingOptionsIndex}
          disableAll={loading || regeneratingQuestionIndex !== null || regeneratingOptionsIndex !== null}
          aiModel={aiModel}
        />
      )}

      {/* Save to database */}
      {questions && savedFlags.some(f => f) && (
        <div className="mt-6 space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col">
               <input
                 type="text"
                 placeholder={t('textToQuiz.displayNamePlaceholder')}
                 value={displayName}
                 onChange={e => {
                   setDisplayName(e.target.value);
                   setName(toSlug(e.target.value));
                 }}
                 className="p-2 border rounded"
               />
             </div>
            <div className="flex flex-col">
               <input
                 type="text"
                 placeholder={t('textToQuiz.namePlaceholder')}
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="p-2 border rounded"
               />
             </div>
            <div className="flex flex-col">
               <input
                 type="text"
                 placeholder={t('textToQuiz.descriptionPlaceholder')}
                 value={description}
                 onChange={e => setDescription(e.target.value)}
                 className="p-2 border rounded"
               />
             </div>
            <div className="flex justify-center">
              <PrimaryButton onClick={handleSaveToDatabase} disabled={loading}>
                 {t('textToQuiz.writeToDb')}
               </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TextToQuizProps {
  onReview: (courseName: string) => void;
}

const TextToQuiz: React.FC<TextToQuizProps> = ({ onReview }) => {
  return (
    <QuestionSessionProvider>
      <InnerTextToQuiz onReview={onReview} />
    </QuestionSessionProvider>
  );
};
export default TextToQuiz;
