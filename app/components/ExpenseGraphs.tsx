'use client';

import { useMemo } from 'react';
import { Expense } from '@/lib/types';
import { formatAmount, getCurrencySymbol } from '@/lib/storage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ExpenseGraphsProps {
  expenses: Expense[];
  currency: string;
}

const COLORS = ['var(--fg)', '#666', '#999', '#bbb', '#ccc', '#ddd', '#888', '#555'];

export default function ExpenseGraphs({ expenses, currency }: ExpenseGraphsProps) {
  const symbol = getCurrencySymbol(currency);

  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { weekday: 'short' });
      days[key] = 0;
    }

    expenses.forEach(exp => {
      const expDate = new Date(exp.timestamp);
      const dayDiff = Math.floor((today.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        const key = expDate.toLocaleDateString('en-IN', { weekday: 'short' });
        if (key in days) {
          days[key] += exp.amount;
        }
      }
    });

    return Object.entries(days).map(([day, amount]) => ({ day, amount }));
  }, [expenses]);

  const tagData = useMemo(() => {
    const tagTotals: Record<string, number> = {};
    
    expenses.forEach(exp => {
      if (exp.tags.length === 0) {
        tagTotals['untagged'] = (tagTotals['untagged'] || 0) + exp.amount;
      } else {
        exp.tags.forEach(tag => {
          tagTotals[tag] = (tagTotals[tag] || 0) + exp.amount;
        });
      }
    });

    return Object.entries(tagTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [expenses]);

  const stats = useMemo(() => {
    const today = new Date();
    const todayTotal = expenses
      .filter(e => new Date(e.timestamp).toDateString() === today.toDateString())
      .reduce((sum, e) => sum + e.amount, 0);
    const thisWeek = dailyData.reduce((sum, d) => sum + d.amount, 0);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    return { total, today: todayTotal, thisWeek };
  }, [expenses, dailyData]);

  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
        <p>Add expenses to see analytics</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 4px 0' }}>today</p>
          <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{formatAmount(stats.today, currency)}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 4px 0' }}>this week</p>
          <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{formatAmount(stats.thisWeek, currency)}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 4px 0' }}>total</p>
          <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{formatAmount(stats.total, currency)}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div>
        <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 12px 0' }}>last 7 days</p>
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                tickFormatter={(v: number) => `${symbol}${v}`}
              />
              <Tooltip 
                formatter={(v) => [`${symbol}${v || 0}`, '']}
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="var(--fg)" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      {tagData.length > 0 && (
        <div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 12px 0' }}>by tag</p>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tagData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {tagData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v) => [`${symbol}${v || 0}`, '']}
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px', 
            marginTop: '16px',
            justifyContent: 'center'
          }}>
            {tagData.map((tag, index) => (
              <span 
                key={tag.name} 
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)'
                }}
              >
                <span 
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    marginRight: '6px',
                    backgroundColor: COLORS[index % COLORS.length]
                  }}
                />
                {tag.name} {symbol}{tag.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
