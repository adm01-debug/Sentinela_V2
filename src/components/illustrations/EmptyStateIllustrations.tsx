import React from 'react';
import { motion } from 'framer-motion';

// Reusable animated illustration wrapper
const IllustrationWrapper = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// No Data Illustration
export const NoDataIllustration = () => (
  <IllustrationWrapper>
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background elements */}
      <motion.circle
        cx="100"
        cy="80"
        r="60"
        fill="hsl(var(--primary) / 0.1)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      />
      
      {/* Document stack */}
      <motion.rect
        x="60"
        y="50"
        width="80"
        height="60"
        rx="4"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--border))"
        strokeWidth="2"
        initial={{ y: 70, opacity: 0 }}
        animate={{ y: 50, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      />
      <motion.rect
        x="70"
        y="60"
        width="60"
        height="4"
        rx="2"
        fill="hsl(var(--primary) / 0.3)"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      />
      <motion.rect
        x="70"
        y="70"
        width="45"
        height="4"
        rx="2"
        fill="hsl(var(--muted-foreground) / 0.2)"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
      <motion.rect
        x="70"
        y="80"
        width="55"
        height="4"
        rx="2"
        fill="hsl(var(--muted-foreground) / 0.2)"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      />
      
      {/* Question mark */}
      <motion.g
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.7, duration: 0.4, type: 'spring' }}
      >
        <circle cx="145" cy="45" r="18" fill="hsl(var(--primary))" />
        <text x="145" y="52" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">?</text>
      </motion.g>
    </svg>
  </IllustrationWrapper>
);

// No Users Illustration
export const NoUsersIllustration = () => (
  <IllustrationWrapper>
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="100"
        cy="80"
        r="55"
        fill="hsl(var(--primary) / 0.08)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* User avatars */}
      <motion.g
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.4, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <circle cx="60" cy="70" r="20" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="60" cy="65" r="7" fill="hsl(var(--muted-foreground) / 0.3)" />
        <path d="M48 85 C48 77, 72 77, 72 85" fill="hsl(var(--muted-foreground) / 0.3)" />
      </motion.g>
      
      <motion.g
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <circle cx="100" cy="75" r="25" fill="hsl(var(--muted))" stroke="hsl(var(--primary) / 0.5)" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="100" cy="68" r="9" fill="hsl(var(--primary) / 0.3)" />
        <path d="M85 95 C85 85, 115 85, 115 95" fill="hsl(var(--primary) / 0.3)" />
      </motion.g>
      
      <motion.g
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.4, x: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <circle cx="140" cy="70" r="20" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="140" cy="65" r="7" fill="hsl(var(--muted-foreground) / 0.3)" />
        <path d="M128 85 C128 77, 152 77, 152 85" fill="hsl(var(--muted-foreground) / 0.3)" />
      </motion.g>
      
      {/* Plus button */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4, type: 'spring' }}
      >
        <circle cx="100" cy="120" r="16" fill="hsl(var(--primary))" />
        <path d="M100 112 V128 M92 120 H108" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </svg>
  </IllustrationWrapper>
);

// No Activity Illustration
export const NoActivityIllustration = () => (
  <IllustrationWrapper>
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="100"
        cy="80"
        r="55"
        fill="hsl(var(--success) / 0.1)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Chart bars */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.rect
          key={i}
          x={55 + i * 22}
          y={110}
          width="16"
          height="0"
          rx="2"
          fill={i === 2 ? 'hsl(var(--success) / 0.5)' : 'hsl(var(--muted))'}
          initial={{ height: 0, y: 110 }}
          animate={{ height: [20, 35, 50, 30, 40][i], y: 110 - [20, 35, 50, 30, 40][i] }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
        />
      ))}
      
      {/* Flat line */}
      <motion.path
        d="M50 60 L150 60"
        stroke="hsl(var(--muted-foreground) / 0.3)"
        strokeWidth="2"
        strokeDasharray="6 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      />
      
      {/* Zzz */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <text x="155" y="50" fill="hsl(var(--muted-foreground))" fontSize="12" fontWeight="bold">z</text>
        <text x="162" y="42" fill="hsl(var(--muted-foreground) / 0.7)" fontSize="10" fontWeight="bold">z</text>
        <text x="168" y="36" fill="hsl(var(--muted-foreground) / 0.5)" fontSize="8" fontWeight="bold">z</text>
      </motion.g>
    </svg>
  </IllustrationWrapper>
);

