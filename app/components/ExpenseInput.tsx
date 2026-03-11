'use client';

import { useState, useCallback, useEffect } from 'react';
import { Expense, CURRENCIES } from '@/lib/types';
import { parseInput, saveExpense, getCurrency, getCurrencySymbol, setCurrency } from '@/lib/storage';

interface ExpenseInputProps {
  onExpenseAdded: (expense: Expense) => void;
}

export default function ExpenseInput({ onExpenseAdded }: ExpenseInputProps) {
  const [input, setInput] = useState('');
  const [currency, setCurrencyState] = useState('INR');
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  useEffect(() => {
    setCurrencyState(getCurrency());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showInfoTooltip) {
        setShowInfoTooltip(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showInfoTooltip]);

  const MAX_INPUT_LENGTH = 50;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if there are validation errors
    if (validationError) return;
    
    const parsed = parseInput(input);
    if (parsed.amount === null && !parsed.note) return;

    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: parsed.amount || 0,
      note: parsed.note || (parsed.amount ? 'Cash' : ''),
      tags: parsed.tags,
      timestamp: Date.now(),
      currency,
    };

    saveExpense(expense);
    onExpenseAdded(expense);
    setInput('');
    setValidationError('');
  }, [input, currency, onExpenseAdded, validationError]);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    setCurrency(newCurrency);
    setShowCurrencySheet(false);
  };

  const symbol = getCurrencySymbol(currency);
  const parsed = parseInput(input);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setShowCurrencySheet(true)}
            style={{
              fontSize: '24px',
              color: 'var(--fg)',
              fontFamily: 'inherit',
              background: 'none',
              border: 'none',
              padding: '12px 8px',
              minHeight: '44px',
              minWidth: '44px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {symbol}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              const newValue = e.target.value;
              
              // Check input length
              if (newValue.length > MAX_INPUT_LENGTH) {
                setValidationError(`Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
                return; // Don't update input if it exceeds limit
              }
              
              setInput(newValue);
              
              // Real-time validation for amount
              if (newValue.trim()) {
                const parsed = parseInput(newValue);
                if (parsed.amount !== null && Math.abs(parsed.amount) > 999999) {
                  setValidationError('Amount exceeds maximum limit (999,999)');
                } else {
                  setValidationError('');
                }
              } else {
                setValidationError('');
              }
            }}
            placeholder="100 chai #food"
            enterKeyHint="done"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: validationError ? '2px solid var(--accent, #ff6b6b)' : '2px solid var(--border)',
              padding: '16px 0',
              fontSize: '22px',
              outline: 'none',
              fontFamily: 'inherit',
              color: 'var(--fg)',
              minHeight: '44px'
            }}
            autoFocus
          />
          {input.trim() && (
            <button
              type="submit"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px',
                lineHeight: 1
              }}
              aria-label="Add expense"
            >
              +
            </button>
          )}
          {!input.trim() && (
            <div style={{ position: 'relative', marginLeft: '8px' }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  minHeight: '28px',
                  minWidth: '28px',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--fg)';
                  setShowInfoTooltip(true);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted)';
                  setShowInfoTooltip(false);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setShowInfoTooltip(!showInfoTooltip);
                }}
                aria-label="Input help"
              >
                i
              </button>
              {showInfoTooltip && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '8px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    color: 'var(--fg)',
                    width: '200px',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Input Tips:</div>
                  <div>• Enter numbers without commas</div>
                  <div>• Max {MAX_INPUT_LENGTH} characters</div>
                  <div>• Max amount: 999,999</div>
                  <div>• Use # for tags (e.g., #food)</div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
      
      {/* Validation Error */}
      {validationError && (
        <div style={{
          color: '#ff6b6b',
          fontSize: '12px',
          marginTop: '8px',
          fontFamily: 'inherit'
        }}>
          {validationError}
        </div>
      )}
      
      {input && (parsed.tags.length > 0 || parsed.amount !== null) && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap',
          marginTop: '12px' 
        }}>
          {parsed.tags.map((tag) => (
            <span 
              key={tag}
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                textTransform: 'lowercase'
              }}
            >
              #{tag}
            </span>
          ))}
          {parsed.amount !== null && (
            <span style={{
              fontSize: '11px',
              color: 'var(--accent)'
            }}>
              {parsed.amount}
            </span>
          )}
        </div>
      )}

      {showCurrencySheet && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setShowCurrencySheet(false)}
        >
          <div 
            style={{
              background: 'var(--surface)',
              width: '100%',
              maxWidth: '480px',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ 
              fontSize: '14px', 
              fontWeight: 600,
              margin: '0 0 16px 0'
            }}>
              Select Currency
            </p>
            <div>
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleCurrencyChange(curr.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    color: currency === curr.code ? 'var(--fg)' : 'var(--muted)'
                  }}
                >
                  <span>{curr.symbol} {curr.name}</span>
                  {currency === curr.code && (
                    <span>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
