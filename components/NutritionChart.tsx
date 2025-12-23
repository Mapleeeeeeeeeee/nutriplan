import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NutritionTotals } from '../types';

interface NutritionChartProps {
  totals: NutritionTotals;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // Protein (Green), Carbs (Blue), Fat (Orange)

const NutritionChart: React.FC<NutritionChartProps> = ({ totals }) => {
  const data = [
    { name: '蛋白質', value: totals.protein },
    { name: '碳水化合物', value: totals.carbs },
    { name: '脂肪', value: totals.fat },
  ];

  // If all are zero, show gray placeholder
  if (totals.calories === 0) {
      return (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
             尚無資料
          </div>
      )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
            formatter={(value: number) => `${value.toFixed(1)}g`}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default NutritionChart;