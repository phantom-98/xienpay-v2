import React from 'react';

const ChartHeader: React.FC = ({title, amount, count}) => {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 40px",
        justifyContent: "space-between",
        color:"var(--text-color)"
      }}>
        <span style={{fontSize: "28px", fontWeight: "800"}}>{title}</span>
        <div>
            <span style={{fontSize: "20px"}}>{amount ?? 0}</span>
            <span style={{fontSize: "12px", display: "block", marginTop: "8px"}}>Amount</span>
        </div>
        <div>
            <span style={{fontSize: "20px"}}>{count ?? 0}</span>
            <span style={{fontSize: "12px", display: "block", marginTop: "8px"}}>Count</span>
        </div>
      </div>
    );
  };
  
  export default ChartHeader;