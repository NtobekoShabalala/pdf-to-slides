import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper,
  createTheme,
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar
} from '@mui/material';
import './App.css';

// Import components
import FileUpload from './components/FileUpload/FileUpload';
import PdfPreview from './components/PdfPreview/PdfPreview';
import ContentExtraction from './components/ContentExtraction/ContentExtraction';
import FormatSelection from './components/FormatSelection/FormatSelection';
import PresentationBuilder from './components/PresentationBuilder/PresentationBuilder';
import Download from './components/Download/Download';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  // State for the conversion flow
  const [activeStep, setActiveStep] = useState(0);
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedContent, setExtractedContent] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('pptx');
  const [presentation, setPresentation] = useState(null);

  // Define steps
  const steps = [
    'Upload PDF',
    'Preview PDF',
    'Extract Content',
    'Select Format',
    'Build Presentation',
    'Download'
  ];

  // Handlers for component interaction
  const handleFileUpload = (file) => {
    setPdfFile(file);
    setActiveStep(1); // Move to Preview step
  };

  const handleContentExtract = (content) => {
    setExtractedContent(content);
    setActiveStep(3); // Move to Format Selection step
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
    setActiveStep(4); // Move to Build Presentation step
  };

  const handleBuildComplete = (presentationData) => {
    setPresentation(presentationData);
    setActiveStep(5); // Move to Download step
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PDF to Slides Converter
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Convert PDF to Presentation
          </Typography>

          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Step 0: File Upload */}
          {activeStep === 0 && (
            <FileUpload onFileUpload={handleFileUpload} />
          )}

          {/* Step 1: PDF Preview */}
          {activeStep >= 1 && activeStep < 5 && (
            <PdfPreview pdfFile={pdfFile} />
          )}

          {/* Step 2: Content Extraction */}
          {activeStep >= 1 && activeStep < 3 && (
            <ContentExtraction 
              pdfFile={pdfFile} 
              onExtract={handleContentExtract} 
            />
          )}

          {/* Step 3: Format Selection */}
          {activeStep >= 3 && activeStep < 4 && (
            <FormatSelection onFormatSelect={handleFormatSelect} />
          )}

          {/* Step 4: Presentation Builder */}
          {activeStep >= 4 && activeStep < 5 && (
            <PresentationBuilder 
              extractedContent={extractedContent} 
              format={selectedFormat} 
              onBuildComplete={handleBuildComplete} 
            />
          )}

          {/* Step 5: Download */}
          {activeStep === 5 && (
            <Download presentation={presentation} />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
