import Box from '@mui/material/Box';

interface AbsIconProps {
  /** solid = book is in Audiobookshelf; hollow = not yet uploaded; disabled = integration off/disconnected */
  variant: 'solid' | 'hollow' | 'disabled';
  size?: number;
}

/**
 * Simple stylized bookshelf glyph used to represent Audiobookshelf status.
 * Not a reproduction of the Audiobookshelf project's trademarked logo.
 */
export default function AbsIcon({ variant, size = 22 }: AbsIconProps) {
  const color = variant === 'disabled' ? '#9e9e9e' : '#3f8ea6';
  const filled = variant === 'solid';

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.6" fill={filled ? color : 'none'} opacity={variant === 'disabled' ? 0.5 : 1} />
        <line x1="8" y1="4" x2="8" y2="20" stroke={color} strokeWidth="1.4" opacity={variant === 'disabled' ? 0.5 : 1} />
        <line x1="14" y1="4" x2="14" y2="20" stroke={color} strokeWidth="1.4" opacity={variant === 'disabled' ? 0.5 : 1} />
      </svg>
      {variant === 'disabled' && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <line x1="2" y1="22" x2="22" y2="2" stroke="#9e9e9e" strokeWidth="2" />
        </svg>
      )}
    </Box>
  );
}
