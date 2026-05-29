// Shared UI primitives for GanaderíaPro

// Status badge — dot + label
const StatusBadge = ({ status, size = 'sm' }) => {
  const s = STATUS[status];
  if (!s) return null;
  const pad = size === 'sm' ? '4px 8px' : '6px 10px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: pad, borderRadius: 999,
      background: s.bg, color: s.fg,
      fontSize: fs, fontWeight: 600, letterSpacing: 0.1,
      lineHeight: 1, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot }} />
      {s.label}
    </span>
  );
};

// Animal "photo" — circular avatar with a stylized placeholder graphic
const AnimalAvatar = ({ animal, size = 44 }) => {
  const fill = animal.color || (animal.sexo === 'M' ? '#E9D8C4' : '#D8F3DC');
  const accent = animal.sexo === 'M' ? '#A47148' : '#2D6A4F';
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: fill,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      position: 'relative', overflow: 'hidden',
    }}>
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* simple cow head silhouette */}
        <path d="M5 9c0-2 1-3.5 2.5-3.5S10 7 10 9" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 9c0-2 1-3.5 2.5-3.5S19 7 19 9" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 9h14v4a7 7 0 0 1-14 0Z" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.5"/>
        <circle cx="9.5" cy="12" r=".9" fill={accent}/>
        <circle cx="14.5" cy="12" r=".9" fill={accent}/>
        <path d="M10 16c.5 .8 1.5 1.2 2 1.2s1.5-.4 2-1.2" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
};

// Pill button — used heavily in filter rows and forms
const Pill = ({ active, onClick, children, color, size = 'md', icon, style = {} }) => {
  const palette = {
    green:  { bg: GP.green, fg: '#fff', border: GP.green },
    amber:  { bg: GP.amber, fg: '#fff', border: GP.amber },
    red:    { bg: GP.red, fg: '#fff', border: GP.red },
    earth:  { bg: GP.earth, fg: '#fff', border: GP.earth },
  };
  const c = color && active ? palette[color] : null;
  const h = size === 'lg' ? 52 : size === 'sm' ? 32 : 40;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: h, padding: '0 14px',
        borderRadius: 999,
        border: `1.5px solid ${active ? (c?.border || GP.green) : GP.border}`,
        background: active ? (c?.bg || GP.green) : GP.white,
        color: active ? (c?.fg || GP.white) : GP.text,
        fontSize: size === 'lg' ? 15 : 13,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'all .15s ease',
        fontFamily: GP.font,
        ...style,
      }}>
      {icon}
      {children}
    </button>
  );
};

// Primary CTA button — full-width by default
const Button = ({ children, onClick, variant = 'primary', size = 'md', icon, disabled, style = {}, fullWidth = false }) => {
  const variants = {
    primary: { bg: GP.green, fg: '#fff', border: GP.green, hover: GP.greenDeep },
    danger:  { bg: GP.red, fg: '#fff', border: GP.red },
    amber:   { bg: GP.amber, fg: '#fff', border: GP.amber },
    ghost:   { bg: 'transparent', fg: GP.text, border: 'transparent' },
    outline: { bg: GP.white, fg: GP.text, border: GP.border },
    softGreen: { bg: GP.greenLight, fg: GP.greenDeep, border: GP.greenLight },
  };
  const v = variants[variant] || variants.primary;
  const h = size === 'lg' ? 52 : size === 'sm' ? 36 : 44;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        height: h,
        padding: '0 18px',
        borderRadius: 12,
        border: `1.5px solid ${v.border}`,
        background: disabled ? '#E5E7EB' : v.bg,
        color: disabled ? '#9CA3AF' : v.fg,
        fontSize: 15, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: GP.font,
        transition: 'all .15s ease',
        ...style,
      }}>
      {icon}
      {children}
    </button>
  );
};

// Compact metric chip — used on inventory header
const MetricChip = ({ label, value, sub, accent = GP.green }) => (
  <div style={{
    flex: '0 0 auto',
    minWidth: 116,
    padding: '10px 12px',
    background: GP.white,
    borderRadius: 12,
    border: `1px solid ${GP.border}`,
  }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: GP.textSec, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: GP.textSec, fontWeight: 500 }}>{sub}</span>}
    </div>
  </div>
);

