import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Card = ({ title, icon, description, onClick, color = '#1976d2' }) => {
  return (
    <Paper
      onClick={onClick}
      elevation={3}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        height: '100%',
        minHeight: 140,
        cursor: 'pointer',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        borderLeft: `6px solid ${color}`,
        '&:hover': {
          elevation: 8,
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px -5px ${color}40`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 60,
          height: 60,
          borderRadius: 2,
          backgroundColor: color,
          mr: 3,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Card;
