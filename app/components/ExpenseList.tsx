'use client';

import { useState } from 'react';
import { Expense } from '@/lib/types';
import { deleteExpense, updateExpense, formatAmount } from '@/lib/storage';

interface ExpenseListProps {
  expenses: Expense[];
  currency: string;
  onExpensesChange: () => void;
  timeRange?: 'day' | 'week' | 'month';
}

export default function ExpenseList({ expenses, currency, onExpensesChange, timeRange = 'week' }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filterExpenses = (expenses: Expense[], range: typeof timeRange) => {
    if (range === 'day') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expenses.filter(expense => new Date(expense.timestamp) >= today);
    }
    if (range === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return expenses.filter(expense => new Date(expense.timestamp) >= weekAgo);
    }
    if (range === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return expenses.filter(expense => new Date(expense.timestamp) >= monthAgo);
    }
    return expenses;
  };

  const filteredExpenses = filterExpenses(expenses, timeRange);
  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteExpense(deleteId);
      onExpensesChange();
      setDeleteId(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    const tagStr = expense.tags.map(t => `#${t}`).join(' ');
    setEditValue(`${expense.amount} ${expense.note} ${tagStr}`.trim());
  };

  const saveEdit = (id: string) => {
    const parts = editValue.split(' ');
    const amount = parseFloat(parts[0]) || 0;
    const tags: string[] = [];
    let noteParts: string[] = [];

    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith('#')) {
        tags.push(parts[i].slice(1).toLowerCase());
      } else {
        noteParts.push(parts[i]);
      }
    }

    const updated: Expense = {
      ...expenses.find(e => e.id === id)!,
      amount,
      note: noteParts.join(' ') || 'Cash',
      tags,
    };

    updateExpense(updated);
    setEditingId(null);
    onExpensesChange();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
        <p style={{ fontSize: '14px', margin: 0 }}>No expenses yet</p>
        <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Type above to add your first entry</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border)'
      }}>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {filteredExpenses.length} entries
        </span>
        {filteredExpenses.length > 0 && (
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            total: {formatAmount(total, currency)}
          </span>
        )}
      </div>

      {filteredExpenses.map((expense, index) => (
        <div 
          key={expense.id}
          className={index === 0 ? 'slide-in' : ''}
          style={{
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border)'
          }}
        >
          {editingId === expense.id ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--fg)',
                  padding: '4px 0',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: 'var(--fg)'
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(expense.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
              <button
                onClick={() => saveEdit(expense.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--fg)',
                  fontFamily: 'inherit'
                }}
              >
                ✓
              </button>
              <button
                onClick={() => setEditingId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--muted)',
                  fontFamily: 'inherit'
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg)' }}>
                    {formatAmount(expense.amount, currency)}
                  </span>
                  {expense.note && (
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                      {expense.note}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {expense.tags.map((tag) => (
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
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {formatDate(expense.timestamp)}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                <button
                  onClick={() => startEdit(expense)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--muted)',
                    fontFamily: 'inherit',
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                >
                  edit
                </button>
                <button
                  onClick={() => handleDeleteClick(expense.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--muted)',
                    fontFamily: 'inherit',
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                >
                  del
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setDeleteId(null)}
        >
          <div 
            style={{
              background: 'var(--surface)',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '280px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ 
              fontSize: '14px', 
              margin: '0 0 8px 0',
              color: 'var(--fg)'
            }}>
              Delete entry?
            </p>
            <p style={{ 
              fontSize: '12px', 
              margin: '0 0 24px 0',
              color: 'var(--muted)'
            }}>
              This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: '1px solid var(--border)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  flex: 1,
                  background: 'var(--accent)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--bg)',
                  fontFamily: 'inherit'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
