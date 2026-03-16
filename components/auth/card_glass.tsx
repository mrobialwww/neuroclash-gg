"use client";

import React from "react";

type Props = {
  title?: React.ReactNode;
  children?: React.ReactNode;
  background?: string;
};

export default function AuthCard({ title, children, background = "/background/Daftar.png" }: Props) {
  return (
    <>
      <style>{`
        /* Use Baloo font provided by app/layout (CSS variable) */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .register-root { font-family: var(--font-baloo-2), system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #0a0a1a; background-position: center; background-repeat: no-repeat; background-size: cover; padding: 24px; }

        .glass-card { width: 100%; max-width: 440px; background: rgba(255,255,255,0.07); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; padding: 44px 40px 36px; box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15); display:flex; flex-direction:column; align-items:center; gap:0; }

        .logo-wrap { margin-bottom: 20px; display:flex; align-items:center; justify-content:center }
        .logo-placeholder { width:64px; height:64px; display:flex; align-items:center; justify-content:center }

        .card-title { font-size:22px; font-weight:700; color:#ffffff; margin-bottom:28px; letter-spacing:-0.3px; text-align:center }

        .form { width:100%; display:flex; flex-direction:column; gap:24px }
        .field { position:relative; width:100%; margin-bottom: 12px; }
        .field-label { position:absolute; top:-9px; left:12px; font-size:12px; font-weight:500; color:rgba(255,255,255,1); background:transparent; padding:0 4px }
        .field-input { width:100%; background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18); border-radius:10px; padding:14px 16px; font-size:14px; color:#ffffff; outline:none; appearance: none; }
        .field-input::placeholder { color: rgba(255,255,255,0.35) }
        .field-input:focus { border-color: rgba(100,140,255,0.6); background: rgba(255,255,255,0.11) }
        .field-input.has-icon { padding-right:48px }
        .field-icon { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.45) }

        /* Hide browser-native password UI chrome (reveal/clear/autofill buttons) */
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }

        input[type="password"]::-webkit-credentials-auto-fill-button {
          visibility: hidden;
          display: none !important;
          pointer-events: none;
        }

        /* Optional extra WebKit container removal */
        input[type="password"]::-webkit-textfield-decoration-container {
          display: none;
        }

        .btn-primary { width:100%; padding:14px; background: #256AF4; border:none; border-radius:10px; font-size:15px; font-weight:600; color:#fff; cursor:pointer; box-shadow: 0 4px 18px rgba(59,110,245,0.4) }
        .btn-google { width:100%; padding:13px; background: rgba(255,255,255,0.95); border:1px solid rgba(255,255,255,0.3); border-radius:10px; font-size:14px; font-weight:600; color:#1a1a2e; display:flex; align-items:center; justify-content:center; gap:10px }
        .google-icon { width:18px; height:18px }

        .login-link { margin-top:14px; font-size:13px; color:rgba(255,255,255,0.5); text-align:center }
        .login-link a, .login-link span.link { color: rgba(255,255,255,0.9); font-weight:600 }
        .terms { margin-top:20px; font-size:12px; color:rgba(255,255,255,0.35); text-align:center }

        /* Responsive tweaks */
        @media (max-width: 640px) {
          .register-root { padding: 18px; background-position: center top; }
          .glass-card { padding: 32px 20px 28px; max-width: 96%; border-radius: 16px; }
          .card-title { font-size: 20px; margin-bottom: 20px; }
          .field-input { padding: 12px 14px; font-size: 13px; }
        }

        @media (min-width: 1200px) {
          .register-root { background-position: center; }
        }
      `}</style>

      <div className="register-root" style={{ backgroundImage: `url('${background}')` }}>
        <div className="glass-card">
          <div className="logo-wrap">
            <div className="logo-placeholder">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 6L38.5 24H57L42.5 35L48.5 53L32 42L15.5 53L21.5 35L7 24H25.5L32 6Z" fill="white" fillOpacity="0.9" />
                <path d="M20 34 Q32 28 44 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
              </svg>
            </div>
          </div>

          {title ? <h1 className="card-title">{title}</h1> : null}

          {children}
        </div>
      </div>
    </>
  );
}
