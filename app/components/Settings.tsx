'use client';

import { useState } from 'react';
import { resetAllData, getDataSize } from '@/lib/storage';

interface SettingsProps {
  onDataReset?: () => void;
}

export default function Settings({ onDataReset }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dataSize = getDataSize();

  const handleResetClick = () => setShowConfirm(true);

  const handleConfirmReset = () => {
    resetAllData();
    setShowConfirm(false);
    setIsOpen(false);
    onDataReset?.();
  };

  const handleCancelReset = () => setShowConfirm(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          zIndex: 50
        }}
        aria-label="Settings"
      >
        ⚙
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setIsOpen(false)}
      >
        {/* Modal */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: '8px',
            maxWidth: '320px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 20px 0 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              Settings
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '4px',
                lineHeight: 1
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '20px' }}>
            {/* Version */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  marginBottom: '4px'
                }}
              >
                Version
              </label>
              <span style={{ fontSize: '14px', color: 'var(--fg)' }}>
                0.1 (beta)
              </span>
            </div>

            {/* Reset Data */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  marginBottom: '8px'
                }}
              >
                Data
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <button
                  onClick={handleResetClick}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Reset all data
                </button>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {dataSize}
                </span>
              </div>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  margin: '0'
                }}
              >
                This will permanently delete all your expenses.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center'
            }}
          >
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '11px',
                color: 'var(--muted)',
                fontStyle: 'italic'
              }}
            >
              Made with 🤍
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: 'var(--muted)',
                fontStyle: 'italic'
              }}
            >
              Chennai
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 101,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={handleCancelReset}
        >
          <div
            style={{
              background: 'var(--surface)',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '280px',
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                fontSize: '14px',
                margin: '0 0 8px 0',
                color: 'var(--fg)',
                fontWeight: 500
              }}
            >
              Reset all data?
            </p>
            <p
              style={{
                fontSize: '12px',
                margin: '0 0 24px 0',
                color: 'var(--muted)'
              }}
            >
              This will permanently delete all your expenses. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCancelReset}
                style={{
                  flex: 1,
                  background: 'none',
                  border: '1px solid var(--border)',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--muted)',
                  fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                style={{
                  flex: 1,
                  background: 'var(--accent)',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--bg)',
                  fontFamily: 'inherit'
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
