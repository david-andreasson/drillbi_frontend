import React, { useRef, useState } from 'react';
import { Button, Typography, Box, Paper, TextField, CircularProgress } from '@mui/material';
import { fetchWithAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

interface FileError {
  message: string;
}

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const PhotoToQuizPage: React.FC = () => {
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
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-8">
      <Paper elevation={3} className="p-8 w-full max-w-md">
        <Typography variant="h4" className="mb-6 text-center">
          Foto till Quiz
        </Typography>
        <Typography className="mb-4 text-center">
          Ladda upp en bild (foto på whiteboard eller bok). Endast PNG/JPG, max 5 MB.
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
        >
          Välj bild
        </Button>
        {selectedFile && (
          <Box className="mb-2 text-center">
            <Typography variant="body2">Vald fil: {selectedFile.name}</Typography>
          </Box>
        )}
        {fileError && (
          <Typography color="error" className="mb-2 text-center">
            {fileError.message}
          </Typography>
        )}
        <Button
          variant="contained"
          color="secondary"
          className="w-full mt-4"
          onClick={handleExtractText}
          disabled={!selectedFile || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Extrahera text från bild
        </Button>
        {apiError && (
          <Typography color="error" className="mt-2 text-center">
            {apiError}
          </Typography>
        )}
        {ocrText && (
          <Box className="mt-6">
            <Typography variant="h6" className="mb-2">Extraherad text</Typography>
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
              color="success"
              className="w-full mt-4"
              onClick={handleContinue}
            >
              Använd denna text för att skapa frågor
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PhotoToQuizPage;
