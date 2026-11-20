import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  Copy,
  Share2,
  Instagram,
  Youtube,
  Globe,
  Mail,
  Link2,
  LayoutGrid,
  UserSquare2,
  Paintbrush,
  Menu,
  ChevronDown,
  MoreVertical,
  Upload,
  Palette,
  Undo2,
  Redo2,
  ExternalLink,
  Sparkles,
  LogOut,
  RotateCcw,
  X,
  QrCode,
  Edit3,
  MessageCircle,
  Music2,
  Loader2,
} from 'lucide-react';
import { BrandMark } from '../components/atoms/BrandMark';
import { StatusDot } from '../components/atoms/StatusDot';
import { ToastNotification } from '../components/molecules/ToastNotification';
import { AuthTemplate } from '../components/templates/AuthTemplate';

// --- TYPES & INTERFACES ---

type AppStep = 'login' | 'step-links' | 'step-profile' | 'step-color' | 'transition' | 'dashboard';
type DashboardTab = 'content' | 'header' | 'design';
type HeaderLayoutType = 'classic' | 'hero' | 'banner';
type ButtonVariant = 'solid' | 'outline' | 'soft';
type FontChoice = 'Inter' | 'DM Sans' | 'Plus Jakarta Sans' | 'JetBrains Mono';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  active: boolean;
  clicks: number;
}

interface SocialChannels {
  instagram: string;
  tiktok: string;
  whatsapp: string;
  youtube: string;
  website: string;
}

interface BioPageState {
  accountEmail: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerColor: string;
  headerLayout: HeaderLayoutType;
  titleColor: string;
  wallpaperColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonVariant: ButtonVariant;
  fontFamily: FontChoice;
  showFooterBadge: boolean;
  socials: SocialChannels;
  links: LinkItem[];
}

// --- SOLID COLOR PALETTES (ZERO GRADIENTS) ---

const WALLPAPER_SWATCHES = [
  { name: 'Pure White', hex: '#FFFFFF', darkText: true },
  { name: 'Sky Tint', hex: '#F0F9FF', darkText: true },
  { name: 'Sky Blue', hex: '#0EA5E9', darkText: false },
  { name: 'Deep Slate', hex: '#434B72', darkText: false },
  { name: 'Steel Blue', hex: '#607784', darkText: false },
  { name: 'Espresso', hex: '#433A31', darkText: false },
  { name: 'Midnight', hex: '#0F172A', darkText: false },
  { name: 'Soft Sand', hex: '#F5DFC6', darkText: true },
  { name: 'Blush Pink', hex: '#F5D5EA', darkText: true },
];

const BUTTON_SWATCHES = [
  { name: 'Sky Blue', bg: '#0EA5E9', text: '#FFFFFF' },
  { name: 'Deep Sky', bg: '#0284C7', text: '#FFFFFF' },
  { name: 'Charcoal', bg: '#18181B', text: '#FFFFFF' },
  { name: 'Pure White', bg: '#FFFFFF', text: '#0F172A' },
  { name: 'Periwinkle', bg: '#7E87B5', text: '#FFFFFF' },
  { name: 'Soft Sky', bg: '#E0F2FE', text: '#0369A1' },
  { name: 'Slate Gray', bg: '#475569', text: '#FFFFFF' },
  { name: 'Warm Stone', bg: '#E7E5E4', text: '#1C1917' },
  { name: 'Obsidian', bg: '#09090B', text: '#FFFFFF' },
];

const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const APP_URL = (
  isLocalHost ? window.location.origin : import.meta.env.VITE_APP_URL || window.location.origin
).replace(/\/$/, '');

