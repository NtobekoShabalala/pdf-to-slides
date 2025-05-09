import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import ExtractIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import pdf.js
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Set the worker source (if not already set in PdfPreview)
if (!GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const ContentExtraction = ({ pdfFile, onExtract }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [error, setError] = useState(null);
  const [extractedContent, setExtractedContent] = useState(null);
  const [currentPageProcessing, setCurrentPageProcessing] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Function to extract text from a PDF page
  const extractTextFromPage = async (page) => {
    try {
      const textContent = await page.getTextContent();
      // Combine the text items into a single string
      return textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim();
    } catch (err) {
      console.error('Error extracting text from page:', err);
      return ''; // Return empty string on error
    }
  };
  
  // Function to extract images from a PDF page (simplified implementation)
  const extractImagesFromPage = async (page) => {
    // In a real implementation, this would use the operatorList and/or canvas to extract images
    // For now, we'll return an empty array as image extraction is complex
    // In a production app, you might use libraries specifically designed for this
    
    // This is a simplified placeholder that would be replaced with actual image extraction
    const images = [];
    
    try {
      // In a real implementation, we'd look for image operators in the page content
      // and extract the image data
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      
      // Create a canvas to render the page
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      
      // Render the page to a canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // In a real implementation, we'd analyze the canvas to find image regions
      // For this demo, we'll pretend we found an image if the page has a reasonable size
      if (viewport.width * viewport.height > 100000) {
        // This is just a placeholder. In a real app, we'd extract actual images.
        images.push({
          id: `img-p${page.pageNumber}-1`,
          width: 300,
          height: 200,
          // We'd store actual image data here, but for now we'll use a placeholder
          dataUrl: 'placeholder', // In a real app, this would be the image data URL
          alt: `Image from page ${page.pageNumber}`
        });
      }
    } catch (err) {
      console.error('Error extracting images from page:', err);
    }
    
    return images;
  };
  
  // Main extraction function
  const handleExtract = async () => {
    if (!pdfFile) return;
    
    setIsExtracting(true);
    setExtractionProgress(0);
    setError(null);
    setExtractedContent(null);
    
    try {
      // Load the PDF file
      const fileReader = new FileReader();
      
      fileReader.onload = async function() {
        try {
          const typedArray = new Uint8Array(this.result);
          const loadingTask = pdfjsLib.getDocument(typedArray);
          
          const pdf = await loadingTask.promise;
          setTotalPages(pdf.numPages);
          
          // Prepare to extract content from each page
          const extractedPages = [];
          
          // Process each page
          for (let i = 1; i <= pdf.numPages; i++) {
            setCurrentPageProcessing(i);
            
            // Update progress
            const progress = Math.round((i - 1) / pdf.numPages * 100);
            setExtractionProgress(progress);
            
            // Get the page
            const page = await pdf.getPage(i);
            
            // Extract text
            const text = await extractTextFromPage(page);
            
            // Extract images (placeholder implementation)
            const images = await extractImagesFromPage(page);
            
            // Store the extracted content
            extractedPages.push({
              pageNumber: i,
              text,
              images,
              title: generatePageTitle(text, i),
              sentences: splitIntoSentences(text),
              paragraphs: splitIntoParagraphs(text)
            });
            
            // Small delay to make the progress visible
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Complete the extraction
          setExtractionProgress(100);
          
          // Process the extracted content to organize it for slides
          const processedContent = processContentForSlides(extractedPages);
          
          // Set the extracted content
          setExtractedContent(processedContent);
          
          // Pass the content to the parent component
          if (onExtract) {
            onExtract(processedContent);
          }
          
          // Finish extraction process
          setTimeout(() => {
            setIsExtracting(false);
          }, 500);
          
        } catch (err) {
          console.error('Error processing PDF:', err);
          setError('Failed to process the PDF document. Please try again.');
          setIsExtracting(false);
        }
      };
      
      fileReader.onerror = function() {
        setError('Failed to read the file. Please try again.');
        setIsExtracting(false);
      };
      
      fileReader.readAsArrayBuffer(pdfFile);
      
    } catch (err) {
      console.error('Error in extraction process:', err);
      setError('An unexpected error occurred during extraction.');
      setIsExtracting(false);
    }
  };
  
  // Helper functions for processing text
  const generatePageTitle = (text, pageNumber) => {
    if (!text) return `Page ${pageNumber}`;
    
    // Try to find a title in the text (first sentence, or first few words)
    const firstSentence = text.split(/[.!?]/)[0].trim();
    
    if (firstSentence.length > 5 && firstSentence.length < 100) {
      return firstSentence;
    }
    
    // If no good sentence found, use the first few words
    const firstWords = text.split(' ').slice(0, 5).join(' ');
    return firstWords.length > 0 ? `${firstWords}...` : `Page ${pageNumber}`;
  };
  
  const splitIntoSentences = (text) => {
    if (!text) return [];
    
    // Simple sentence splitting - would need refinement in a real app
    return text
      .split(/[.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + '.');
  };
  
  const splitIntoParagraphs = (text) => {
    if (!text) return [];
    
    // Simple paragraph splitting - would need refinement in a real app
    return text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  };
  
  // Process the extracted content to organize it for slides
  const processContentForSlides = (pages) => {
    // In a real implementation, this would use NLP and other techniques
    // to better organize content into logical slides
    
    const slides = pages.map(page => {
      // Create a slide from each page
      return {
        title: page.title,
        content: page.paragraphs.length > 0 ? page.paragraphs : [page.text],
        images: page.images,
        pageNumber: page.pageNumber
      };
    });
    
    return {
      title: pdfFile.name.replace('.pdf', ''),
      slides,
      totalPages: pages.length,
      totalImages: pages.reduce((count, page) => count + page.images.length, 0),
      totalTextLength: pages.reduce((count, page) => count + (page.text?.length || 0), 0)
    };
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, my: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Content Extraction
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ my: 2 }}>
        <Typography variant="body1" paragraph>
          Extract text and images from your PDF to create presentation slides. 
          The extracted content will be organized into slides with titles, text, and images.
        </Typography>
        
        {isExtracting ? (
          <Box sx={{ mt: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                Processing page {currentPageProcessing} of {totalPages}
              </Typography>
              <Typography variant="body2" color="primary">
                {extractionProgress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={extractionProgress} 
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Extracting text and images. This may take a moment for large documents.
            </Typography>
          </Box>
        ) : extractedContent ? (
          // Show extraction results
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Content extracted successfully!
                </Typography>
              </Box>
            </Alert>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Extraction Summary
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <DescriptionIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h6">{extractedContent.totalPages}</Typography>
                      <Typography variant="body2" color="text.secondary">Pages Processed</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <TextFieldsIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h6">
                        {Math.round(extractedContent.totalTextLength / 100)} KB
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Text Extracted</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ImageIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h6">{extractedContent.totalImages}</Typography>
                      <Typography variant="body2" color="text.secondary">Images Detected</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Typography variant="h6" gutterBottom>
              Extracted Content Preview
            </Typography>
            
            {extractedContent && extractedContent.slides && extractedContent.slides.length > 0 ? (
                <Box>
                  {extractedContent.slides.slice(0, 3).map((slide, idx) => (
                    <Card key={slide.pageNumber} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {slide.title}
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {slide.content.join(' ')}
                        </Typography>
                        {slide.images && slide.images.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                            {slide.images.map(img => (
                              <Box key={img.id} sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                                {/* Replace placeholder with actual image data if available */}
                                {img.dataUrl !== 'placeholder' ? (
                                  <img src={img.dataUrl} alt={img.alt} width={img.width} height={img.height} />
                                ) : (
                                  <ImageIcon color="disabled" sx={{ fontSize: 48 }} />
                                )}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {extractedContent.slides.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      ...and {extractedContent.slides.length - 3} more slides extracted.
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No content extracted from the PDF.
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ExtractIcon />}
                onClick={handleExtract}
                disabled={isExtracting || !pdfFile}
              >
                Extract Content
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    );
}

export default ContentExtraction;
