import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';

const TerapiasTabs = ({ tabValue, handleTabChange, isMobile }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }} justifyContent="center" width="100%">
      <Tabs
        centered={!isMobile}
        value={tabValue}
        onChange={handleTabChange}
        aria-label="terapia tabs"
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab
          label="Terapias Anteriores"
          value="1"
          sx={{
            color: "#00000099",
            backgroundColor: "#FFFFFF",
            "&.Mui-selected": {
              backgroundColor: "#F3F4F6",
              color: "#000000",
            },
            textTransform: "none",
          }}
        />
        <Tab
          label="Asistencia"
          value="2"
          sx={{
            color: "#00000099",
            backgroundColor: "#FFFFFF",
            "&.Mui-selected": {
              backgroundColor: "#F3F4F6",
              color: "#000000",
            },
            textTransform: "none",
          }}
        />
      </Tabs>
    </Box>
  );
};

export default TerapiasTabs;