// No Violations Illustration (Celebration)
export const NoViolationsIllustration = () => (
  <IllustrationWrapper>
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="100"
        cy="80"
        r="55"
        fill="hsl(var(--success) / 0.1)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Shield with checkmark */}
      <motion.path
        d="M100 35 L130 50 L130 85 C130 105 100 125 100 125 C100 125 70 105 70 85 L70 50 L100 35Z"
        fill="hsl(var(--success))"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
      />
      <motion.path
        d="M85 80 L95 90 L115 65"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      />
      
      {/* Sparkles */}
      {[
        { x: 50, y: 45, delay: 0.8 },
        { x: 150, y: 50, delay: 0.9 },
        { x: 45, y: 100, delay: 1.0 },
        { x: 155, y: 95, delay: 1.1 },
      ].map((star, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: star.delay, duration: 0.3 }}
        >
          <path
            d={`M${star.x} ${star.y - 6} L${star.x} ${star.y + 6} M${star.x - 6} ${star.y} L${star.x + 6} ${star.y}`}
            stroke="hsl(var(--warning))"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>
      ))}
    </svg>
  </IllustrationWrapper>
);

// Search No Results Illustration
export const NoSearchResultsIllustration = () => (
  <IllustrationWrapper>
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="100"
        cy="80"
        r="55"
        fill="hsl(var(--primary) / 0.08)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Magnifying glass */}
      <motion.circle
        cx="90"
        cy="70"
        r="30"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />
      <motion.line
        x1="112"
        y1="92"
        x2="135"
        y2="115"
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      />
      
      {/* X inside */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <line x1="78" y1="58" x2="102" y2="82" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round" />
        <line x1="102" y1="58" x2="78" y2="82" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  </IllustrationWrapper>
);

// Error Illustration
export const ErrorIllustration = () => (
  <IllustrationWrapper>
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="100"
        cy="80"
        r="55"
        fill="hsl(var(--destructive) / 0.1)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Warning triangle */}
      <motion.path
        d="M100 40 L140 110 L60 110 Z"
        fill="hsl(var(--destructive))"
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
      />
      <motion.line
        x1="100"
        y1="60"
        x2="100"
        y2="85"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
      <motion.circle
        cx="100"
        cy="98"
        r="4"
        fill="white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, duration: 0.2 }}
      />
    </svg>
  </IllustrationWrapper>
);

// Coming Soon Illustration
export const ComingSoonIllustration = () => (
  <IllustrationWrapper>
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="100"
        cy="80"
        r="55"
        fill="hsl(var(--primary) / 0.1)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Rocket */}
      <motion.g
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
      >
        <path
          d="M100 35 C115 45, 120 70, 115 95 L100 90 L85 95 C80 70, 85 45, 100 35Z"
          fill="hsl(var(--primary))"
        />
        <circle cx="100" cy="55" r="8" fill="hsl(var(--primary-foreground))" />
        <path d="M85 95 L80 110 L100 100 L120 110 L115 95" fill="hsl(var(--destructive))" />
      </motion.g>
      
      {/* Flames */}
      <motion.g
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <ellipse cx="100" cy="115" rx="8" ry="15" fill="hsl(var(--warning))" />
        <ellipse cx="100" cy="118" rx="4" ry="10" fill="hsl(var(--warning) / 0.7)" />
      </motion.g>
      
      {/* Stars */}
      {[
        { x: 55, y: 50 },
        { x: 145, y: 60 },
        { x: 50, y: 100 },
        { x: 150, y: 90 },
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x}
          cy={star.y}
          r="3"
          fill="hsl(var(--primary))"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0.8, 1] }}
          transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
        />
      ))}
    </svg>
  </IllustrationWrapper>
);

// Export all illustrations
export const illustrations = {
  noData: NoDataIllustration,
  noUsers: NoUsersIllustration,
  noActivity: NoActivityIllustration,
  noViolations: NoViolationsIllustration,
  noSearchResults: NoSearchResultsIllustration,
  error: ErrorIllustration,
  comingSoon: ComingSoonIllustration,
};
