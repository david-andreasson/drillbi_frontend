import React, { useRef, useState } from 'react';
import { Button, Typography, Box, Paper, TextField, CircularProgress, Dialog, useMediaQuery } from '@mui/material';
import { fetchWithAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FileError {
  message: string;
}

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const PhotoToQuizPage: React.FC = () => {
  // Simple mobile detection based on userAgent
  const isMobile = /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(navigator.userAgent);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cameraPreview, setCameraPreview] = useState<string | null>(null);
  const [showCameraConfirm, setShowCameraConfirm] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError({ message: t('photoToQuiz.fileError', { message: t('photoToQuiz.onlyPngJpg') }) });
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError({ message: t('photoToQuiz.fileError', { message: t('photoToQuiz.max5mb') }) });
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  };

  // Handle camera image
  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError({ message: t('photoToQuiz.fileError', { message: t('photoToQuiz.onlyPngJpg') }) });
      setCameraPreview(null);
      setShowCameraConfirm(false);
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError({ message: t('photoToQuiz.fileError', { message: t('photoToQuiz.max5mb') }) });
      setCameraPreview(null);
      setShowCameraConfirm(false);
      return;
    }
    setFileError(null);
    setCameraPreview(URL.createObjectURL(file));
    setSelectedFile(file);
    setShowCameraConfirm(true);
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleCameraConfirm = async () => {
    setShowCameraConfirm(false);
    if (!selectedFile) return;
    setLoading(true);
    setApiError(null);
    setOcrText('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetchWithAuth('/v2/phototoquiz', {
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
      setApiError(t('photoToQuiz.technicalError'));
    } finally {
      setLoading(false);
    }
  };


  const handleCameraRetake = () => {
    setShowCameraConfirm(false);
    setCameraPreview(null);
    setSelectedFile(null);
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
      const response = await fetchWithAuth('/v2/phototoquiz', {
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
      setApiError(t('photoToQuiz.technicalError'));
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
          ref={cameraInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          capture="environment"
          className="hidden"
          onChange={handleCameraChange}
        />
        {isMobile && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleCameraClick}
            className="w-full mb-2"
            size="large"
          >
            {t('photoToQuiz.takePhoto')}
          </Button>
        )}

        
        <Dialog open={showCameraConfirm} onClose={handleCameraRetake} fullWidth maxWidth="xs">
          <Box className="flex flex-col items-center p-4">
            {cameraPreview && (
              <img src={cameraPreview} alt="Camera preview" className="max-w-full max-h-64 mb-4 rounded" />
            )}
            <Typography className="mb-4" align="center">
              {t('photoToQuiz.cameraConfirm')}
            </Typography>
            <Box className="flex gap-2 w-full">
              <Button onClick={handleCameraConfirm} color="primary" variant="contained" fullWidth>
                {t('photoToQuiz.useTextForQuiz')}
              </Button>
              <Button onClick={handleCameraRetake} color="secondary" variant="outlined" fullWidth>
                {t('photoToQuiz.retake')}
              </Button>
            </Box>
          </Box>
        </Dialog>

        
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
            <Typography variant="body2">{t('photoToQuiz.selectedFile', { name: selectedFile.name })}</Typography>
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
