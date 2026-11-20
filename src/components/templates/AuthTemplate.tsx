import React from 'react';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { BrandHeader } from '../organisms/BrandHeader';

export type AuthMode = 'login' | 'register';

type AuthTemplateProps = {
  mode: AuthMode;
  email: string;
  password: string;
  username: string;
  error: string | null;
  submitting: boolean;
  onModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleLogin: () => void;
  onBackHome?: () => void;
};

const copy = {
  login: {
    title: 'Masuk ke akun Anda',
    description: 'Kelola semua tautan, profil, dan tampilan halaman bio dalam satu tempat.',
    submit: 'Masuk ke Dashboard',
    divider: 'Baru di sini?',
    switchButton: 'Buat Akun Baru',
    targetMode: 'register' as AuthMode,
  },
  register: {
    title: 'Buat akun BioLink',
    description: 'Daftarkan username unik Anda dan mulai bangun halaman bio.',
    submit: 'Daftar & Mulai Setup',
    divider: 'Sudah punya akun?',
    switchButton: 'Masuk ke Akun',
    targetMode: 'login' as AuthMode,
  },
} as const;

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.3 0 6.08-1.09 8.11-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.23 1.18-3.26 0-6.02-2.2-7-5.16H1.01v3.14C3.05 21.2 7.24 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5 14.01c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.15H1.01C.37 7.43 0 8.87 0 10.4s.37 2.97 1.01 4.25l3.99-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.8 0 3.41.62 4.68 1.83l3.5-3.5C18.07 1.19 15.3 0 12 0 7.24 0 3.05 2.8 1.01 6.85l3.99 3.14c.98-2.96 3.74-5.24 7-5.24Z"
    />
  </svg>
);

export const AuthTemplate: React.FC<AuthTemplateProps> = (props) => {
  const content = copy[props.mode];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white text-slate-900">
      {/* PANEL KIRI: Branding & Copywriting (Modern Minimalis) */}
      <aside className="lg:col-span-5 xl:col-span-4 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200/80 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Header / Logo */}
        <div className="relative z-10">
          <BrandHeader />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-12 lg:my-0 space-y-4 max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
            Satu tautan praktis untuk seluruh identitas digital Anda.
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            BioLink membantu menyatukan portofolio, media sosial, dan produk Anda dalam satu halaman bio yang cepat, bersih, dan mudah dikustomisasi.
          </p>
        </div>

        {/* Footer Copyright */}
        <div className="relative z-10 text-xs text-slate-400">

        </div>

        {/* Aksen Blur Halus di Latar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-sky-100/60 blur-3xl"
        />
      </aside>

      {/* PANEL KANAN: Form Autentikasi */}
      <div className="lg:col-span-7 xl:col-span-8 bg-white flex flex-col justify-between p-6 sm:p-10">
        {/* Top Navigation */}
        <div>
          <a
            href="/"
            onClick={(e) => {
              if (props.onBackHome) {
                e.preventDefault();
                props.onBackHome();
              }
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </a>
        </div>

        {/* Kartu Form Modern Minimalis */}
        <main className="w-full max-w-md mx-auto my-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            {/* Header Form */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {content.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                {content.description}
              </p>
            </div>

            {/* Alert Error */}
            {props.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{props.error}</span>
              </div>
            )}

            {/* Form Email & Password */}
            <form onSubmit={props.onSubmit} className="space-y-4">
              {props.mode === 'register' && (
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username Bio-Link
                  </span>
                  <span className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
                    <span className="text-sm text-slate-400 select-none">
                      biolink.id/
                    </span>
                    <input
                      type="text"
                      required
                      value={props.username}
                      onChange={(e) => props.onUsernameChange(e.target.value)}
                      placeholder="username"
                      className="w-full bg-transparent py-3 pl-1 text-sm font-medium text-slate-900 focus:outline-none"
                    />
                  </span>
                </label>
              )}

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Akun
                </span>
                <input
                  type="email"
                  required
                  value={props.email}
                  onChange={(e) => props.onEmailChange(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Sandi
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={props.password}
                  onChange={(e) => props.onPasswordChange(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </label>

              <button
                type="submit"
                disabled={props.submitting}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-full transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2 shadow-xs"
              >
                {props.submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{props.submitting ? 'Memproses...' : content.submit}</span>
              </button>
            </form>

            {/* Tombol Google */}
            <button
              type="button"
              onClick={props.onGoogleLogin}
              disabled={props.submitting}
              className="w-full bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-800 border border-slate-300 font-semibold text-sm py-3 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2.5"
            >
              <GoogleIcon />
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Divider Switch Mode */}
            <div className="relative flex items-center py-1">
              <div className="grow border-t border-slate-200" />
              <span className="shrink mx-3 text-[11px] font-medium text-slate-400">
                {content.divider}
              </span>
              <div className="grow border-t border-slate-200" />
            </div>

            {/* Tombol Pindah Login / Daftar */}
            <button
              type="button"
              onClick={() => props.onModeChange(content.targetMode)}
              disabled={props.submitting}
              className="w-full bg-slate-50 hover:bg-slate-100 disabled:opacity-60 text-slate-700 border border-slate-200 font-semibold text-sm py-3 rounded-full transition-colors cursor-pointer"
            >
              {content.switchButton}
            </button>

            {/* Footer Alur Setup */}
            <p className="pt-1 text-center text-[11px] text-slate-400">
              
            </p>
          </div>
        </main>

        {/* Spacer bawah agar kartu pas di tengah layar */}
        <div className="hidden lg:block h-4" />
      </div>
    </div>
  );
};