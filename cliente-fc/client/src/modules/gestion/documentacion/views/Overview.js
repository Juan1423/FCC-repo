import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Chip } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { tokens } from './tokens';
import { sections, overviewMeta } from './sections';
import * as documentacionService from '../../../../services/documentacionService';

const countFetchers = {
  documentos: documentacionService.getDocumentos,
  'tipos-documento': documentacionService.getTipoDocumentos,
  indicadores: documentacionService.getIndicadores,
  'tipos-indicador': documentacionService.getTipoIndicadores,
  instituciones: documentacionService.getInstituciones,
  'tipos-institucion': documentacionService.getTipoInstituciones,
  modulos: documentacionService.getModulos,
  procesos: documentacionService.getProcesos,
  'tipos-proceso': documentacionService.getTipoProcesos,
};

const OverviewCard = ({ section, count, loading, onSelect }) => {
  const Icon = section.icon;
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onSelect(section.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(section.id);
        }
      }}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2.5, md: 3 },
        borderRadius: tokens.radius.lg,
        bgcolor: tokens.color.card,
        border: '1px solid',
        borderColor: tokens.color.border,
        boxShadow: tokens.shadow.card,
        cursor: 'pointer',
        overflow: 'hidden',
        minHeight: { xs: 168, md: 200 },
        transition: 'transform 220ms, box-shadow 220ms, border-color 220ms',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: tokens.shadow.hover,
          borderColor: tokens.color.accentInkDeep,
          '& .overview-arrow': { transform: 'translateX(4px)', color: tokens.color.accent },
          '& .overview-icon': {
            bgcolor: tokens.color.accent,
            color: tokens.color.card,
            transform: 'rotate(-4deg) scale(1.04)',
          },
        },
        '&:focus-visible': {
          outline: `2px solid ${tokens.color.accent}`,
          outlineOffset: 3,
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -32,
          right: -32,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tokens.color.accentInk} 0%, transparent 70%)`,
          opacity: 0.8,
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 'auto' }}>
        <Box
          className="overview-icon"
          aria-hidden="true"
          sx={{
            width: 48,
            height: 48,
            borderRadius: tokens.radius.md,
            display: 'grid',
            placeItems: 'center',
            color: tokens.color.accent,
            bgcolor: tokens.color.accentInk,
            border: '1px solid',
            borderColor: tokens.color.border,
            transition: 'all 280ms cubic-bezier(.4,.0,.2,1)',
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>
        <Typography
          sx={{
            fontFamily: tokens.font.mono,
            fontSize: '0.7rem',
            color: tokens.color.inkMute,
            letterSpacing: '0.18em',
          }}
        >
          {section.index}
        </Typography>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <Typography
          sx={{
            fontFamily: tokens.font.mono,
            fontSize: '0.65rem',
            color: tokens.color.accent,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {section.kicker}
        </Typography>
        <Typography
          sx={{
            fontFamily: tokens.font.display,
            fontWeight: 600,
            fontSize: '1.35rem',
            color: tokens.color.ink,
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            mb: 0.75,
            fontVariationSettings: '"SOFT" 50',
          }}
        >
          {section.title}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: tokens.color.inkSoft,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
          }}
        >
          {section.description}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        {loading ? (
          <Skeleton width={90} height={22} sx={{ borderRadius: tokens.radius.pill, bgcolor: tokens.color.paperDeep }} />
        ) : (
          <Chip
            size="small"
            label={
              count != null
                ? `${count} ${count === 1 ? section.singular.toLowerCase() : `${section.singular.toLowerCase()}s`}`
                : 'Sin datos'
            }
            sx={{
              bgcolor: tokens.color.paperDeep,
              color: tokens.color.ink,
              fontFamily: tokens.font.mono,
              fontSize: '0.7rem',
              fontWeight: 500,
              height: 26,
              borderRadius: tokens.radius.pill,
              border: '1px solid',
              borderColor: tokens.color.border,
              '& .MuiChip-label': { px: 1.25 },
            }}
          />
        )}
        <ArrowForwardRoundedIcon
          className="overview-arrow"
          sx={{
            color: tokens.color.inkMute,
            fontSize: 22,
            transition: 'transform 220ms, color 220ms',
          }}
        />
      </Box>
    </Box>
  );
};

const Overview = ({ onSelect }) => {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const entries = await Promise.all(
        Object.entries(countFetchers).map(async ([id, fn]) => {
          try {
            const data = await fn();
            return [id, Array.isArray(data) ? data.length : 0];
          } catch {
            return [id, null];
          }
        })
      );
      if (!mounted) return;
      setCounts(Object.fromEntries(entries));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const total = Object.values(counts).reduce((acc, v) => (typeof v === 'number' ? acc + v : acc), 0);
  const OverviewIcon = overviewMeta.icon;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4.5 } }}>
      <Box
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
            backgroundSize: '22px 22px',
            opacity: 0.15,
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${tokens.color.accentInk} 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 5 },
            alignItems: { md: 'flex-end' },
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ maxWidth: 640 }}>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.25, mb: 2 }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: tokens.radius.md,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: tokens.color.accent,
                  color: tokens.color.card,
                  boxShadow: tokens.shadow.raised,
                }}
              >
                <OverviewIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: tokens.font.mono,
                    fontSize: '0.7rem',
                    color: tokens.color.accent,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Módulo · {overviewMeta.index}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: tokens.font.display,
                    fontSize: '0.85rem',
                    color: tokens.color.inkSoft,
                    fontStyle: 'italic',
                    fontVariationSettings: '"SOFT" 80',
                  }}
                >
                  Codex de la Fundación
                </Typography>
              </Box>
            </Box>
            <Typography
              component="h1"
              sx={{
                fontFamily: tokens.font.display,
                fontWeight: 500,
                fontSize: { xs: '2.1rem', sm: '2.6rem', md: '3.2rem' },
                color: tokens.color.ink,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                mb: 2,
                fontVariationSettings: '"SOFT" 50, "WONK" 0, "opsz" 100',
              }}
            >
              Documentación,
              <Box
                component="span"
                sx={{
                  display: 'block',
                  fontStyle: 'italic',
                  background: tokens.color.gradientTitle,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontVariationSettings: '"SOFT" 100, "WONK" 1',
                }}
              >
                ordenada con calma.
              </Box>
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: tokens.color.inkSoft,
                lineHeight: 1.55,
                maxWidth: 560,
              }}
            >
              {overviewMeta.description}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 3 },
              alignItems: 'stretch',
            }}
          >
            <Box
              sx={{
                px: { xs: 2.5, md: 3 },
                py: { xs: 2, md: 2.25 },
                borderRadius: tokens.radius.md,
                bgcolor: tokens.color.cardSoft,
                border: '1px solid',
                borderColor: tokens.color.border,
                minWidth: 110,
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.font.mono,
                  fontSize: '0.65rem',
                  color: tokens.color.inkMute,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Secciones
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.font.display,
                  fontSize: '2rem',
                  fontWeight: 500,
                  color: tokens.color.ink,
                  lineHeight: 1.1,
                  mt: 0.5,
                }}
              >
                {String(sections.length).padStart(2, '0')}
              </Typography>
            </Box>
            <Box
              sx={{
                px: { xs: 2.5, md: 3 },
                py: { xs: 2, md: 2.25 },
                borderRadius: tokens.radius.md,
                bgcolor: tokens.color.cardSoft,
                border: '1px solid',
                borderColor: tokens.color.border,
                minWidth: 130,
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.font.mono,
                  fontSize: '0.65rem',
                  color: tokens.color.inkMute,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Registros
              </Typography>
              {loading ? (
                <Skeleton
                  width={60}
                  height={32}
                  sx={{ mt: 0.5, borderRadius: tokens.radius.sm, bgcolor: tokens.color.paperDeep }}
                />
              ) : (
                <Typography
                  sx={{
                    fontFamily: tokens.font.display,
                    fontSize: '2rem',
                    fontWeight: 500,
                    color: tokens.color.ink,
                    lineHeight: 1.1,
                    mt: 0.5,
                  }}
                >
                  {total}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 2,
            mb: { xs: 2, md: 3 },
            flexWrap: 'wrap',
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.font.display,
              fontWeight: 600,
              fontSize: { xs: '1.35rem', md: '1.6rem' },
              color: tokens.color.ink,
              letterSpacing: '-0.015em',
            }}
          >
            Índice del módulo
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.font.mono,
              fontSize: '0.7rem',
              color: tokens.color.inkMute,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Nueve secciones · acceso directo
          </Typography>
          <Box sx={{ flex: 1, height: 1, bgcolor: tokens.color.border, ml: 1, display: { xs: 'none', md: 'block' } }} />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(3, 1fr)',
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {sections.map((section) => (
            <OverviewCard
              key={section.id}
              section={section}
              count={counts[section.id]}
              loading={loading}
              onSelect={onSelect}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Overview;
