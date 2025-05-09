import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormControl, 
  FormLabel,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Zoom,
  alpha
} from '@mui/material';

// Icons
import SlideshowIcon from '@mui/icons-material/Slideshow';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import PaletteIcon from '@mui/icons-material/Palette';

const FormatSelection = ({ onFormatSelect }) => {
  const [selectedFormat, setSelectedFormat] = useState('pptx');
  
  const handleFormatChange = (format) => {
    setSelectedFormat(format);
    if (onFormatSelect) {
      onFormatSelect(format);
    }
  };
  
  // Format details
  const formatDetails = {
    pptx: {
      title: 'PowerPoint Presentation',
      extension: '.pptx',
      icon: <SlideshowIcon sx={{ fontSize: 60 }} />,
      color: '#D04423', // PowerPoint red
      bgColor: '#FFF1EE',
      description: 'Create an editable Microsoft PowerPoint presentation that you can modify and present.',
      features: [
        { icon: <EditIcon />, text: 'Fully editable slides and content' },
        { icon: <PaletteIcon />, text: 'Compatible with PowerPoint themes' },
        { icon: <ShareIcon />, text: 'Easy to share and collaborate on' },
        { icon: <AspectRatioIcon />, text: '16:9 widescreen format' }
      ]
    },
    pdf: {
      title: 'PDF Document',
      extension: '.pdf',
      icon: <PictureAsPdfIcon sx={{ fontSize: 60 }} />,
      color: '#B30B00', // PDF red
      bgColor: '#FFF5F5',
      description: 'Generate a PDF document that can be viewed consistently on any device or platform.',
      features: [
        { icon: <CheckIcon />, text: 'Universal compatibility across devices' },
        { icon: <AspectRatioIcon />, text: 'Preserves exact layout and formatting' },
        { icon: <DownloadIcon />, text: 'Optimized for downloading and printing' },
        { icon: <ShareIcon />, text: 'Ideal for formal distribution' }
      ]
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, my: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Output Format
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Choose your preferred presentation output format. Each format has unique benefits and features.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {Object.entries(formatDetails).map(([format, details]) => (
          <Grid item xs={12} sm={6} key={format}>
            <Zoom in={true} style={{ transitionDelay: format === 'pptx' ? '0ms' : '150ms' }}>
              <Card 
                elevation={selectedFormat === format ? 4 : 1}
                sx={{ 
                  position: 'relative',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  border: selectedFormat === format ? `2px solid ${details.color}` : '2px solid transparent',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleFormatChange(format)}
                  sx={{ height: '100%', p: 2 }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      opacity: selectedFormat === format ? 1 : 0,
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    <CheckCircleIcon color="success" fontSize="large" />
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    mb: 2,
                    py: 2,
                    bgcolor: details.bgColor,
                    borderRadius: 2
                  }}>
                    <Box sx={{ color: details.color }}>
                      {details.icon}
                    </Box>
                    <Typography variant="h6" component="div" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {details.title}
                    </Typography>
                    <Chip 
                      label={details.extension} 
                      size="small" 
                      sx={{ 
                        mt: 1, 
                        bgcolor: details.color, 
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {details.description}
                  </Typography>
                  
                  <List dense>
                    {details.features.map((feature, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 36, color: details.color }}>
                          {feature.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature.text} 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            color: 'text.primary'
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardActionArea>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <FormControl component="fieldset">
          <RadioGroup
            name="format-radio-group"
            value={selectedFormat}
            onChange={(e) => handleFormatChange(e.target.value)}
            row
          >
            <FormControlLabel 
              value="pptx" 
              control={<Radio />} 
              label="PowerPoint (.pptx)" 
            />
            <FormControlLabel 
              value="pdf" 
              control={<Radio />} 
              label="PDF Document (.pdf)" 
            />
          </RadioGroup>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default FormatSelection;

