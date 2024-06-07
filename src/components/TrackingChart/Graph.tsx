import React from 'react';
import { Bar, BarChart, Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

const Graph: React.FC = ({ graphData }) => {

  function asINR(n: number): string {
    if (!n) return '₹ --';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(n);
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "var(--bg-color)",
          opacity: "0.9",
          borderRadius: "4px",
          boxShadow: "2px 2px 5px grey",
          padding: "12px 12px 4px"
        }}>
          <p style={{
            color: "var(--text-color)",
          }}>{label}</p>
          {payload.map(item => {
            return (
              <p style={{
                color: item.color,
                lineHeight: "4px"
              }}>{item.dataKey}: {asINR(item.value)}</p>
            )
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer>
      <BarChart
        barGap={5}
        barSize={12}
        data={graphData}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)"/>
        <XAxis dataKey='name' axisLine={true} stroke="var(--border-color)"/>
        <YAxis stroke="var(--border-color)"/>
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--border-color)", opacity: "0.8"}}/>
        <Bar dataKey='channel1' stackId='a' fill='#3182CE' radius={[0,0,6,6]}/>
        <Bar dataKey='channel2' stackId='a' fill='#E53E3E' radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Graph;
