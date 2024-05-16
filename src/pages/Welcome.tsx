import { fetchMerchantAnalytics, fetchMerchantsList } from '@/services/ant-design-pro/api';
import { Column } from '@ant-design/charts';
import {
  PageContainer,
  ProCard,
  ProFormDateRangePicker,
  ProFormSelect,
  QueryFilter,
} from '@ant-design/pro-components';
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
        console.error('Error fetching merchants:', error);
      }
    })();
  }, []);

  const [analytics, setAnalytics] = useState<API.AnalyticsData>();

  const { lastHour, lastDay, lastWeek } = analytics || {
    lastHour: {},
    lastDay: { histogram: [] },
    lastWeek: { histogram: [] },
  };

  const hourlyDataConfig = {
    data: lastDay.histogram.map((value) => {
      return {
        hour_ist: value.hour_ist.split(' ')[1].split(':')[0] + ':00', // Extract HH from YYYY-mm-dd HH:MM:SS
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
      <QueryFilter
        layout="horizontal"
        onFinish={async (values) => {
          const { merchant_code, time_period } = values;
          const [from_date, to_date] = time_period;
          const data = await fetchMerchantAnalytics(merchant_code, from_date, to_date);
          setAnalytics(data);
        }}
      >
        <ProFormSelect
          width="lg"
          labelCol={{
            span: 8,
          }}
          options={merchantsList.map((merchant) => merchant.label)}
          name="merchant_code"
          label="Merchant Code"
          required
          autoFocusFirstInput
        />
        <ProFormDateRangePicker
          labelCol={{
            span: 8,
          }}
          width="lg"
          name={['time_period']}
          label="Select Duration"
          required
        />
      </QueryFilter>

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
            value={lastDay.deposit_amount}
            precision={2}
            prefix="₹"
          />
          <Column height={400} {...hourlyDataConfig} />
        </ProCard>
        <Divider type="vertical" />
        <ProCard boxShadow>
          <Statistic
            title="7 day's deposits"
            value={lastWeek.deposit_amount}
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
