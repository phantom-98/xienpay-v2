import React from 'react';
import CoinStats from '.';

const Coins: React.FC = ({ data }) => {

    return (
        <div className='coin-card' style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            gap: "12px",
        }}>
            {data.map(item => {
                return <CoinStats icon={item.icon} title={item.title} description={item.description}/>;
            })}
        </div>
    );
}

export default Coins;