import React from 'react';

interface Props {
  preselectedCourse?: string;
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './ui/PrimaryButton';
import { toast } from 'react-hot-toast';

const QuestionCreatePage: React.FC<Props> = ({ preselectedCourse }) => {
  const { t, i18n } = useTranslation();
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

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(opts => opts.map((opt, i) => i === idx ? { ...opt, optionText: value } : opt));
  };
  const handleCorrectChange = (idx: number) => {
    setCorrectIndex(idx);
    setOptions(opts => opts.map((opt, i) => ({ ...opt, isCorrect: i === idx })));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
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

  // Steg 3: Förbered backend-anrop
  const sendQuestionToBackend = async () => {
    try {
      const formData = new FormData();
      formData.append('questionText', questionText);
      formData.append('options', JSON.stringify(options));
      formData.append('correctIndex', correctIndex !== null ? String(correctIndex) : '');
      if (image) {
        formData.append('image', image);
      }
      if (preselectedCourse) {
        formData.append('courseName', preselectedCourse);
      }
      // Lägg till språk om det behövs
      // formData.append('language', i18n.language);

      const response = await fetch('/api/questions/create', {
        method: 'POST',
        body: formData,
        headers: {
          // Låt browser sätta Content-Type (multipart/form-data)
        },
      });
      if (!response.ok) {
        throw new Error(await response.text() || 'Misslyckades att spara frågan');
      }
    } catch (err: any) {
      toast.error(t('questionCreate.apiError', 'Kunde inte spara frågan: ') + (err?.message || err));
      throw err;
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || options.some(opt => !opt.optionText.trim()) || correctIndex === null) {
      setError(t('questionCreate.error', 'Fyll i alla fält och markera rätt svar.'));
      return;
    }
    setError(null);
    await sendQuestionToBackend();
    setSuccess(true);
    toast.success(t('questionCreate.success', 'Frågan sparades!'), { duration: 3500, position: 'top-center' });
    // Rensa formuläret när frågan sparats
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
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">
        {preselectedCourse ? t('questionCreate.titleForCourse', { course: preselectedCourse }) : t('questionCreate.title', 'Lägg till frågor')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bilduppladdning */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Bild (valfritt)</label>
          <input type="file" accept="image/*" className="mb-2" onChange={handleImageChange} />
          <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 rounded">
            {imagePreview ? (
              <img src={imagePreview} alt="Förhandsvisning" className="max-h-32 object-contain" />
            ) : (
              <span>Ingen bild vald</span>
            )}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">{t('questionCreate.questionText', 'Frågetext')}</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            required
            rows={3}
            placeholder={t('questionCreate.questionTextPlaceholder', 'Skriv frågan här...')}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">{t('questionCreate.options', 'Svarsalternativ')}</label>
          <div className="grid grid-cols-1 gap-2">
            {options.map((opt, idx) => (
              <div key={opt.optionLabel} className="flex items-center gap-2">
                <span className="mr-2 font-bold w-6 text-center">{opt.optionLabel}</span>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder={t('questionCreate.optionPlaceholder', `Alternativ ${opt.optionLabel}`, { label: opt.optionLabel })}
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
                    <span className="text-xs text-orange-600 ml-1 font-semibold">Rätt svar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        <PrimaryButton type="submit" className="w-full mt-2 bg-orange-400 hover:bg-orange-500 text-white">
          {t('questionCreate.create', 'Lägg till fråga')}
        </PrimaryButton>
      </form>
    </div>
  );
};

export default QuestionCreatePage;
