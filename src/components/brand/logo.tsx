export function LogoMark({ className = 'size-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Genematic AI"
      className={className}
    >
      <path
        d="M14 4C14 14 34 14 34 24C34 34 14 34 14 44"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M34 4C34 14 14 14 14 24C14 34 34 34 34 44"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M22.45 8.25h3.1a1.2 1.2 0 0 1 1.2 1.2v1.1a1.2 1.2 0 0 1-1.2 1.2h-3.1a1.2 1.2 0 0 1-1.2-1.2v-1.1a1.2 1.2 0 0 1 1.2-1.2ZM21.2 22.25h5.6a1.2 1.2 0 0 1 1.2 1.2v1.1a1.2 1.2 0 0 1-1.2 1.2h-5.6a1.2 1.2 0 0 1-1.2-1.2v-1.1a1.2 1.2 0 0 1 1.2-1.2ZM22.45 36.25h3.1a1.2 1.2 0 0 1 1.2 1.2v1.1a1.2 1.2 0 0 1-1.2 1.2h-3.1a1.2 1.2 0 0 1-1.2-1.2v-1.1a1.2 1.2 0 0 1 1.2-1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
