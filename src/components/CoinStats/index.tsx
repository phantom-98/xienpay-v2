import React from 'react';

const CoinStats: React.FC = ({icon, title, description}) => {

    return (
        <div className='coin-stats-card ant-pro-card' style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
            gap: "24px",
            minWidth: "200px",
            borderRadius: "12px",
            background: "var(--bg-color)",
            color: "var(--text-color)",
            padding: "16px 24px",
            boxShadow: "3px 3px 5px #1111",
        }}>
            <div style={{
                borderRadius: "50%",
                overflow: "hidden"
            }}>
                {icon}
            </div>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                justifyContent: "space-between",
                gap: "8px"
            }}>
                <span style={{
                    fontSize: "16px"
                }}>{title}</span>
                <span style={{
                    fontSize: "24px"
                }}>{description}</span>
            </div>
        </div>
    );
}

export default CoinStats;