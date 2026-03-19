export const Icon = ({ name, size = 16, color = "currentColor" }) => {
	const common = {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: color,
		style: { display: "block", flexShrink: 0 },
	};

	const icons = {
		dashboard: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="3" width="7" height="7" rx="1" />
				<rect x="14" y="3" width="7" height="7" rx="1" />
				<rect x="3" y="14" width="7" height="7" rx="1" />
				<rect x="14" y="14" width="7" height="7" rx="1" />
			</svg>
		),
		calendar: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="4" width="18" height="18" rx="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		),
		clients: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
				<circle cx="9" cy="7" r="4" />
				<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
				<path d="M16 3.13a4 4 0 0 1 0 7.75" />
			</svg>
		),
		config: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="3" />
				<path d="M19.07 4.93A10 10 0 1 1 4.93 19.07 10 10 0 0 1 19.07 4.93" />
				<path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
			</svg>
		),
		logout: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
				<polyline points="16 17 21 12 16 7" />
				<line x1="21" y1="12" x2="9" y2="12" />
			</svg>
		),
		plus: (
			<svg {...common} strokeWidth="2" strokeLinecap="round">
				<line x1="12" y1="5" x2="12" y2="19" />
				<line x1="5" y1="12" x2="19" y2="12" />
			</svg>
		),
		trash: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="3 6 5 6 21 6" />
				<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
				<path d="M10 11v6M14 11v6" />
				<path d="M9 6V4h6v2" />
			</svg>
		),
		search: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
		),
		chevLeft: (
			<svg {...common} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="15 18 9 12 15 6" />
			</svg>
		),
		chevRight: (
			<svg {...common} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="9 18 15 12 9 6" />
			</svg>
		),
		car: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
				<rect x="7" y="14" width="10" height="6" rx="1" />
				<path d="M5 9l2-5h10l2 5" />
				<circle cx="7.5" cy="17" r="1.5" />
				<circle cx="16.5" cy="17" r="1.5" />
			</svg>
		),
		check: (
			<svg {...common} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="20 6 9 17 4 12" />
			</svg>
		),
		x: (
			<svg {...common} strokeWidth="2" strokeLinecap="round">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		),
		edit: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
				<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
			</svg>
		),
		water: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" />
			</svg>
		),
		phone: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.6 19.5a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l.72-.73a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
			</svg>
		),
		mail: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
				<polyline points="22,6 12,13 2,6" />
			</svg>
		),
		map: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
				<circle cx="12" cy="10" r="3" />
			</svg>
		),
		save: (
			<svg {...common} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
				<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
				<polyline points="17 21 17 13 7 13 7 21" />
				<polyline points="7 3 7 8 15 8" />
			</svg>
		),
	};

	return icons[name] || null;
};