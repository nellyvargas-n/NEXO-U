function Icon({ name, className = 'size-5' }) {
  const icons = {
    'arrow-right': <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    'arrow-up-right': <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>,
    'book-open': <><path d="M12 7v14" /><path d="M3 5h5a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H3z" /><path d="M21 5h-5a4 4 0 0 0-4 4v12a4 4 0 0 1 4-4h5z" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    building: <><path d="M4 21h16M6 21V5l6-2 6 2v16M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 21v-4h4v4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    'chevron-down': <path d="m6 9 6 6 6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    'graduation-cap': <><path d="m2 10 10-5 10 5-10 5-10-5Z" /><path d="M6 12v5c3.5 2.7 8.5 2.7 12 0v-5M22 10v6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    'rotate-ccw': <><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 8h18M16 14h2" /><path d="M6 5V3h12v2" /></>,
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name] ?? icons['arrow-right']}
    </svg>
  )
}

export default Icon
