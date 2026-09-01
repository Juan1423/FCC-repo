import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const IndividualView = ({ title, subtitle, icon, children }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {icon}
        <Box>
          <Typography variant="h6">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Paper sx={{ p: { xs: 1.5, md: 3 }, minHeight: 400 }}>{children}</Paper>
    </Box>
  );
};

export default IndividualView;