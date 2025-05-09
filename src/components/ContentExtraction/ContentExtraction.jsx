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

import axios from 'axios';

const ContentExtraction = ({ pdfFile, onExtract }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [extractedSlides, setExtractedSlides] = useState(null);

  // Helper to convert PDF file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Main extraction function
  const handleExtract = async () => {
    if (!pdfFile) return;
    setIsExtracting(true);
    setError(null);
    setExtractedSlides(null);
    try {
      const pdfBase64 = await fileToBase64(pdfFile);
      const response = await axios.post('/api/pdf_to_slides', {
        body: pdfBase64
      });
      const slides = response.data.slides;
      setExtractedSlides(slides);
      if (onExtract) onExtract(slides);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Auto-extract when pdfFile changes
  useEffect(() => {
    if (pdfFile) {
      handleExtract();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfFile]);

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Content Extraction
      </Typography>
      {isExtracting && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
          <CircularProgress size={24} />
          <Typography>Extracting content from PDF...</Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}
      {extractedSlides && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Extracted Slides
          </Typography>
          {extractedSlides.map((slide, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{slide.title}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{slide.text}</Typography>
                {slide.images && slide.images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {slide.images.map((img, i) => (
                      <img
                        key={i}
                        src={`data:image/${img.ext};base64,${img.b64}`}
                        alt={`Slide ${idx + 1} Image ${i + 1}`}
                        style={{ maxWidth: 120, maxHeight: 120, borderRadius: 4 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Paper>
  );
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
