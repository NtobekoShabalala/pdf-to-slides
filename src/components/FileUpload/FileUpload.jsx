import { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  // Handle file selection
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  // Validate and process the file
  const validateAndProcessFile = (file) => {
    // Reset error
    setError(null);
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file. Other file types are not supported.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    // Set file and show loading
    setSelectedFile(file);
    setIsLoading(true);

    // Simulate processing time (in a real app, this would be actual PDF processing)
    setTimeout(() => {
      setIsLoading(false);
      // Pass the file to the parent component
      if (onFileUpload) {
        onFileUpload(file);
      }
    }, 1500);
  };

  // Handle button click for manual upload
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Reset the form
  const handleReset = () => {
    setSelectedFile(null);
    setIsLoading(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        maxWidth: 600,
        mx: 'auto',
        my: 4,
        border: isDragging ? '2px dashed #1976d2' : '2px dashed #ccc',
        backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.04)' : 'white',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Error message */}
      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {!selectedFile ? (
        // Upload UI
        <>
          <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            Drag & Drop Your PDF Here
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            or
          </Typography>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleButtonClick}
            startIcon={<PictureAsPdfIcon />}
          >
            Select PDF File
          </Button>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Maximum file size: 10MB
          </Typography>
        </>
      ) : isLoading ? (
        // Loading UI
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="h6">Processing your PDF...</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              This may take a moment depending on the file size
            </Typography>
          </Box>
        </>
      ) : (
        // Success UI
        <>
          <PictureAsPdfIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {selectedFile.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            File uploaded successfully!
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleReset}
            sx={{ mt: 1 }}
          >
            Upload a Different File
          </Button>
        </>
      )}
    </Paper>
  );
};

export default FileUpload;
