import { fetchMerchantAnalytics, fetchMerchantsList } from '@/services/ant-design-pro/api';
import { Area, Line } from '@ant-design/charts';
import { PageContainer, ProCard, ProFormSelect } from '@ant-design/pro-components';
import { Divider, Space, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';

const Welcome: React.FC = () => {
  /* Preload merchants list */
  const [merchantsList, setMerchantsList] = useState<API.LinkedMerchantListItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const fetchedMerchants = await fetchMerchantsList('');
        setMerchantsList(fetchedMerchants);
      } catch (error) {
        // Handle error
        console.error('Error fetching merchants:', error);
      }
    })();
  }, []);

  const [analytics, setAnalytics] = useState<API.AnalyticsData>();

  console.log(analytics);
  const { lastHour, lastDay, lastWeek } = analytics || {
    lastHour: 0,
    lastDay: 0,
    lastWeek: 0,
    lastMonth: 0,
  };
  console.log(lastHour, lastDay, lastWeek);

  const areaConfig = {
    // data: {
    //   type: 'fetch',
    //   value: 'https://assets.antv.antgroup.com/g2/aapl.json',
    // },
    data: lastDay.histogram,
    //xField: (d) => new Date(d.hour),
    xField: 'hour',
    yField: 'amount',
  };

  const config = {
    data: lastWeek.histogram,
    xField: 'day',
    yField: 'amount',
    point: {
      size: 5,
      shape: 'diamond',
    },
    tooltip: {
      // formatter: (data) => {
      //   return {
      //     name: '',
      //     value: 75,
      //   };
      // },
      // customContent: (name, data) =>
      //   `<div>${data?.map((item) => {
      //     return `<div class="tooltip-chart" >
      //         <span class="tooltip-item-name">${item?.day}</span>
      //         <span class="tooltip-item-value">${item?.value}</span>
      //       </div>`;
      //   })}</div>`,
      showMarkers: false,
      showContent: false,
      position: 'left',
      showCrosshairs: true,
    },
  };

  return (
    <PageContainer>
      <ProFormSelect
        width="md"
        options={merchantsList.map((merchant) => merchant.label)}
        name="merchant_code"
        label="Merchant Code"
        onChange={async (merchant_code) => {
          const data = await fetchMerchantAnalytics(merchant_code);
          console.log(data);
          setAnalytics(data);
        }}
      />

      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <ProCard.Group direction="row">
          <ProCard boxShadow>
            <Statistic title="Hourly deposit count" value={lastHour.deposit_count} />
          </ProCard>
          <Divider type="vertical" />
          <ProCard boxShadow>
            <Statistic title="Deposits in last 1 hour" value={lastHour.deposit_amount} prefix="₹" />
          </ProCard>
          <Divider type="vertical" />
          <ProCard boxShadow>
            <Statistic title="Daily deposit count" value={lastDay.deposit_count} />
          </ProCard>
          <Divider type="vertical" />
          <ProCard boxShadow>
            <Statistic title="Deposit in last 1 day" value={lastDay.deposit_amount} prefix="₹" />
          </ProCard>
        </ProCard.Group>
      </Space>

      <Divider />

      <ProCard.Group direction="column">
        <ProCard boxShadow>
          <Statistic
            title="Deposits in last 1 hour"
            value={lastHour.deposit_amount}
            precision={2}
            prefix="₹"
          />
          <Area height={150} {...areaConfig} />
        </ProCard>
        <Divider type="horizontal" />
        <ProCard boxShadow>
          <Statistic
            title="Deposits in last 1 day"
            value={lastDay.deposit_amount}
            precision={2}
            prefix="₹"
          />
          <Line height={150} {...config} />
        </ProCard>
      </ProCard.Group>
    </PageContainer>
  );
};

export default Welcome;
