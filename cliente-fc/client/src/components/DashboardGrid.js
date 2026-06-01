import { Box, Card, CardContent, Typography, Avatar, Fade } from '@mui/material';

const tokens = {
  paper: '#f8fafc',
  card: '#ffffff',
  ink: '#1e293b',
  inkSoft: '#64748b',
  border: '#e2e8f0',
  accent: '#2563eb',
  gradientTitle: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  radius: '24px',
  shadowCard: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
};

export const DashboardGrid = ({ children, minCardWidth = 260, maxWidth }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
        md: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
      },
      gap: { xs: 2, md: 3 },
      width: '100%',
      maxWidth: maxWidth || 'none',
    }}
  >
    {children}
  </Box>
);

export const DashboardHeader = ({ title, subtitle }) => (
  <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
    <Typography
      variant="h4"
      component="h1"
      sx={{
        fontWeight: 'bold',
        mb: 1,
        fontSize: { xs: '1.5rem', md: '2.5rem' },
        background: tokens.gradientTitle,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant="h6"
        sx={{
          color: tokens.inkSoft,
          fontWeight: 500,
          letterSpacing: '0.5px',
          fontSize: { xs: '0.9rem', md: '1.25rem' },
        }}
      >
        {subtitle}
      </Typography>
    )}
  </Box>
);

export const DashboardCard = ({ item, index, onClick }) => {
  const Icon = item.icon;
  return (
    <Fade in timeout={300 + index * 80}>
      <Card
        elevation={0}
        onClick={onClick}
        sx={{
          borderRadius: `${tokens.radius} !important`,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: '1px solid',
          borderColor: tokens.border,
          backgroundColor: tokens.card,
          boxShadow: tokens.shadowCard,
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: item.color,
            boxShadow: `0 12px 28px -8px ${item.color}33, 0 6px 12px -6px ${item.color}22`,
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, textAlign: 'center' }}>
          <Avatar
            sx={{
              bgcolor: item.color,
              width: { xs: 56, md: 64 },
              height: { xs: 56, md: 64 },
              mx: 'auto',
              mb: 2,
            }}
          >
            {Icon}
          </Avatar>
          <Typography
            variant="h6"
            sx={{ mb: 1, color: tokens.ink, fontWeight: 'bold' }}
          >
            {item.title}
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft }}>
            {item.description}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};
