'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/lib/types';
import { getExpenses, getCurrency, formatAmount } from '@/lib/storage';
import ExpenseInput from './components/ExpenseInput';
import ExpenseList from './components/ExpenseList';
import ExpenseGraphs from './components/ExpenseGraphs';
import Settings from './components/Settings';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currency, setCurrencyState] = useState('INR');
  const [activeTab, setActiveTab] = useState<'list' | 'graphs'>('list');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setExpenses(getExpenses());
    setCurrencyState(getCurrency());
  }, []);

  const refreshExpenses = useCallback(() => {
    setExpenses(getExpenses());
    setCurrencyState(getCurrency());
  }, []);

  const handleExpenseAdded = useCallback((expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    setCurrencyState(getCurrency());
  }, []);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--muted)'
      }}>
        ...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100dvh', 
      background: 'var(--bg)',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)'
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 700, 
              margin: 0,
              letterSpacing: '-0.02em',
              color: 'var(--accent)'
            }}>
              Roti
            </h1>
            {expenses.length > 0 && (
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                {formatAmount(total, currency)}
              </span>
            )}
          </div>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: 'var(--muted)', 
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            log & go. zero fluff.
          </p>
        </header>

        {/* Input */}
        <div style={{ marginBottom: '24px' }}>
          <ExpenseInput onExpenseAdded={handleExpenseAdded} />
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          marginBottom: '20px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => setActiveTab('list')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 0',
                fontSize: '13px',
                cursor: 'pointer',
                color: activeTab === 'list' ? 'var(--fg)' : 'var(--muted)',
                textDecoration: activeTab === 'list' ? 'underline' : 'none',
                textUnderlineOffset: '4px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              entries ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('graphs')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 0',
                fontSize: '13px',
                cursor: 'pointer',
                color: activeTab === 'graphs' ? 'var(--fg)' : 'var(--muted)',
                textDecoration: activeTab === 'graphs' ? 'underline' : 'none',
                textUnderlineOffset: '4px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              analytics
            </button>
          </div>
          {activeTab === 'list' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['day', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    background: timeRange === range ? 'var(--accent)' : 'none',
                    border: timeRange === range ? 'none' : '1px solid var(--border)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: timeRange === range ? 'var(--bg)' : 'var(--muted)',
                    fontFamily: 'inherit',
                    textTransform: 'uppercase'
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <main>
          {activeTab === 'list' ? (
            <ExpenseList 
              expenses={expenses} 
              currency={currency}
              onExpensesChange={refreshExpenses}
              timeRange={timeRange}
            />
          ) : (
            <ExpenseGraphs 
              expenses={expenses} 
              currency={currency}
            />
          )}
        </main>

        {/* Settings */}
        <Settings onDataReset={refreshExpenses} />

      </div>
    </div>
  );
}
