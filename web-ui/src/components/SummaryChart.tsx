import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SummaryCount } from '../types';

interface SummaryChartProps {
  summary: SummaryCount;
}

const COLORS = [
  '#FF6B6B', // Red for errors
  '#4ECDC4', // Teal for permissions
  '#45B7D1', // Blue for UUID issues
  '#96CEB4', // Green for valid tokens
  '#FFEAA7', // Yellow for unsupported
  '#DDA0DD', // Purple for expired
  '#FFB347', // Orange for parse errors
];

export const SummaryChart: React.FC<SummaryChartProps> = ({ summary }) => {
  const data = Object.entries(summary).map(([name, value]) => ({
    name,
    value,
  }));

  const total = Object.values(summary).reduce((sum, count) => sum + count, 0);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Root Cause Analysis Summary
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Total Issues Analyzed: <strong>{total}</strong>
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, name]} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};