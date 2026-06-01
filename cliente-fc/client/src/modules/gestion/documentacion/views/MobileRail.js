import { Box, Typography, Tooltip } from '@mui/material';
import { tokens } from './tokens';
import { allItems } from './sections';

const MobileRail = ({ sectionId, onChange, hidden = false }) => {
  if (hidden) return null;

  return (
      <Box
        component="nav"
        aria-label="Navegación rápida del módulo de documentación"
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'saturate(180%) blur(12px)',
          WebkitBackdropFilter: 'saturate(180%) blur(12px)',
          borderBottom: '1px solid',
          borderColor: tokens.color.border,
          boxShadow: '0 4px 12px -4px rgba(15, 23, 42, 0.08)',
          py: 1.25,
          px: { xs: 2, sm: 3 },
        }}
    >
      <Box
        role="tablist"
        aria-label="Secciones"
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          pb: 0.5,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {allItems.map((item) => {
          const isActive = sectionId === item.id;
          const Icon = item.icon;
          const title = item.id === 'overview' ? 'Panorama' : item.title;

          const tab = (
            <Box
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => onChange(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(item.id);
                }
              }}
              sx={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                minWidth: 96,
                py: 1,
                px: 1.25,
                borderRadius: tokens.radius.md,
                cursor: 'pointer',
                color: isActive ? tokens.color.card : tokens.color.inkSoft,
                bgcolor: isActive ? tokens.color.accent : tokens.color.card,
                border: '1px solid',
                borderColor: isActive ? tokens.color.accent : tokens.color.border,
                boxShadow: isActive ? tokens.shadow.raised : 'none',
                transition: 'all 200ms',
                '&:hover': isActive
                  ? {}
                  : {
                      borderColor: tokens.color.accentInkDeep,
                      color: tokens.color.accent,
                      bgcolor: tokens.color.accentInk,
                    },
                '&:focus-visible': {
                  outline: `2px solid ${tokens.color.accent}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: tokens.radius.sm,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: isActive ? 'rgba(255,255,255,0.18)' : tokens.color.accentInk,
                  color: 'inherit',
                  transition: 'all 200ms',
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: tokens.font.mono,
                  fontSize: '0.6rem',
                  letterSpacing: '0.14em',
                  opacity: 0.85,
                }}
              >
                {item.index}
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.font.body,
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  lineHeight: 1.15,
                  textAlign: 'center',
                  maxWidth: 88,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </Typography>
            </Box>
          );

          if (isActive) return <Box key={item.id}>{tab}</Box>;

          return (
            <Tooltip key={item.id} title={title} placement="bottom" arrow>
              {tab}
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default MobileRail;