// Form field wrapper
const Field = ({ label, hint, required, children, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label style={{ fontSize: 13, fontWeight: 500, color: GP.text, letterSpacing: 0.1 }}>
        {label} {required && <span style={{ color: GP.red }}>*</span>}
      </label>
    )}
    {children}
    {hint && !error && <div style={{ fontSize: 12, color: GP.textSec }}>{hint}</div>}
    {error && <div style={{ fontSize: 12, color: GP.red, display: 'flex', alignItems: 'center', gap: 4 }}>
      <Icon name="warn" size={12} /> {error}
    </div>}
  </div>
);

// Plain text input
const Input = ({ value, onChange, placeholder, type = 'text', large = false, prefix, suffix, style = {} }) => (
  <div style={{
    display: 'flex', alignItems: 'center',
    background: GP.white,
    border: `1.5px solid ${GP.border}`,
    borderRadius: 12,
    height: large ? 56 : 44,
    paddingLeft: prefix ? 14 : 0,
    paddingRight: suffix ? 14 : 0,
    fontFamily: GP.font,
    ...style,
  }}>
    {prefix && <span style={{ color: GP.textSec, fontSize: 14, fontWeight: 500, marginRight: 8 }}>{prefix}</span>}
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        flex: 1, height: '100%', border: 'none', outline: 'none', background: 'transparent',
        padding: '0 14px',
        fontSize: large ? 24 : 15, fontWeight: large ? 700 : 500,
        color: GP.text, letterSpacing: large ? 1 : 0.1,
        fontFamily: GP.font,
        width: '100%',
      }}
    />
    {suffix && <span style={{ color: GP.textSec, fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{suffix}</span>}
  </div>
);

// Textarea
const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value || ''}
    onChange={e => onChange && onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: '100%', boxSizing: 'border-box',
      padding: '12px 14px',
      background: GP.white, border: `1.5px solid ${GP.border}`, borderRadius: 12,
      fontFamily: GP.font, fontSize: 14, color: GP.text,
      outline: 'none', resize: 'none', lineHeight: 1.5,
    }}
  />
);

// Select (lightweight, styled like input — no native browser ugly)
const Select = ({ value, onChange, options, placeholder = 'Seleccionar…' }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: 44,
          padding: '0 14px',
          background: GP.white, border: `1.5px solid ${open ? GP.green : GP.border}`, borderRadius: 12,
          fontFamily: GP.font, fontSize: 15, fontWeight: 500,
          color: value ? GP.text : GP.textSec,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left',
        }}>
        <span>{value || placeholder}</span>
        <Icon name="chevD" size={16} color={GP.textSec} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: GP.white, border: `1px solid ${GP.border}`, borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,0.10)',
          zIndex: 50, maxHeight: 240, overflowY: 'auto',
          padding: 4,
        }}>
          {options.map((opt) => (
            <button key={opt} type="button"
              onClick={() => { onChange && onChange(opt); setOpen(false); }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '10px 12px', borderRadius: 8,
                border: 'none', background: value === opt ? GP.greenLight : 'transparent',
                color: GP.text, fontFamily: GP.font, fontSize: 14, fontWeight: 500,
                cursor: 'pointer',
              }}>{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// Search input — magnifying glass on the left
const SearchInput = ({ value, onChange, placeholder = 'Buscar…' }) => (
  <div style={{
    display: 'flex', alignItems: 'center',
    height: 44, padding: '0 14px',
    background: GP.white, border: `1.5px solid ${GP.border}`, borderRadius: 12,
    gap: 8,
  }}>
    <Icon name="search" size={18} color={GP.textSec} />
    <input
      value={value || ''}
      onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        flex: 1, border: 'none', outline: 'none', background: 'transparent',
        fontFamily: GP.font, fontSize: 15, color: GP.text,
      }}
    />
    {value && (
      <button type="button" onClick={() => onChange('')} style={{
        border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
      }}>
        <Icon name="x" size={14} color={GP.textSec} />
      </button>
    )}
  </div>
);

Object.assign(window, {
  StatusBadge, AnimalAvatar, Pill, Button, MetricChip, Field, Input, Textarea, Select, SearchInput,
});
