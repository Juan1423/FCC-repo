import { useState } from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import { tokens, SIDEBAR_W, SIDEBAR_W_MINI } from './tokens';
import { allItems } from './sections';

const Sidebar = ({ sectionId, onChange, collapsed, onToggleCollapse }) => {
  const [hovered, setHovered] = useState(null);

  const width = collapsed ? SIDEBAR_W_MINI : SIDEBAR_W;
  const showLabels = !collapsed;

  return (
    <Box
      component="aside"
      aria-label="Navegación del módulo de documentación"
      sx={{
        width,
        flexShrink: 0,
        position: 'sticky',
        top: { md: 72 },
        alignSelf: 'flex-start',
        height: { md: 'calc(100vh - 80px)' },
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: tokens.color.border,
        bgcolor: tokens.color.paperDeep,
        transition: 'width 240ms cubic-bezier(.4,.0,.2,1)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: showLabels ? 2.25 : 1.5,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: tokens.color.border,
          minHeight: 64,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: 36,
            height: 36,
            borderRadius: tokens.radius.md,
            display: 'grid',
            placeItems: 'center',
            color: tokens.color.accent,
            bgcolor: tokens.color.accentInk,
            border: '1px solid',
            borderColor: tokens.color.border,
            flexShrink: 0,
          }}
        >
          <MenuBookRoundedIcon sx={{ fontSize: 20 }} />
        </Box>
        {showLabels && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: tokens.font.display,
                fontWeight: 600,
                fontSize: '1.05rem',
                color: tokens.color.ink,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                fontVariationSettings: '"SOFT" 50, "WONK" 0',
              }}
            >
              Documentation
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.font.mono,
                fontSize: '0.65rem',
                color: tokens.color.inkMute,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                mt: 0.25,
              }}
            >
              CODEX · 2026
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        role="listbox"
        aria-label="Secciones de documentación"
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1.5,
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: tokens.color.border,
            borderRadius: tokens.radius.pill,
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: tokens.font.mono,
            fontSize: '0.65rem',
            color: tokens.color.inkMute,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            px: showLabels ? 2.25 : 1.5,
            mb: 0.5,
            opacity: showLabels ? 1 : 0,
            transition: 'opacity 200ms',
          }}
        >
          Índice
        </Typography>

        {allItems.map((item) => {
          const isActive = sectionId === item.id;
          const isHovered = hovered === item.id;
          const Icon = item.icon;
          const label = item.id === 'overview' ? 'Panorama' : item.title;

          const button = (
            <Box
              role="option"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => onChange(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(item.id);
                }
              }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mx: 1,
                my: 0.25,
                px: showLabels ? 1.25 : 1,
                py: 1.05,
                borderRadius: tokens.radius.md,
                cursor: 'pointer',
                color: isActive ? tokens.color.ink : tokens.color.inkSoft,
                bgcolor: isActive ? tokens.color.card : isHovered ? 'rgba(255,255,255,0.45)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? tokens.color.border : 'transparent',
                boxShadow: isActive ? tokens.shadow.card : 'none',
                transition: 'background 180ms, color 180ms, border-color 180ms, transform 180ms',
                '&:focus-visible': {
                  outline: `2px solid ${tokens.color.accent}`,
                  outlineOffset: 2,
                },
                '&:active': { transform: 'scale(0.985)' },
              }}
            >
              {isActive && (
                <Box
                  aria-hidden="true"
                  sx={{
                    position: 'absolute',
                    left: -10,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: tokens.radius.pill,
                    bgcolor: tokens.color.accent,
                  }}
                />
              )}
              <Box
                aria-hidden="true"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.radius.sm,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  color: isActive ? tokens.color.accent : tokens.color.inkSoft,
                  bgcolor: isActive ? tokens.color.accentInk : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'transparent' : tokens.color.border,
                  transition: 'all 200ms',
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
              {showLabels && (
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: tokens.font.mono,
                        fontSize: '0.62rem',
                        color: tokens.color.inkMute,
                        letterSpacing: '0.14em',
                      }}
                    >
                      {item.index}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          );

          if (showLabels) return <Box key={item.id}>{button}</Box>;

          return (
            <Tooltip key={item.id} title={label} placement="right" arrow>
              {button}
            </Tooltip>
          );
        })}
      </Box>

      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: tokens.color.border,
          p: 1,
          display: 'flex',
          justifyContent: showLabels ? 'flex-end' : 'center',
        }}
      >
        <Tooltip title={collapsed ? 'Expandir índice' : 'Contraer índice'} placement="right" arrow>
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            aria-label={collapsed ? 'Expandir índice de navegación' : 'Contraer índice de navegación'}
            sx={{
              color: tokens.color.inkSoft,
              borderRadius: tokens.radius.md,
              '&:hover': {
                bgcolor: tokens.color.card,
                color: tokens.color.accent,
              },
            }}
          >
            {collapsed ? (
              <ChevronRightRoundedIcon fontSize="small" />
            ) : (
              <ChevronLeftRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Sidebar;
