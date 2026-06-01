import { useEffect, useState, useCallback, useRef } from 'react';
import { Box } from '@mui/material';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import { useMenu } from '../../../../components/base/MenuContext';
import { tokens } from './tokens';
import { sections, OVERVIEW_ID } from './sections';
import Sidebar from './Sidebar';
import MobileRail from './MobileRail';
import Overview from './Overview';
import SectionPage from './SectionPage';

const STORAGE_KEY = 'doc-section';
const COLLAPSE_KEY = 'doc-sidebar-collapsed';

const DocumentacionDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sectionId, setSectionId] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && (stored === OVERVIEW_ID || sections.some((s) => s.id === stored))) return stored;
    } catch {}
    return OVERVIEW_ID;
  });
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(COLLAPSE_KEY) || 'false');
    } catch {
      return false;
    }
  });
  const { setCurrentMenu } = useMenu();
  const mainRef = useRef(null);

  useEffect(() => {
    setCurrentMenu('Documentación');
  }, [setCurrentMenu]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, sectionId);
    } catch {}
  }, [sectionId]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sectionId]);

  const handleSelect = useCallback((id) => {
    setSectionId(id);
  }, []);

  const handleBack = useCallback(() => {
    setSectionId(OVERVIEW_ID);
  }, []);

  const isOverview = sectionId === OVERVIEW_ID;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden', bgcolor: tokens.color.paper }}>
      <NavbarAdmin onDrawerToggle={() => setDrawerOpen((v) => !v)} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'stretch',
          minWidth: 0,
          pt: { xs: 7, sm: 8 },
          bgcolor: tokens.color.paper,
        }}
      >
        <Sidebar
          sectionId={sectionId}
          onChange={handleSelect}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />

        <Box
          component="main"
          ref={mainRef}
          role="main"
          aria-label={isOverview ? 'Panorama de documentación' : `Sección: ${sectionId}`}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            px: { xs: 2, sm: 3, md: collapsed ? 4 : 5 },
            py: { xs: 2, md: 4 },
            bgcolor: tokens.color.paper,
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          <MobileRail sectionId={sectionId} onChange={handleSelect} hidden={isOverview} />

          <Box sx={{ mt: { xs: 2, md: 0 } }}>
            {isOverview ? (
              <Overview onSelect={handleSelect} />
            ) : (
              <SectionPage sectionId={sectionId} onBack={handleBack} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentacionDashboard;