const PROFILE_QUERY_USERNAME = new URLSearchParams(window.location.search).get('profile');
const PATH_USERNAME = window.location.pathname === '/'
  ? null
  : decodeURIComponent(window.location.pathname).replace(/^\//, '').replace(/\/$/, '') || null;
const PUBLIC_USERNAME_VALUE = (PROFILE_QUERY_USERNAME || PATH_USERNAME)?.trim();
const PUBLIC_USERNAME = PUBLIC_USERNAME_VALUE ? PUBLIC_USERNAME_VALUE.toLowerCase() : null;

const getPublicProfileUrl = (username: string) =>
  `${APP_URL}/?profile=${encodeURIComponent(username.trim().toLowerCase())}`;

const INITIAL_STATE: BioPageState = {
  accountEmail: '',
  username: 'soryn',
  displayName: 'Soryn',
  bio: 'Tu espacio digital. Minimal. Oscuro. Tuyo.',
  avatarUrl:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  bannerColor: '#0EA5E9',
  headerLayout: 'classic',
  titleColor: '#0F172A',
  wallpaperColor: '#FFFFFF',
  buttonColor: '#0EA5E9',
  buttonTextColor: '#FFFFFF',
  buttonVariant: 'solid',
  fontFamily: 'DM Sans',
  showFooterBadge: true,
  socials: {
    instagram: '',
    tiktok: '',
    whatsapp: '',
    youtube: '',
    website: '',
  },
  links: [],
};

// Helper to determine if background hex is light or dark
function isColorLight(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return true;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

// --- SOLID QR CODE SVG COMPONENT ---

const SolidQRCode: React.FC<{ url: string }> = ({ url }) => (
  <div className="p-4 bg-white border border-slate-200 rounded-2xl inline-block">
    <QRCodeSVG
      value={url}
      size={176}
      level="M"
      bgColor="#FFFFFF"
      fgColor="#0F172A"
      marginSize={2}
      title="QR Code halaman bio"
      className="block"
    />
  </div>
);

// --- REUSABLE LIVE PHONE PREVIEW COMPONENT ---

const LivePhoneMockup: React.FC<{
  data: BioPageState;
  compact?: boolean;
  skeletonMode?: boolean;
  tilted3D?: boolean;
  onLinkClick?: (id: string) => void;
  onCopyShare?: () => void;
}> = ({
  data,
  compact = false,
  skeletonMode = false,
  tilted3D = false,
  onLinkClick,
  onCopyShare,
}) => {
  const lightBg = isColorLight(data.wallpaperColor);
  const autoTextColor = lightBg ? '#0F172A' : '#FFFFFF';
  const subTextColor = lightBg ? '#475569' : '#E2E8F0';
  const resolvedTitleColor =
    data.headerLayout === 'hero'
      ? '#FFFFFF'
      : data.titleColor || autoTextColor;

  const fontClass =
    data.fontFamily === 'JetBrains Mono'
      ? 'font-mono'
      : data.fontFamily === 'Plus Jakarta Sans'
      ? 'font-sans tracking-tight'
      : 'font-sans';

  const activeLinks = data.links.filter((l) => l.active);

  return (
    <div
      style={{
        backgroundColor: data.wallpaperColor,
        transform: tilted3D
          ? 'perspective(1100px) rotateY(-14deg) rotateX(4deg) rotateZ(-2deg)'
          : undefined,
      }}
      className={`relative overflow-hidden transition-all duration-300 select-none ${fontClass} ${
        compact
          ? 'w-[270px] h-[520px] rounded-[38px] border-[7px] border-neutral-900 shadow-xl'
          : 'w-[325px] sm:w-[345px] min-h-[630px] max-h-[76vh] rounded-[40px] border border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.08)]'
      }`}
    >
      {/* Top Action Icons inside Phone */}
      {!skeletonMode && (
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold backdrop-blur-sm ${
              lightBg && data.headerLayout !== 'hero'
                ? 'bg-slate-900/10 text-slate-800'
                : 'bg-black/25 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          {onCopyShare && (
            <button
              type="button"
              onClick={onCopyShare}
              title="Salin tautan"
              className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer ${
                lightBg && data.headerLayout !== 'hero'
                  ? 'bg-slate-900/10 text-slate-800 hover:bg-slate-900/20'
                  : 'bg-black/25 text-white hover:bg-black/40'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Scrollable Phone Interior */}
      <div className="h-full overflow-y-auto flex flex-col justify-between pb-6">
        <div>
          {/* HEADER LAYOUT: CLASSIC / BANNER / HERO */}
          {data.headerLayout === 'banner' && (
            <div
              style={{ backgroundColor: data.bannerColor }}
              className="w-full h-28 relative"
            />
          )}

          {data.headerLayout === 'hero' ? (
            <div className="relative w-full h-56 overflow-hidden">
              <img
                src={data.avatarUrl}
                alt={data.displayName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-slate-900/75 px-5 py-3.5 text-center">
                <h3 className="text-white font-bold text-base tracking-tight truncate">
                  {data.displayName || 'Your Name'}
                </h3>
                {data.bio && (
                  <p className="text-slate-200 text-[11px] line-clamp-2 mt-0.5">{data.bio}</p>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`px-6 text-center ${
                data.headerLayout === 'banner' ? '-mt-11 relative z-10' : 'pt-12'
              }`}
            >
              <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-[3px] border-white shadow-sm bg-sky-100">
                <img
                  src={data.avatarUrl}
                  alt={data.displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3
                style={{ color: resolvedTitleColor }}
                className="mt-3.5 font-bold text-base tracking-tight"
              >
                {data.displayName || 'Your Name'}
              </h3>

              {skeletonMode ? (
                <div className="mt-2 space-y-1.5 flex flex-col items-center">
                  <div className="w-36 h-2 rounded-full bg-current opacity-20" />
                  <div className="w-24 h-2 rounded-full bg-current opacity-15" />
                </div>
              ) : (
                data.bio && (
                  <p
                    style={{ color: subTextColor }}
                    className="mt-1.5 text-xs leading-relaxed max-w-[260px] mx-auto"
                  >
                    {data.bio}
                  </p>
                )
              )}
            </div>
          )}

          {/* SOCIAL ICONS ROW */}
          <div
            style={{ color: autoTextColor }}
            className="flex items-center justify-center gap-3.5 mt-4 px-5"
          >
            {data.socials.instagram && (
              <a
                href={data.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="opacity-85 hover:opacity-100 transition-opacity"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {data.socials.tiktok && (
              <a
                href={data.socials.tiktok}
                target="_blank"
                rel="noreferrer"
                className="opacity-85 hover:opacity-100 transition-opacity"
              >
                <Music2 className="w-4 h-4" />
              </a>
            )}
            {data.socials.whatsapp && (
              <a
                href={data.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="opacity-85 hover:opacity-100 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {data.socials.youtube && (
              <a
                href={data.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="opacity-85 hover:opacity-100 transition-opacity"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {data.socials.website && (
              <a
                href={data.socials.website}
                target="_blank"
                rel="noreferrer"
                className="opacity-85 hover:opacity-100 transition-opacity"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* LINKS STACK */}
          <div className="px-5 mt-5 space-y-3">
            {skeletonMode ? (
              <>
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    style={{
                      backgroundColor: data.buttonColor,
                      opacity: 0.85,
                    }}
                    className="w-full h-11 rounded-full flex items-center justify-end px-4"
                  >
                    <MoreVertical
                      style={{ color: data.buttonTextColor }}
                      className="w-3.5 h-3.5 opacity-60"
                    />
                  </div>
                ))}
              </>
            ) : (
              activeLinks.map((link) => {
                const buttonStyles: React.CSSProperties =
                  data.buttonVariant === 'solid'
                    ? {
                        backgroundColor: data.buttonColor,
                        color: data.buttonTextColor,
                        borderColor: data.buttonColor,
                      }
                    : data.buttonVariant === 'outline'
                    ? {
                        backgroundColor: 'transparent',
                        color: autoTextColor,
                        borderColor: autoTextColor,
                      }
                    : {
                        backgroundColor: lightBg ? '#F1F5F9' : 'rgba(255,255,255,0.14)',
                        color: autoTextColor,
                        borderColor: 'transparent',
                      };

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onLinkClick && onLinkClick(link.id)}
                    style={buttonStyles}
                    className="group relative w-full min-h-[48px] px-5 py-3 rounded-full border text-xs font-medium text-center flex items-center justify-center transition-transform duration-150 hover:scale-[1.015] active:scale-[0.99]"
                  >
                    <span className="px-4 leading-snug line-clamp-2">{link.title}</span>
                    <MoreVertical className="w-3.5 h-3.5 opacity-60 absolute right-3.5 shrink-0" />
                  </a>
                );
              })
            )}

            {!skeletonMode && activeLinks.length === 0 && (
              <div
                style={{ color: subTextColor, borderColor: subTextColor }}
                className="border border-dashed rounded-2xl p-5 text-center text-xs opacity-60"
              >
                Belum ada link aktif
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM LINKTREE-STYLE PILL CTA */}
        <div className="mt-8 px-5 text-center space-y-2.5">
          {data.showFooterBadge && (
            <div className="inline-flex items-center gap-1.5 bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-full text-[11px] font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Join {data.username || 'soryn'} on Soryn</span>
            </div>
          )}
          <p style={{ color: subTextColor }} className="text-[10px] opacity-65">
            Cookie Preferences • Report • Privacy
          </p>
        </div>
      </div>
    </div>
  );
};


// --- SORYN PUBLIC PROFILE (guns.lol / uservault style) ---

const SorynPublicProfile: React.FC<{ data: BioPageState }> = ({ data }) => {
  const [entered, setEntered] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const accent = data.buttonColor || '#8b5cf6';
  const activeLinks = data.links.filter((l) => l.active);

  // Optional: you can later store music_url in the profile.
  // For now we leave audio ready for when you add the field.
  const musicUrl: string | null = null;

  React.useEffect(() => {
    if (entered && audioRef.current && musicUrl) {
      audioRef.current.volume = 0.35;
      audioRef.current.play().catch(() => {});
    }
  }, [entered, musicUrl]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setMuted(audioRef.current.muted);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundColor: data.wallpaperColor || '#000000',
          backgroundImage: data.avatarUrl && data.headerLayout === 'hero'
            ? `url(${data.avatarUrl})`
            : undefined,
        }}
      />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

      {/* Click to Enter */}
      {!entered && (
        <div
          onClick={() => setEntered(true)}
          className="absolute inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/85 backdrop-blur-md transition-opacity"
        >
          <p className="text-2xl font-medium tracking-[0.35em] text-white/90 md:text-3xl">
            Click to Enter
          </p>
          <div className="mt-5 h-px w-14 bg-white/40" />
          <p className="mt-4 text-xs tracking-widest text-white/40 uppercase">
            soryn
          </p>
        </div>
      )}

      {/* Audio (ready for future music_url) */}
      {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" />}

      {/* Mute button */}
      {entered && musicUrl && (
        <button
          onClick={toggleMute}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/50 backdrop-blur-md transition hover:bg-black/70"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <span className="text-sm">🔇</span>
          ) : (
            <span className="text-sm">🔊</span>
          )}
        </button>
      )}

      {/* Main content */}
      <div
        className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 transition-opacity duration-700 ${
          entered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Glass card */}
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          {/* Avatar */}
          <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 shadow-lg">
            {data.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt={data.displayName || data.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/10 text-3xl font-bold">
                {(data.displayName || data.username || 'S')[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Name with glow */}
          <h1
            className="mb-2 text-center text-3xl font-bold tracking-tight"
            style={{
              color: accent,
              textShadow: `0 0 24px ${accent}90, 0 0 48px ${accent}40`,
            }}
          >
            {data.displayName || data.username}
          </h1>

          {/* Bio */}
          {data.bio && (
            <p className="mb-6 text-center text-sm leading-relaxed text-white/65">
              {data.bio}
            </p>
          )}

          {/* Socials row */}
          {(data.socials.instagram ||
            data.socials.tiktok ||
            data.socials.youtube ||
            data.socials.whatsapp ||
            data.socials.website) && (
            <div className="mb-6 flex flex-wrap justify-center gap-3">
              {data.socials.instagram && (
                <a
                  href={data.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-medium uppercase transition hover:scale-110 hover:bg-white/15"
                >
                  IG
                </a>
              )}
              {data.socials.tiktok && (
                <a
                  href={data.socials.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-medium uppercase transition hover:scale-110 hover:bg-white/15"
                >
                  TT
                </a>
              )}
              {data.socials.youtube && (
                <a
                  href={data.socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-medium uppercase transition hover:scale-110 hover:bg-white/15"
                >
                  YT
                </a>
              )}
              {data.socials.whatsapp && (
                <a
                  href={data.socials.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-medium uppercase transition hover:scale-110 hover:bg-white/15"
                >
                  WA
                </a>
              )}
              {data.socials.website && (
                <a
                  href={data.socials.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-medium uppercase transition hover:scale-110 hover:bg-white/15"
                >
                  WEB
                </a>
              )}
            </div>
          )}

          {/* Links */}
          {activeLinks.length > 0 && (
            <div className="space-y-3">
              {activeLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-center text-sm font-medium transition hover:scale-[1.02] hover:bg-white/10"
                  style={{ borderColor: `${accent}40` }}
                >
                  {link.title}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] tracking-[0.25em] text-white/30 uppercase">
            soryn
          </p>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APPLICATION ---

export default function BioLinkApp() {
  const [data, setData] = useState<BioPageState>(INITIAL_STATE);
  const [step, setStep] = useState<AppStep>('login');

  // Supabase Auth States
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Login / Register inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');

  // Step 1 Onboarding Link Inputs
  const [quickTitle, setQuickTitle] = useState('');
  const [quickUrl, setQuickUrl] = useState('');

  // Step 3 Color Onboarding Sub-tab
  const [colorOnboardingTab, setColorOnboardingTab] = useState<'wallpaper' | 'buttons'>('wallpaper');

  // Dashboard States
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('content');
  const [mobileDashMode, setMobileDashMode] = useState<'editor' | 'preview'>('editor');
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUrl, setModalUrl] = useState('');

  const [showShareModal, setShowShareModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Undo/Redo history for dashboard edits
  const [history, setHistory] = useState<BioPageState[]>([]);
  const [redoStack, setRedoStack] = useState<BioPageState[]>([]);

  const [publicProfile, setPublicProfile] = useState<BioPageState | null>(null);
  const [publicProfileLoading, setPublicProfileLoading] = useState(Boolean(PUBLIC_USERNAME));
  const [publicProfileError, setPublicProfileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isHydratingRef = useRef<boolean>(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  useEffect(() => {
    if (!PUBLIC_USERNAME) return;

    let mounted = true;

    supabase.rpc('get_public_profile', { p_username: PUBLIC_USERNAME }).maybeSingle()
      .then(({ data: profile, error }) => {
        if (!mounted) return;

        if (error) {
          setPublicProfileError(error.message);
          setPublicProfileLoading(false);
          return;
        }

        if (!profile) {
          setPublicProfileError('Halaman bio tidak ditemukan.');
          setPublicProfileLoading(false);
          return;
        }

        const publicProfileRow = profile as {
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          banner_color: string | null;
          header_layout: string | null;
          title_color: string | null;
          wallpaper_color: string | null;
          button_color: string | null;
          button_text_color: string | null;
          button_variant: string | null;
          font_family: string | null;
          show_footer_badge: boolean | null;
          socials: SocialChannels | null;
          links: LinkItem[] | null;
        };

        setPublicProfile({
          accountEmail: '',
          username: publicProfileRow.username,
          displayName: publicProfileRow.display_name || publicProfileRow.username,
          bio: publicProfileRow.bio || '',
          avatarUrl: publicProfileRow.avatar_url || INITIAL_STATE.avatarUrl,
          bannerColor: publicProfileRow.banner_color || '#0EA5E9',
          headerLayout: (publicProfileRow.header_layout as HeaderLayoutType) || 'classic',
          titleColor: publicProfileRow.title_color || '#0F172A',
          wallpaperColor: publicProfileRow.wallpaper_color || '#FFFFFF',
          buttonColor: publicProfileRow.button_color || '#0EA5E9',
          buttonTextColor: publicProfileRow.button_text_color || '#FFFFFF',
          buttonVariant: (publicProfileRow.button_variant as ButtonVariant) || 'solid',
          fontFamily: (publicProfileRow.font_family as FontChoice) || 'DM Sans',
          showFooterBadge: publicProfileRow.show_footer_badge ?? true,
          socials: publicProfileRow.socials || INITIAL_STATE.socials,
          links: Array.isArray(publicProfileRow.links) ? publicProfileRow.links : [],
        });
        setPublicProfileLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Load atau inisialisasi profil dari tabel Supabase `bio_profiles`
  const loadUserProfile = async (
    uid: string,
    email: string,
    fallbackUsername?: string,
    isNewAccount = false
  ) => {
    isHydratingRef.current = true;
    try {
      const { data: profile, error } = await supabase
        .from('bio_profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) {
        console.error('Gagal memuat profil:', error.message);
        setAuthError(`Gagal memuat profil: ${error.message}`);
        return;
      }

      if (profile) {
        setData({
          accountEmail: email,
          username: profile.username,
          displayName: profile.display_name || profile.username,
          bio: profile.bio || '',
          avatarUrl: profile.avatar_url || INITIAL_STATE.avatarUrl,
          bannerColor: profile.banner_color || '#0EA5E9',
          headerLayout: (profile.header_layout as HeaderLayoutType) || 'classic',
          titleColor: profile.title_color || '#0F172A',
          wallpaperColor: profile.wallpaper_color || '#FFFFFF',
          buttonColor: profile.button_color || '#0EA5E9',
          buttonTextColor: profile.button_text_color || '#FFFFFF',
          buttonVariant: (profile.button_variant as ButtonVariant) || 'solid',
          fontFamily: (profile.font_family as FontChoice) || 'DM Sans',
          showFooterBadge: profile.show_footer_badge ?? true,
          socials: profile.socials || INITIAL_STATE.socials,
          links: Array.isArray(profile.links) ? profile.links : [],
        });
        setStep(isNewAccount ? 'step-links' : 'dashboard');
      } else {
        const cleanUsername = (fallbackUsername || email.split('@')[0] || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9._]/g, '');

        const newProfile: BioPageState = {
          ...INITIAL_STATE,
          accountEmail: email,
          username: cleanUsername || `user${Date.now().toString().slice(-4)}`,
          displayName: cleanUsername || 'User Baru',
          links: [],
        };

        const { error: insertError } = await supabase.from('bio_profiles').insert({
          id: uid,
          username: newProfile.username,
          display_name: newProfile.displayName,
          bio: newProfile.bio,
          avatar_url: newProfile.avatarUrl,
          banner_color: newProfile.bannerColor,
          header_layout: newProfile.headerLayout,
          title_color: newProfile.titleColor,
          wallpaper_color: newProfile.wallpaperColor,
          button_color: newProfile.buttonColor,
          button_text_color: newProfile.buttonTextColor,
          button_variant: newProfile.buttonVariant,
          font_family: newProfile.fontFamily,
          show_footer_badge: newProfile.showFooterBadge,
          socials: newProfile.socials,
          links: newProfile.links,
        });

        if (insertError) {
          console.error('Gagal membuat profil awal:', insertError.message);
          setAuthError(`Gagal membuat profil: ${insertError.message}`);
          return;
        }

        setData(newProfile);
        setStep('step-links');
      }
    } finally {
      setTimeout(() => {
        isHydratingRef.current = false;
      }, 150);
    }
  };

  // Cek sesi login saat halaman dimuat
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUserId(session.user.id);
        await loadUserProfile(session.user.id, session.user.email || '');
      }
      if (mounted) setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
        await loadUserProfile(session.user.id, session.user.email || '');
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setData(INITIAL_STATE);
        setStep('login');
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Auto-sync perubahan data ke Supabase (debounce 600ms)
  useEffect(() => {
    if (!userId || step === 'login' || isHydratingRef.current) return;

    setSyncStatus('saving');
    const timeout = setTimeout(async () => {
      const { error } = await supabase
        .from('bio_profiles')
        .update({
          username: data.username,
          display_name: data.displayName,
          bio: data.bio,
          avatar_url: data.avatarUrl,
          banner_color: data.bannerColor,
          header_layout: data.headerLayout,
          title_color: data.titleColor,
          wallpaper_color: data.wallpaperColor,
          button_color: data.buttonColor,
          button_text_color: data.buttonTextColor,
          button_variant: data.buttonVariant,
          font_family: data.fontFamily,
          show_footer_badge: data.showFooterBadge,
          socials: data.socials,
          links: data.links,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (!error) {
        setSyncStatus('saved');
      } else {
        console.error('Gagal sync ke Supabase:', error.message);
        setSyncStatus('idle');
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [data, userId, step]);

  // Automatic transition timer for Step 5 ("Looking good. Let's keep building...")
  useEffect(() => {
    if (step === 'transition') {
      const timer = setTimeout(() => {
        setStep('dashboard');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const updateDataWithHistory = (updater: (prev: BioPageState) => BioPageState) => {
    setData((prev) => {
      setHistory((h) => [...h.slice(-15), prev]);
      setRedoStack([]);
      return updater(prev);
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((r) => [data, ...r]);
    setHistory((h) => h.slice(0, -1));
    setData(previous);
    showToast('Perubahan dibatalkan');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((h) => [...h, data]);
    setRedoStack((r) => r.slice(1));
    setData(next);
    showToast('Perubahan dikembalikan');
  };

  const handleCopyShareUrl = () => {
    const shareLink = getPublicProfileUrl(data.username || 'soryn');
    navigator.clipboard?.writeText(shareLink);
    setCopied(true);
    showToast(`Link disalin: ${shareLink}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateDataWithHistory((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        showToast('Foto profil diperbarui');
      }
    };
    reader.readAsDataURL(file);
  };

  // --- STEP 0: LOGIN & REGISTER SUPABASE ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      if (authMode === 'register') {
        const cleanUser = loginUsername.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
        if (!cleanUser) {
          setAuthError('Username wajib diisi (huruf kecil, angka, titik, atau underscore).');
          setAuthSubmitting(false);
          return;
        }

        // Cek apakah username sudah dipakai
        const { data: usernameAvailable, error: usernameCheckError } = await supabase.rpc(
          'check_username_available',
          { p_username: cleanUser }
        );

        if (usernameCheckError) {
          setAuthError(`Gagal memeriksa username: ${usernameCheckError.message}`);
          setAuthSubmitting(false);
          return;
        }

        if (!usernameAvailable) {
          setAuthError(`Username "@${cleanUser}" sudah digunakan. Coba username lain.`);
          setAuthSubmitting(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: loginEmail.trim(),
          password: loginPassword,
          options: {
            emailRedirectTo: APP_URL,
          },
        });

        if (signUpError) {
          setAuthError(signUpError.message);
          setAuthSubmitting(false);
          return;
        }

        if (signUpData.user && signUpData.session) {
          setUserId(signUpData.user.id);
          await loadUserProfile(signUpData.user.id, loginEmail.trim(), cleanUser, true);
          showToast('Akun berhasil dibuat!');
        } else {
          setAuthError('Pendaftaran berhasil! Cek inbox email kamu untuk konfirmasi, lalu masuk.');
          setAuthMode('login');
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword,
        });

        if (signInError) {
          setAuthError(
            signInError.message === 'Invalid login credentials'
              ? 'Email atau kata sandi salah.'
              : signInError.message
          );
          setAuthSubmitting(false);
          return;
        }

        if (signInData.user) {
          setUserId(signInData.user.id);
          await loadUserProfile(signInData.user.id, signInData.user.email || loginEmail.trim());
          showToast('Berhasil masuk!');
        }
      }
    } catch {
      setAuthError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthSubmitting(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: APP_URL,
      },
    });

    if (error) {
      setAuthError(`Gagal login dengan Google: ${error.message}`);
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setData(INITIAL_STATE);
    setHistory([]);
    setRedoStack([]);
    setStep('login');
    showToast('Berhasil keluar dari akun');
  };

  // --- STEP 1: ONBOARDING ADD LINK ---
  const handleOnboardingAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickUrl.trim()) return;
    const formatted =
      quickUrl.startsWith('http://') || quickUrl.startsWith('https://')
        ? quickUrl.trim()
        : `https://${quickUrl.trim()}`;
    const newItem: LinkItem = {
      id: `link-${Date.now()}`,
      title: quickTitle.trim(),
      url: formatted,
      active: true,
      clicks: 0,
    };
    setData((prev) => ({ ...prev, links: [newItem, ...prev.links] }));
    setQuickTitle('');
    setQuickUrl('');
    showToast('Link ditambahkan');
  };

  // --- DASHBOARD ADD / EDIT LINK ---
  const openCreateModal = () => {
    setEditingLink(null);
    setModalTitle('');
    setModalUrl('');
    setShowAddLinkModal(true);
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setModalTitle(link.title);
    setModalUrl(link.url);
    setShowAddLinkModal(true);
  };

  const handleSaveModalLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalUrl.trim()) return;
    const formatted =
      modalUrl.startsWith('http://') || modalUrl.startsWith('https://')
        ? modalUrl.trim()
        : `https://${modalUrl.trim()}`;

    if (editingLink) {
      updateDataWithHistory((prev) => ({
        ...prev,
        links: prev.links.map((l) =>
          l.id === editingLink.id ? { ...l, title: modalTitle.trim(), url: formatted } : l
        ),
      }));
      showToast('Link diperbarui');
    } else {
      updateDataWithHistory((prev) => ({
        ...prev,
        links: [
          {
            id: `link-${Date.now()}`,
            title: modalTitle.trim(),
            url: formatted,
            active: true,
            clicks: 0,
          },
          ...prev.links,
        ],
      }));
      showToast('Link baru ditambahkan');
    }
    setShowAddLinkModal(false);
  };

  const handleIncrementClick = (id: string) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === id ? { ...l, clicks: l.clicks + 1 } : l)),
    }));
  };

  // ============================================================================
  // RENDER 0A: PUBLIC BIO PAGE (/username) - Soryn Dark Aesthetic
  // ============================================================================
  if (PUBLIC_USERNAME) {
    if (publicProfileLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      );
    }

    if (publicProfileError || !publicProfile) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 text-center bg-black">
          <div>
            <h1 className="text-xl font-bold text-white">Página no encontrada</h1>
            <p className="text-sm text-zinc-500 mt-2">{publicProfileError || 'Este perfil no está disponible.'}</p>
          </div>
        </div>
      );
    }

    return <SorynPublicProfile data={publicProfile} />;
  }

  // ============================================================================
  // RENDER 0: SESSION LOADING SCREEN
  // ============================================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center gap-3">
        <BrandMark size="lg" />
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
          <span>Memeriksa sesi akun...</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 1: HALAMAN LOGIN & REGISTER AKUN (SUPABASE AUTH + GOOGLE OAUTH)
  // ============================================================================
  if (step === 'login') {
    return (
      <AuthTemplate
        mode={authMode}
        email={loginEmail}
        password={loginPassword}
        username={loginUsername}
        error={authError}
        submitting={authSubmitting}
        onModeChange={(mode) => {
          setAuthMode(mode);
          setAuthError(null);
        }}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onUsernameChange={setLoginUsername}
        onSubmit={handleLoginSubmit}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }


  // ============================================================================
  // RENDER 2: LANGKAH 1 ONBOARDING - MASUKKAN LINK & SOSIAL MEDIA
  // ============================================================================
  if (step === 'step-links') {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col">
        <header className="px-6 py-5 flex items-center justify-between max-w-4xl w-full mx-auto">
          <button
            type="button"
            onClick={() => setStep('dashboard')}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Lewati ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Progress Bar 33% */}
          <div className="w-48 sm:w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-sky-500 rounded-full transition-all duration-300" />
          </div>

          <BrandMark muted />
        </header>

        <main className="flex-1 max-w-lg w-full mx-auto px-5 py-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Masukkan link Anda
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Tambahkan tautan utama dan akun sosial media yang ingin ditampilkan.
              </p>
            </div>

            {/* Quick Social Media Handles */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-700 block">
                Ikon Sosial Media Cepat
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
                  { key: 'tiktok', label: 'TikTok', icon: Music2, placeholder: 'https://tiktok.com/@...' },
                  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@...' },
                  { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://soryn.my.id' },
                ].map((soc) => {
                  const Icon = soc.icon;
                  return (
                    <div
                      key={soc.key}
                      className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-sky-500"
                    >
                      <Icon className="w-4 h-4 text-sky-500 shrink-0" />
                      <input
                        type="text"
                        placeholder={soc.placeholder}
                        value={data.socials[soc.key as keyof SocialChannels]}
                        onChange={(e) =>
                          setData({
                            ...data,
                            socials: { ...data.socials, [soc.key]: e.target.value },
                          })
                        }
                        className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Add Custom Link */}
            <form
              onSubmit={handleOnboardingAddLink}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
            >
              <span className="text-xs font-semibold text-slate-700 block">
                Tambah Tautan Utama
              </span>
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Judul Link (misal: Portfolio Website)"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://soryn.my.id"
                    value={quickUrl}
                    onChange={(e) => setQuickUrl(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </form>

            {/* Added Links List */}
            <div className="space-y-2">
              {data.links.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                    <p className="text-xs text-slate-400 truncate">{item.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        links: prev.links.filter((l) => l.id !== item.id),
                      }))
                    }
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 pb-4">
            <button
              type="button"
              onClick={() => setStep('step-profile')}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-3.5 rounded-full transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================================
  // RENDER 3: LANGKAH 2 ONBOARDING - ATUR PROFILE & BANNER ("Add profile details")
  // ============================================================================
  if (step === 'step-profile') {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col">
        <header className="px-6 py-5 flex items-center justify-between max-w-4xl w-full mx-auto">
          <button
            type="button"
            onClick={() => setStep('step-links')}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Progress Bar 66% */}
          <div className="w-48 sm:w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-sky-500 rounded-full transition-all duration-300" />
          </div>

          <BrandMark muted />
        </header>

        <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Add profile details
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Informasi ini akan tampil di bagian atas halaman bio Anda.
              </p>
            </div>

            {/* Avatar Uploader */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-sky-50">
                  <img
                    src={data.avatarUrl}
                    alt={data.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center border-2 border-white shadow-sm cursor-pointer"
                  title="Upload Foto Profil"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-2">
                Klik tanda + untuk ganti foto profil
              </span>
            </div>

            {/* Header & Banner Layout Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Gaya Header & Banner
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'classic', label: 'Classic' },
                    { id: 'banner', label: 'Banner' },
                    { id: 'hero', label: 'Hero' },
                  ] as { id: HeaderLayoutType; label: string }[]
                ).map((item) => {
                  const selected = data.headerLayout === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setData({ ...data, headerLayout: item.id })}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        selected
                          ? 'border-sky-500 bg-sky-50 text-sky-700 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-full h-10 rounded-lg bg-slate-100 mb-2 overflow-hidden flex flex-col items-center justify-center relative">
                        {item.id === 'banner' && (
                          <div
                            style={{ backgroundColor: data.bannerColor }}
                            className="w-full h-4 absolute top-0"
                          />
                        )}
                        {item.id === 'hero' ? (
                          <div className="w-full h-full bg-sky-500/20 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-sky-500" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-sky-500 relative z-10 mt-1" />
                        )}
                      </div>
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {data.headerLayout === 'banner' && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Warna Banner:</span>
                  <div className="flex items-center gap-2">
                    {['#0EA5E9', '#0284C7', '#0F172A', '#434B72', '#38BDF8'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setData({ ...data, bannerColor: hex })}
                        style={{ backgroundColor: hex }}
                        className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                          data.bannerColor === hex ? 'border-slate-900 scale-110' : 'border-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Display Name & Bio Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display name
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={data.displayName}
                  onChange={(e) => setData({ ...data, displayName: e.target.value })}
                  placeholder="Soryn"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={3}
                  maxLength={160}
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                  placeholder="Ceritakan singkat tentang apa yang Anda lakukan"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 resize-none"
                />
                <div className="text-right text-[11px] text-slate-400 mt-1">
                  {data.bio.length}/160
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 pb-4">
            <button
              type="button"
              onClick={() => setStep('step-color')}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-3.5 rounded-full transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================================
  // RENDER 4: LANGKAH 3 ONBOARDING - PERSONALISASI WARNA ("Let's apply some color")
  // ============================================================================
  if (step === 'step-color') {
    return (
      <div
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1.25px, transparent 1.25px)',
          backgroundSize: '20px 20px',
        }}
        className="min-h-screen bg-white text-slate-900 flex flex-col justify-between overflow-hidden"
      >
        <header className="px-6 py-5 flex items-center justify-between max-w-4xl w-full mx-auto">
          <button
            type="button"
            onClick={() => setStep('step-profile')}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Progress Bar 100% */}
          <div className="w-48 sm:w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-sky-500 rounded-full transition-all duration-300" />
          </div>

          <BrandMark />
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-2">
          <LivePhoneMockup data={data} compact skeletonMode />
        </div>

        <div className="bg-white border-t border-slate-200 rounded-t-[32px] shadow-[0_-8px_30px_rgba(15,23,42,0.06)] px-6 pt-6 pb-8">
          <div className="max-w-md mx-auto space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900">Let&apos;s apply some color</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih warna solid untuk latar wallpaper dan tombol link Anda
              </p>
            </div>

            <div className="bg-slate-100 p-1 rounded-full grid grid-cols-2">
              <button
                type="button"
                onClick={() => setColorOnboardingTab('wallpaper')}
                className={`py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  colorOnboardingTab === 'wallpaper'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Wallpaper
              </button>
              <button
                type="button"
                onClick={() => setColorOnboardingTab('buttons')}
                className={`py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  colorOnboardingTab === 'buttons'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Buttons
              </button>
            </div>

            {colorOnboardingTab === 'wallpaper' ? (
              <div className="grid grid-cols-5 gap-3 justify-items-center py-1">
                {WALLPAPER_SWATCHES.map((swatch) => {
                  const isSelected = data.wallpaperColor.toUpperCase() === swatch.hex;
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setData({ ...data, wallpaperColor: swatch.hex })}
                      title={swatch.name}
                      style={{ backgroundColor: swatch.hex }}
                      className={`w-11 h-11 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-sky-500 scale-105 border-slate-300'
                          : 'border-slate-300 hover:scale-105'
                      }`}
                    >
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 ${
                            swatch.darkText ? 'text-slate-900' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
                <label
                  title="Warna Kustom"
                  className="w-11 h-11 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer relative overflow-hidden"
                >
                  <Palette className="w-4 h-4" />
                  <input
                    type="color"
                    value={data.wallpaperColor}
                    onChange={(e) => setData({ ...data, wallpaperColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-3 justify-items-center py-1">
                {BUTTON_SWATCHES.map((swatch) => {
                  const isSelected = data.buttonColor.toUpperCase() === swatch.bg;
                  return (
                    <button
                      key={swatch.bg}
                      type="button"
                      onClick={() =>
                        setData({
                          ...data,
                          buttonColor: swatch.bg,
                          buttonTextColor: swatch.text,
                        })
                      }
                      title={swatch.name}
                      style={{ backgroundColor: swatch.bg }}
                      className={`w-11 h-11 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-sky-500 scale-105 border-slate-300'
                          : 'border-slate-300 hover:scale-105'
                      }`}
                    >
                      {isSelected && (
                        <Check style={{ color: swatch.text }} className="w-4 h-4" />
                      )}
                    </button>
                  );
                })}
                <label
                  title="Warna Tombol Kustom"
                  className="w-11 h-11 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer relative overflow-hidden"
                >
                  <Palette className="w-4 h-4" />
                  <input
                    type="color"
                    value={data.buttonColor}
                    onChange={(e) =>
                      setData({
                        ...data,
                        buttonColor: e.target.value,
                        buttonTextColor: isColorLight(e.target.value) ? '#0F172A' : '#FFFFFF',
                      })
                    }
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep('transition')}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-3.5 rounded-full transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 5: TRANSISI "Looking good. Let's keep building..."
  // ============================================================================
  if (step === 'transition') {
    const lightCanvas = isColorLight(data.wallpaperColor);
    return (
      <div
        style={{ backgroundColor: data.wallpaperColor }}
        className="min-h-screen flex flex-col items-center justify-between px-4 py-10 transition-colors duration-300"
      >
        <div className="text-center space-y-3">
          <BrandMark />
          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-tight leading-tight ${
              lightCanvas ? 'text-slate-900' : 'text-white'
            }`}
          >
            Looking good.
            <br />
            Let&apos;s keep building...
          </h1>
        </div>

        <div className="my-auto py-4">
          <LivePhoneMockup data={data} compact skeletonMode tilted3D />
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 6: DASHBOARD UTAMA
  // ============================================================================
  const totalClicks = data.links.reduce((sum, item) => sum + item.clicks, 0);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 flex flex-col">
      {/* TOAST NOTIFICATION */}
      {toast && <ToastNotification message={toast} />}

      {/* TOP BAR */}
      <header className="sticky top-0 z-30 bg-[#F3F4F6]/95 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left Hamburger / Stats */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAccountMenu((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Menu Navigasi"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-full">
            <StatusDot className="w-1.5 h-1.5 bg-sky-500" />
            {totalClicks} total klik
          </span>
          {syncStatus === 'saving' && (
            <span className="hidden md:inline-block text-[11px] text-slate-400">
              Menyimpan...
            </span>
          )}
          {syncStatus === 'saved' && (
            <span className="hidden md:inline-block text-[11px] text-emerald-600">
              Tersimpan di cloud
            </span>
          )}
        </div>

        {/* Center Account Dropdown Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAccountMenu((prev) => !prev)}
            className="flex items-center gap-2.5 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
          >
            <img
              src={data.avatarUrl}
              alt={data.displayName}
              className="w-6 h-6 rounded-full object-cover bg-sky-100"
            />
            <span className="max-w-[160px] sm:max-w-[220px] truncate">{data.displayName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showAccountMenu && (
            <div
              onMouseLeave={() => setShowAccountMenu(false)}
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 z-40 space-y-1"
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{data.displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {data.accountEmail || `biolink.id/${data.username}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  setStep('step-links');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Ulangi Alur Onboarding
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar Akun
              </button>
            </div>
          )}
        </div>

        {/* Right Share / Copy Link Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyShareUrl}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-800 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-sky-500" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-sky-500" />
            )}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* MOBILE EDITOR / PREVIEW SWITCHER */}
      <div className="lg:hidden px-4 pb-3">
        <div className="bg-white border border-slate-200 rounded-full p-1 grid grid-cols-2">
          <button
            type="button"
            onClick={() => setMobileDashMode('editor')}
            className={`py-2 rounded-full text-xs font-semibold transition-colors ${
              mobileDashMode === 'editor' ? 'bg-sky-500 text-white' : 'text-slate-600'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileDashMode('preview')}
            className={`py-2 rounded-full text-xs font-semibold transition-colors ${
              mobileDashMode === 'preview' ? 'bg-sky-500 text-white' : 'text-slate-600'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto px-3 sm:px-6 pb-8 gap-4 lg:gap-6">
        {/* LEFT VERTICAL ICON RAIL */}
        <aside
          className={`lg:w-16 flex lg:flex-col items-center justify-center lg:justify-start lg:pt-28 gap-4 ${
            mobileDashMode === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {(
            [
              { id: 'content', label: 'Content', icon: LayoutGrid },
              { id: 'header', label: 'Header', icon: UserSquare2 },
              { id: 'design', label: 'Design', icon: Paintbrush },
            ] as { id: DashboardTab; label: string; icon: React.FC<{ className?: string }> }[]
          ).map((nav) => {
            const Icon = nav.icon;
            const active = dashboardTab === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setDashboardTab(nav.id)}
                className="group flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    active
                      ? 'bg-sky-500 text-white ring-4 ring-sky-100'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    active ? 'text-sky-600' : 'text-slate-500'
                  }`}
                >
                  {nav.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* CENTER-LEFT WHITE ROUNDED EDITOR CARD */}
        <section
          className={`flex-1 max-w-2xl w-full mx-auto lg:mx-0 bg-white border border-slate-200/90 rounded-[32px] p-5 sm:p-8 shadow-2xs ${
            mobileDashMode === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* TAB A: CONTENT */}
          {dashboardTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Content</h2>
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-sky-500" />
                  QR Code
                </button>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={data.avatarUrl}
                  alt={data.displayName}
                  className="w-16 h-16 rounded-full object-cover border border-slate-200 bg-sky-50 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900 truncate">
                    {data.displayName}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {[
                      { icon: Instagram, label: 'Instagram' },
                      { icon: Music2, label: 'TikTok' },
                      { icon: MessageCircle, label: 'WhatsApp' },
                      { icon: Mail, label: 'Email' },
                    ].map((s, idx) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDashboardTab('header')}
                          title={`Atur ${s.label}`}
                          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 hover:border-sky-400 hover:text-sky-600 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setDashboardTab('header')}
                      className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit Sosial Media"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 flex items-center gap-6">
                <span className="pb-2.5 border-b-2 border-sky-500 text-sm font-semibold text-slate-900">
                  Links ({data.links.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStep('step-links')}
                  className="py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4 text-slate-600" />
                  Quick Setup Links
                </button>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="py-3 px-4 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {data.links.map((link) => (
                  <div
                    key={link.id}
                    className={`bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 transition-opacity ${
                      link.active ? 'opacity-100' : 'opacity-55 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {link.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {link.clicks} clicks • {link.url.replace(/^https?:\/\//, '')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            links: prev.links.map((l) =>
                              l.id === link.id ? { ...l, active: !l.active } : l
                            ),
                          }))
                        }
                        aria-label="Aktifkan/Nonaktifkan Link"
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          link.active ? 'bg-sky-500' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            link.active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(link)}
                        className="p-2 rounded-full text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            links: prev.links.filter((l) => l.id !== link.id),
                          }))
                        }
                        className="p-2 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {data.links.length === 0 && (
                  <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center text-xs text-slate-500">
                    Belum ada link. Klik tombol <strong>+ Add</strong> di atas untuk menambahkan.
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Soryn footer badge
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 inline-flex items-center gap-1">
                    biolink <span className="text-sky-500">*</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateDataWithHistory((prev) => ({
                      ...prev,
                      showFooterBadge: !prev.showFooterBadge,
                    }))
                  }
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    data.showFooterBadge ? 'bg-sky-500' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      data.showFooterBadge ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB B: HEADER */}
          {dashboardTab === 'header' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Header</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Pengaturan Header tersimpan')}
                    className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2.5">
                  Layout
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { id: 'classic', label: 'Classic' },
                      { id: 'hero', label: 'Hero' },
                      { id: 'banner', label: 'Banner' },
                    ] as { id: HeaderLayoutType; label: string }[]
                  ).map((layout) => {
                    const selected = data.headerLayout === layout.id;
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({ ...prev, headerLayout: layout.id }))
                        }
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          selected
                            ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/40'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-14 rounded-xl bg-slate-100 mb-2.5 overflow-hidden flex items-center justify-center relative">
                          {layout.id === 'banner' && (
                            <div
                              style={{ backgroundColor: data.bannerColor }}
                              className="w-full h-5 absolute top-0"
                            />
                          )}
                          {layout.id === 'hero' ? (
                            <img
                              src={data.avatarUrl}
                              alt="Hero preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={data.avatarUrl}
                              alt="Avatar preview"
                              className="w-8 h-8 rounded-full object-cover border-2 border-white relative z-10 mt-1"
                            />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-800">
                          {layout.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {data.headerLayout === 'banner' && (
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Warna Banner Header
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pilih warna solid untuk banner atas profil
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {['#0EA5E9', '#0284C7', '#38BDF8', '#0F172A', '#434B72'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({ ...prev, bannerColor: hex }))
                        }
                        style={{ backgroundColor: hex }}
                        className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                          data.bannerColor === hex ? 'border-slate-900 scale-110' : 'border-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Profile image
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Unggah foto profil baru
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 hover:border-sky-400 hover:text-sky-600 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                  <div className="relative">
                    <img
                      src={data.avatarUrl}
                      alt={data.displayName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                <label className="text-xs font-semibold text-slate-700 pt-3">Title</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    maxLength={30}
                    value={data.displayName}
                    onChange={(e) =>
                      updateDataWithHistory((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    {data.displayName.length}/30
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                <label className="text-xs font-semibold text-slate-700 pt-3">Bio</label>
                <div className="sm:col-span-2">
                  <textarea
                    rows={3}
                    maxLength={160}
                    value={data.bio}
                    onChange={(e) =>
                      updateDataWithHistory((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Add a short bio"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 resize-none"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    {data.bio.length}/160
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Title color</span>
                <label className="inline-flex items-center gap-2.5 border border-slate-200 rounded-2xl px-3.5 py-2 cursor-pointer hover:border-sky-400">
                  <span
                    style={{ backgroundColor: data.titleColor }}
                    className="w-5 h-5 rounded-md border border-slate-300"
                  />
                  <span className="text-xs font-mono text-slate-700 uppercase">
                    {data.titleColor}
                  </span>
                  <input
                    type="color"
                    value={data.titleColor}
                    onChange={(e) =>
                      updateDataWithHistory((prev) => ({ ...prev, titleColor: e.target.value }))
                    }
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB C: DESIGN */}
          {dashboardTab === 'design' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Design</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Desain berhasil disimpan')}
                    className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-500 block">Customize</span>

                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: data.wallpaperColor }}
                        className="w-10 h-10 rounded-xl border border-slate-300"
                      />
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">
                          Wallpaper
                        </span>
                        <span className="text-xs text-slate-400">Solid Fill</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-500 uppercase">
                      {data.wallpaperColor}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {WALLPAPER_SWATCHES.map((sw) => (
                      <button
                        key={sw.hex}
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({ ...prev, wallpaperColor: sw.hex }))
                        }
                        style={{ backgroundColor: sw.hex }}
                        title={sw.name}
                        className={`w-7 h-7 rounded-full border cursor-pointer transition-transform ${
                          data.wallpaperColor.toUpperCase() === sw.hex
                            ? 'ring-2 ring-offset-2 ring-sky-500 scale-105 border-slate-400'
                            : 'border-slate-300 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: data.buttonColor }}
                        className="w-10 h-10 rounded-xl border border-slate-200"
                      />
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">Buttons</span>
                        <span className="text-xs text-slate-400 capitalize">
                          {data.buttonVariant}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
                      {(['solid', 'outline', 'soft'] as ButtonVariant[]).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() =>
                            updateDataWithHistory((prev) => ({ ...prev, buttonVariant: v }))
                          }
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize cursor-pointer ${
                            data.buttonVariant === v
                              ? 'bg-white text-sky-600 shadow-2xs'
                              : 'text-slate-600'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {BUTTON_SWATCHES.map((sw) => (
                      <button
                        key={sw.bg}
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            buttonColor: sw.bg,
                            buttonTextColor: sw.text,
                          }))
                        }
                        style={{ backgroundColor: sw.bg }}
                        title={sw.name}
                        className={`w-7 h-7 rounded-full border cursor-pointer transition-transform ${
                          data.buttonColor.toUpperCase() === sw.bg
                            ? 'ring-2 ring-offset-2 ring-sky-500 scale-105 border-slate-400'
                            : 'border-slate-300 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center">
                      Aa
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900 block">Text</span>
                      <span className="text-xs text-slate-400">Page Typography</span>
                    </div>
                  </div>

                  <select
                    value={data.fontFamily}
                    onChange={(e) =>
                      updateDataWithHistory((prev) => ({
                        ...prev,
                        fontFamily: e.target.value as FontChoice,
                      }))
                    }
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    <option value="DM Sans">DM Sans</option>
                    <option value="Inter">Inter</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT SIDE: LIVE PHONE PREVIEW */}
        <section
          className={`flex-1 flex items-center justify-center py-4 lg:py-0 ${
            mobileDashMode === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="lg:sticky lg:top-20 flex items-center gap-3">
            <LivePhoneMockup
              data={data}
              onLinkClick={handleIncrementClick}
              onCopyShare={handleCopyShareUrl}
            />

            <div className="hidden sm:flex flex-col gap-2 bg-white border border-slate-200 p-1.5 rounded-full shadow-2xs">
              <button
                type="button"
                onClick={handleCopyShareUrl}
                title="Salin Link Publik"
                className="w-9 h-9 rounded-full hover:bg-sky-50 text-slate-600 hover:text-sky-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                title="Buka QR & Share"
                className="w-9 h-9 rounded-full hover:bg-sky-50 text-slate-600 hover:text-sky-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ADD / EDIT LINK MODAL */}
      {showAddLinkModal && (
        <div
          onClick={() => setShowAddLinkModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/35 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingLink ? 'Edit Link' : 'Tambah Link Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLinkModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModalLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Judul Tombol Link
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Portfolio Website"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  URL Tujuan
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://soryn.my.id"
                  value={modalUrl}
                  onChange={(e) => setModalUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-3 rounded-full transition-colors cursor-pointer"
              >
                {editingLink ? 'Simpan Perubahan' : 'Tambahkan Link'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SHARE & QR MODAL */}
      {showShareModal && (
        <div
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/35 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-xl text-center space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Bagikan Halaman Bio</h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <SolidQRCode url={getPublicProfileUrl(data.username)} />
              <p className="font-bold text-sm text-slate-900 mt-3">{data.displayName}</p>
              <span className="text-xs font-medium text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full mt-1">
                biolink.id/{data.username}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyShareUrl}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs py-3 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Link Berhasil Disalin' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}