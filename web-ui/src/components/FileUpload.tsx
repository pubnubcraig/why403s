import React, { useCallback } from 'react';
import { Box, Paper, Typography, Button, styled } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import Papa from 'papaparse';
import { LogRow } from '../types';

const UploadArea = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.dark,
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

interface FileUploadProps {
  onFileUpload: (data: LogRow[]) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as LogRow[];
          onFileUpload(data);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
        },
      });
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as LogRow[];
          onFileUpload(data);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
        },
      });
    },
    [onFileUpload]
  );

  return (
    <Box>
      <label htmlFor="file-upload">
        <UploadArea
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          elevation={0}
        >
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Upload CSV Log File
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Drag and drop your CSV file here or click to browse
          </Typography>
          <Button
            variant="contained"
            component="span"
            disabled={isLoading}
            startIcon={<CloudUpload />}
          >
            {isLoading ? 'Processing...' : 'Choose File'}
          </Button>
        </UploadArea>
      </label>
      <HiddenInput
        id="file-upload"
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
      />
    </Box>
  );
};