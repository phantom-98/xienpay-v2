import React from 'react';

const BalanceStats: React.FC = ({main, sub}) => {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        gap: "16px",
        padding: "16px 24px",
        borderRadius: "12px",
        background: "var(--bg-color)",
        color: "var(--text-color)",
        boxShadow: "3px 3px 5px #1111",
      }}>
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            fontSize: "16px"
        }}>
            {sub.map(item => {
                return (
                    <>
                        <span>{item.name}</span>
                        <span>{item.value}</span>
                    </>
                );
            })}
        </div>
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            fontSize: "32px",
            fontWeight: "600"
        }}>
            <span>{main.name}</span>
            <span>{main.value}</span>
        </div>
      </div>
    );
  };
  
  export default BalanceStats;