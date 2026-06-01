import { useEffect, useState, useRef, useMemo } from 'react';
import { Box, Skeleton, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { tokens } from './tokens';
import { sections } from './sections';
import SectionHeader from './SectionHeader';

const SectionPage = ({ sectionId, onBack }) => {
  const section = useMemo(() => sections.find((s) => s.id === sectionId), [sectionId]);
  const [ready, setReady] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setReady(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setReady(true), 80);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sectionId]);

  if (!section) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography sx={{ color: tokens.color.inkSoft }}>Sección no encontrada.</Typography>
      </Box>
    );
  }

  const ListComponent = section.component;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
      <Breadcrumbs
        aria-label="Ruta de navegación"
        sx={{
          fontSize: '0.8rem',
          color: tokens.color.inkMute,
          '& .MuiBreadcrumbs-separator': { color: tokens.color.inkFaint },
        }}
      >
        <MuiLink
          component="button"
          underline="none"
          onClick={onBack}
          sx={{
            color: tokens.color.inkSoft,
            fontFamily: tokens.font.mono,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
            '&:hover': { color: tokens.color.accent },
          }}
        >
          Documentación
        </MuiLink>
        <Typography
          sx={{
            color: tokens.color.ink,
            fontFamily: tokens.font.mono,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          {section.title}
        </Typography>
      </Breadcrumbs>

      <SectionHeader section={section} onBack={onBack} />

      {!ready ? (
        <Box
          sx={{
            borderRadius: { xs: tokens.radius.lg, md: tokens.radius.xl },
            bgcolor: tokens.color.card,
            border: '1px solid',
            borderColor: tokens.color.border,
            p: { xs: 2.5, md: 4 },
            boxShadow: tokens.shadow.card,
          }}
        >
          <Skeleton
            variant="rounded"
            height={56}
            sx={{ mb: 2, borderRadius: tokens.radius.md, bgcolor: tokens.color.paperDeep }}
          />
          <Skeleton
            variant="rounded"
            height={48}
            sx={{ mb: 1, borderRadius: tokens.radius.md, bgcolor: tokens.color.paperDeep }}
          />
          <Skeleton
            variant="rounded"
            height={48}
            sx={{ mb: 1, borderRadius: tokens.radius.md, bgcolor: tokens.color.paperDeep }}
          />
          <Skeleton
            variant="rounded"
            height={48}
            sx={{ borderRadius: tokens.radius.md, bgcolor: tokens.color.paperDeep }}
          />
        </Box>
      ) : (
        <Box
          key={sectionId}
          sx={{
            '& > *': { boxShadow: 'none !important' },
            '& .MuiTableContainer-root': {
              boxShadow: `${tokens.shadow.card} !important`,
              borderRadius: `${tokens.radius.lg} !important`,
              border: `1px solid ${tokens.color.border} !important`,
              background: `${tokens.color.card} !important`,
              overflow: 'hidden',
            },
            '& .MuiPaper-root.MuiTableContainer-root': {
              background: `${tokens.color.card} !important`,
            },
            '& .MuiTableContainer-root::before': {
              display: 'none !important',
            },
            '& .MuiTableContainer-root > .MuiBox-root': {
              background: `${tokens.color.cardSoft} !important`,
              borderBottom: `1px solid ${tokens.color.border} !important`,
              padding: '16px 24px !important',
            },
            '& .MuiTableContainer-root > .MuiBox-root h2': {
              fontFamily: `${tokens.font.display} !important`,
              fontWeight: 500,
              fontSize: '1.25rem !important',
              letterSpacing: '-0.01em',
              color: `${tokens.color.ink} !important`,
            },
            '& .MuiTableContainer-root .MuiTextField-root .MuiOutlinedInput-root': {
              borderRadius: `${tokens.radius.md} !important`,
              background: `${tokens.color.card} !important`,
              fontFamily: tokens.font.body,
              fontSize: '0.85rem',
              '& fieldset': { borderColor: `${tokens.color.border} !important` },
              '&:hover fieldset': { borderColor: `${tokens.color.inkFaint} !important` },
              '&.Mui-focused fieldset': { borderColor: `${tokens.color.accent} !important` },
            },
            '& .MuiTableHead-root .MuiTableCell-head': {
              fontFamily: tokens.font.mono,
              fontSize: '0.65rem !important',
              letterSpacing: '0.14em !important',
              textTransform: 'uppercase',
              color: `${tokens.color.inkMute} !important`,
              fontWeight: 600,
              borderBottom: `1.5px solid ${tokens.color.border} !important`,
              background: 'transparent',
            },
            '& .MuiTableBody-root .MuiTableCell-body': {
              fontFamily: tokens.font.body,
              color: tokens.color.ink,
              borderBottom: `1px solid ${tokens.color.borderSoft} !important`,
            },
            '& .MuiTableBody-root .MuiTableRow-root:hover': {
              backgroundColor: `${tokens.color.accentInk} !important`,
            },
            '& .MuiTableBody-root .MuiTableRow-row:last-child .MuiTableCell-body': {
              borderBottom: 'none !important',
            },
            '& .MuiDialog-paper': {
              borderRadius: `${tokens.radius.lg} !important`,
              border: `1px solid ${tokens.color.border} !important`,
              boxShadow: `${tokens.shadow.raised} !important`,
            },
            '& .MuiDialogTitle-root': {
              fontFamily: `${tokens.font.display} !important`,
              fontWeight: 500,
              fontSize: '1.4rem !important',
              letterSpacing: '-0.015em',
              color: `${tokens.color.ink} !important`,
              borderBottom: `1px solid ${tokens.color.border} !important`,
              padding: '20px 24px !important',
            },
            '& .MuiDialogActions-root': {
              padding: '16px 24px !important',
              borderTop: `1px solid ${tokens.color.border} !important`,
            },
          }}
        >
          <ListComponent />
        </Box>
      )}
    </Box>
  );
};

export default SectionPage;
