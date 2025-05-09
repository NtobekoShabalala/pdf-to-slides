import { Box, Typography, Paper, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';

const Download = ({ presentation }) => {
  const handleDownload = () => {
    // In a real implementation, this would create and download the file
    alert(`Downloading ${presentation.format.toUpperCase()} presentation with ${presentation.slides} slides`);
  };
  
  if (!presentation) {
    return null;
  }
  
  return (
    <Paper elevation={3} sx={{ p: 3, my: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Download Presentation
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column',
        my: 3
      }}>
        {presentation.format === 'pptx' ? (
          <SlideshowIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        ) : (
          <PictureAsPdfIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        )}
        
        <Typography variant="h6" gutterBottom>
          Your {presentation.format.toUpperCase()} presentation is ready!
        </Typography>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          {presentation.slides} slides generated
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{ mt: 2 }}
        >
          Download {presentation.format.toUpperCase()}
        </Button>
      </Box>
    </Paper>
  );
};

export default Download;
