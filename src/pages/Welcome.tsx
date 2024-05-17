import {
  downloadPayins,
  fetchMerchantAnalytics,
  fetchMerchantsList,
} from '@/services/ant-design-pro/api';
import { Column } from '@ant-design/charts';
import { DownloadOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  StatisticCard,
} from '@ant-design/pro-components';
import { Button, Col, Row, message } from 'antd';
import { useEffect, useState } from 'react';

const { Statistic, Divider } = StatisticCard;

function daysBetween(date1: string, date2: string): number {
  const d1: Date = new Date(date1);
  const d2: Date = new Date(date2);

  const daysDifference = (d2 - d1) / (1000 * 60 * 60 * 24);

  return Math.abs(daysDifference);
}

function dateFromMs(ms: number): string {
  return new Date(ms).toISOString().substring(0, 10);
}

function asINR(n: number): string {
  if (!n) return '₹ --';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(n);
}

const Welcome = () => {
  /* Preload merchants list */
  const [merchantsList, setMerchantsList] = useState<API.LinkedMerchantListItem[]>([]);
  const [analytics, setAnalytics] = useState<API.AnalyticsData>();
  const [formValues, setFormValues] = useState({
    merchant_code: '',
    time_period: [Date.now(), Date.now() - 1000 * 60 * 60 * 24 * 6],
  });

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

  const handleFormSubmit = async (action) => {
    console.log('Form values:', formValues);
    const { merchant_code, time_period } = formValues;
    const [from_date, to_date] = time_period;

    if (daysBetween(from_date, to_date) >= 15) {
      message.error('Please select a date range within 15 days');
      return;
    }

    try {
      if (action === 'download') {
        await downloadPayins(merchant_code, dateFromMs(from_date), dateFromMs(to_date));
      } else if (action === 'submit') {
        const data = await fetchMerchantAnalytics(
          merchant_code,
          dateFromMs(from_date),
          dateFromMs(to_date),
        );
        setAnalytics(data);
      }
    } catch (error) {
      message.error(`Failed to ${action}`);
    }
  };

  const handleMerchantChange = (value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      merchant_code: value,
    }));
  };

  const handleDateChange = (value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      time_period: value,
    }));
  };

  const { lastHour, lastDay, lastWeek } = analytics || {
    lastHour: { deposit_count: '--' },
    lastDay: { deposit_count: '--', histogram: [] },
    lastWeek: { deposit_count: '--', histogram: [] },
  };

  const hourlyDataConfig = {
    data: lastDay.histogram.map((value) => ({
      hour_ist: value.hour_ist.split(' ')[1].split(':')[0] + ':00',
      amount: value.amount,
    })),
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

  const lh_dc = `${lastHour.deposit_count} #`;
  const ld_dc = `${lastDay.deposit_count} #`;

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <ProForm layout="horizontal" submitter={false}>
          <ProFormSelect
            width="lg"
            labelCol={{ span: 6 }}
            options={merchantsList.map((merchant) => merchant.label)}
            name="merchant_code"
            label="Merchant Code"
            required
            onChange={handleMerchantChange}
          />
        </ProForm>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Left Half */}
        <Col span={12}>
          <StatisticCard.Group direction="row" boxShadow>
            <StatisticCard
              statistic={{
                title: 'This Hour Deposits',
                value: `${asINR(lastHour.deposit_amount)}`,
                description: <Statistic title="Count" value={lh_dc} />,
              }}
              chart={
                <img
                  src="https://gw.alipayobjects.com/zos/alicdn/ShNDpDTik/huan.svg"
                  alt="百分比"
                  width="100%"
                />
              }
              chartPlacement="left"
            />
            <Divider type="vertical" />
            <StatisticCard
              statistic={{
                title: "Today's Deposits",
                value: `${asINR(lastDay.deposit_amount)}`,
                description: <Statistic title="Count" value={ld_dc} />,
              }}
              chart={
                <img
                  src="https://gw.alipayobjects.com/zos/alicdn/6YR18tCxJ/huanlv.svg"
                  alt="百分比"
                  width="100%"
                />
              }
              chartPlacement="left"
            />
          </StatisticCard.Group>
          <Divider type="horizontal" />
          <StatisticCard
            boxShadow
            statistic={{
              title: "Today's Deposits",
              value: `${asINR(lastDay.deposit_amount)}`,
            }}
            chart={<Column height={400} {...hourlyDataConfig} />}
          />
        </Col>

        {/* Right Half */}
        <Col span={12}>
          <ProCard boxShadow>
            <ProForm
              layout="horizontal"
              initialValues={formValues}
              onValuesChange={(_, values) => handleDateChange(values.time_period)}
              submitter={{
                render: (props, x) => (
                  <Row gutter={8} align="middle">
                    <Col>
                      <Button
                        key="submit"
                        type="primary"
                        onClick={async () => {
                          const values = await props.form?.validateFields();
                          console.log(values, x);
                          handleFormSubmit('submit');
                        }}
                      >
                        Submit
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        key="download"
                        icon={<DownloadOutlined />}
                        style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                        onClick={async () => {
                          const values = await props.form?.validateFields();
                          console.log(values);
                          handleFormSubmit('download');
                        }}
                      >
                        Download
                      </Button>
                    </Col>
                  </Row>
                ),
                searchConfig: {
                  submitText: 'Search',
                },
              }}
            >
              <ProFormDateRangePicker
                labelCol={{ span: 4 }}
                width="sm"
                name="time_period"
                label="Select Duration"
                fieldProps={{
                  format: (value) => value.format('YYYY-MM-DD'),
                }}
                required
              />
            </ProForm>
          </ProCard>
          <Divider type="horizontal" />
          <StatisticCard
            boxShadow
            statistic={{
              title: "Duration's Deposits",
              value: `${asINR(lastWeek.deposit_amount)}`,
            }}
            chart={<Column height={400} {...dailyDataConfig} />}
          />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Welcome;
