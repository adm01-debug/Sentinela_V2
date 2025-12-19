import { memo } from 'react';

// ============================================================
// SKIP LINK COMPONENT
// Allows keyboard users to skip navigation and go directly to main content
// ============================================================

export const SkipLink = memo(function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only
        focus:not-sr-only
        focus:fixed
        focus:top-4
        focus:left-4
        focus:z-[100]
        focus:px-4
        focus:py-2
        focus:bg-primary
        focus:text-primary-foreground
        focus:rounded-md
        focus:outline-none
        focus:ring-2
        focus:ring-ring
        focus:ring-offset-2
      "
    >
      Pular para o conteúdo principal
    </a>
  );
});

export default SkipLink;
