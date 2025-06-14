import React, { useRef, useState } from 'react';
import { Button, Typography, Box, Paper, TextField, CircularProgress } from '@mui/material';
import { fetchWithAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FileError {
  message: string;
}

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const PhotoToQuizPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError({ message: 'Endast PNG eller JPG/JPEG är tillåtna.' });
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError({ message: 'Filen får max vara 5 MB.' });
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleExtractText = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setApiError(null);
    setOcrText('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetchWithAuth('/api/phototoquiz', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        setApiError(errorText);
      } else {
        const text = await response.text();
        setOcrText(text);
      }
    } catch (err: any) {
      setApiError('Tekniskt fel vid kontakt med servern.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (ocrText) {
      navigate('/texttoquiz', { state: { text: ocrText } });
    }
  };


  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-white py-4 px-2 sm:px-0">
      <Paper elevation={3} className="p-4 sm:p-8 w-full max-w-md sm:max-w-lg mx-auto">
        <Typography variant="h4" className="mb-6 text-center">
          {t('photoToQuiz.title')}
        </Typography>
        <Typography className="mb-4 text-center">
          {t('photoToQuiz.instructions')}
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUploadClick}
          className="w-full mb-4"
          size="large"
        >
          {t('photoToQuiz.chooseImage')}
        </Button>
        {selectedFile && (
          <Box className="mb-2 text-center">
            <Typography variant="body2">Vald fil: {selectedFile.name}</Typography>
          </Box>
        )}
        {fileError && (
          <Typography color="error" className="mb-2 text-center">
            {t('photoToQuiz.fileError', { message: fileError.message })}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          className="w-full mt-4"
          onClick={handleExtractText}
          disabled={!selectedFile || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          size="large"
        >
          {t('photoToQuiz.extractText')}
        </Button>
        {apiError && (
          <Typography color="error" className="mt-2 text-center">
            {t('photoToQuiz.apiError', { message: apiError })}
          </Typography>
        )}
        {ocrText && (
          <Box className="mt-6">
            <Typography variant="h6" className="mb-2">{t('photoToQuiz.extractedText')}</Typography>
            <TextField
              multiline
              minRows={6}
              value={ocrText}
              onChange={e => setOcrText(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              className="w-full mt-4"
              onClick={handleContinue}
              size="large"
            >
              {t('photoToQuiz.useTextForQuiz')}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PhotoToQuizPage;
