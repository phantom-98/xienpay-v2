import React from 'react';
import TimeSelection from './TimeSelection';
import ChartHeader from './ChartHeader';
import Graph from './Graph';

const TrackingChart: React.FC = ({graphData, title, amount, count, duration, setDuration, options}) => {
    return (
      <div style={{
        borderRadius: "12px",
        background: "var(--bg-color)",
        boxShadow: "3px 3px 5px #1111",
        padding: "20px"
      }}>
        <ChartHeader title={title} amount={amount} count={count}/>
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "24px",
            marginTop: "20px",
        }}>
            <div style={{
                width: "calc(100% - 76px)",
                height: "320px"
            }}>
                <Graph graphData={graphData}/>
            </div>
            <TimeSelection value={duration} setValue={setDuration} options={options}/>
        </div>
      </div>
    );
  };
  
  export default TrackingChart;