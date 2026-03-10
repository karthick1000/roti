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

  useEffect(() => {
    setCurrencyState(getCurrency());
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
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
  }, [input, currency, onExpenseAdded]);

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
            onChange={(e) => setInput(e.target.value)}
            placeholder="100 chai #food"
            enterKeyHint="done"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid var(--border)',
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
        </div>
      </form>
      
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
