import { fetchMerchantAnalytics, fetchMerchantsList } from '@/services/ant-design-pro/api';
import { Column } from '@ant-design/charts';
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
    lastHour: {},
    lastDay: { histogram: [] },
    lastWeek: { histogram: [] },
  };
  console.log(lastHour, lastDay, lastWeek);

  const hourlyDataConfig = {
    data: lastDay.histogram.map((value) => {
      console.log(value);
      return {
        hour_ist: value.hour_ist.split(' ')[1].split(':')[0] + ':00',
        amount: value.amount,
      };
    }),
    xField: 'hour_ist',
    yField: 'amount',
    colorField: 'hour_ist',
  };

  const dailyDataConfig = {
    data: lastWeek.histogram,
    xField: 'day_ist',
    yField: 'amount',
    colorField: 'day_ist',
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
            <Statistic title="This hour deposit count" value={lastHour.deposit_count} />
          </ProCard>
          <Divider type="vertical" />
          <ProCard boxShadow>
            <Statistic
              title="This hour deposit amount"
              value={lastHour.deposit_amount}
              prefix="₹"
            />
          </ProCard>
          <Divider type="vertical" />
          <ProCard boxShadow>
            <Statistic title="Today deposit count" value={lastDay.deposit_count} />
          </ProCard>
          <Divider type="vertical" />
          <ProCard boxShadow>
            <Statistic title="Today deposit amount" value={lastDay.deposit_amount} prefix="₹" />
          </ProCard>
        </ProCard.Group>
      </Space>

      <Divider />

      <ProCard.Group direction="row">
        <ProCard boxShadow>
          <Statistic
            title="Today's Deposits"
            value={lastHour.deposit_amount}
            precision={2}
            prefix="₹"
          />
          <Column height={400} {...hourlyDataConfig} />
        </ProCard>
        <Divider type="vertical" />
        <ProCard boxShadow>
          <Statistic
            title="7 day's deposits"
            value={lastDay.deposit_amount}
            precision={2}
            prefix="₹"
          />
          <Column height={400} {...dailyDataConfig} />
        </ProCard>
      </ProCard.Group>
    </PageContainer>
  );
};

export default Welcome;
