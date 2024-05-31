import React from 'react';
import { Bar, BarChart, Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

const Graph: React.FC = ({ graphData }) => {

  return (
    <ResponsiveContainer>
      <BarChart
        barGap={5}
        barSize={12}
        data={graphData}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey='name' axisLine={true} />
        <YAxis/>
        <Tooltip labelStyle={{ color: 'black' }} />
        <Bar dataKey='channel1' stackId='a' fill='#3182CE' radius={[0,0,6,6]}/>
        <Bar dataKey='channel2' stackId='a' fill='#E53E3E' radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Graph;