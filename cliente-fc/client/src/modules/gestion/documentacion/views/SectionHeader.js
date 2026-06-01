import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { tokens } from './tokens';

const SectionHeader = ({ section, onBack }) => {
  const Icon = section.icon;

  return (
    <Box
      component="header"
      aria-label={`Encabezado de ${section.title}`}
      sx={{
        position: 'relative',
        borderRadius: { xs: tokens.radius.lg, md: tokens.radius.xl },
        bgcolor: tokens.color.card,
        border: '1px solid',
        borderColor: tokens.color.border,
        overflow: 'hidden',
        boxShadow: tokens.shadow.card,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, ${tokens.color.inkFaint} 0.5px, transparent 0.5px)`,
          backgroundSize: '24px 24px',
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tokens.color.accentInkSoft} 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          p: { xs: 2.5, md: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'flex-start' },
          gap: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
          <Box
            aria-hidden="true"
            sx={{
              width: { xs: 56, md: 72 },
              height: { xs: 56, md: 72 },
              borderRadius: tokens.radius.lg,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: tokens.color.card,
              bgcolor: tokens.color.accent,
              boxShadow: tokens.shadow.raised,
            }}
          >
            <Icon sx={{ fontSize: { xs: 28, md: 34 } }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography
                sx={{
                  fontFamily: tokens.font.mono,
                  fontSize: '0.7rem',
                  color: tokens.color.accent,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {section.kicker}
              </Typography>
              <Box
                aria-hidden="true"
                sx={{
                  fontFamily: tokens.font.mono,
                  fontSize: '0.7rem',
                  color: tokens.color.inkFaint,
                  letterSpacing: '0.16em',
                }}
              >
                · {section.index} / 09
              </Box>
            </Box>
            <Typography
              component="h1"
              sx={{
                fontFamily: tokens.font.display,
                fontWeight: 500,
                fontSize: { xs: '1.65rem', sm: '2rem', md: '2.45rem' },
                background: tokens.color.gradientTitle,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                fontVariationSettings: '"SOFT" 50, "opsz" 100',
                mb: 0.5,
              }}
            >
              {section.title}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.9rem', md: '1rem' },
                color: tokens.color.inkSoft,
                lineHeight: 1.55,
                maxWidth: 720,
              }}
            >
              {section.description}
            </Typography>
          </Box>
        </Box>

        {onBack && (
          <Tooltip title="Volver al panorama" placement="left" arrow>
            <IconButton
              onClick={onBack}
              size="small"
              aria-label="Volver al panorama del módulo"
              sx={{
                alignSelf: { xs: 'flex-end', sm: 'flex-start' },
                color: tokens.color.accent,
                bgcolor: tokens.color.card,
                border: '1px solid',
                borderColor: tokens.color.border,
                borderRadius: tokens.radius.md,
                '&:hover': {
                  color: tokens.color.card,
                  borderColor: tokens.color.accent,
                  bgcolor: tokens.color.accent,
                },
              }}
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default SectionHeader;
