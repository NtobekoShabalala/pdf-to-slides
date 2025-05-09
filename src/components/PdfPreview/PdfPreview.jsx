import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Button, 
  IconButton, 
  Slider,
  Alert,
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';

// Import pdf.js
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Set the worker source
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfPreview = ({ pdfFile }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  
  const canvasRef = useRef(null);
  
  // Load the PDF document
  useEffect(() => {
    if (!pdfFile) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const loadPdf = async () => {
      try {
        const fileReader = new FileReader();
        
        fileReader.onload = async function() {
          try {
            const typedArray = new Uint8Array(this.result);
            const loadingTask = pdfjsLib.getDocument(typedArray);
            
            const pdf = await loadingTask.promise;
            setPdfDocument(pdf);
            setNumPages(pdf.numPages);
            setCurrentPage(1);
            setIsLoading(false);
          } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Failed to load PDF document. The file might be corrupted.');
            setIsLoading(false);
          }
        };
        
        fileReader.onerror = function() {
          setError('Failed to read the file. Please try again.');
          setIsLoading(false);
        };
        
        fileReader.readAsArrayBuffer(pdfFile);
      } catch (err) {
        console.error('Error in PDF loading process:', err);
        setError('An unexpected error occurred while loading the PDF.');
        setIsLoading(false);
      }
    };
    
    loadPdf();
    
    // Cleanup
    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [pdfFile]);
  
  // Render the current page
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    
    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render this page. Please try another page or reload the document.');
      }
    };
    
    renderPage();
  }, [pdfDocument, currentPage, scale]);
  
  // Page navigation handlers
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Zoom handlers
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };
  
  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, my: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" component="h2">
          PDF Preview
        </Typography>
        
        {pdfDocument && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FileDownloadDoneIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="body2" color="success.main">
              {pdfFile.name} ({numPages} pages)
            </Typography>
          </Box>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexDirection: 'column',
          my: 6,
          height: 300
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading PDF document...
          </Typography>
        </Box>
      ) : !pdfDocument ? (
        <Box sx={{ 
          height: 300, 
          border: '1px solid #eee', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 1
        }}>
          <Typography color="textSecondary">
            {error ? 'Failed to load PDF' : 'No PDF document loaded'}
          </Typography>
        </Box>
      ) : (
        <>
          {/* PDF Controls */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {/* Page Navigation */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton 
                onClick={goToPreviousPage} 
                disabled={currentPage <= 1}
                size="small"
              >
                <NavigateBeforeIcon />
              </IconButton>
              
              <Typography variant="body2">
                Page {currentPage} of {numPages}
              </Typography>
              
              <IconButton 
                onClick={goToNextPage} 
                disabled={currentPage >= numPages}
                size="small"
              >
                <NavigateNextIcon />
              </IconButton>
            </Stack>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            
            {/* Zoom Controls */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Tooltip title="Zoom Out">
                <IconButton onClick={zoomOut} size="small" disabled={scale <= 0.5}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              
              <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>
                {Math.round(scale * 100)}%
              </Typography>
              
              <Tooltip title="Zoom In">
                <IconButton onClick={zoomIn} size="small" disabled={scale >= 3}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Reset Zoom">
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={resetZoom}
                  sx={{ ml: 1, minWidth: 40 }}
                >
                  Reset
                </Button>
              </Tooltip>
            </Stack>
          </Box>
          
          {/* PDF Canvas */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: '#f0f0f0',
              p: 2,
              maxHeight: 600,
              boxShadow: 'inset 0px 0px 5px rgba(0,0,0,0.1)'
            }}
          >
            <canvas ref={canvasRef} />
          </Box>
        </>
      )}
    </Paper>
  );
};

export default PdfPreview;

