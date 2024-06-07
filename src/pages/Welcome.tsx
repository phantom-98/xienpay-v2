import BalanceStats from '@/components/BalanceStats';
import Coins from '@/components/CoinStats/Coins';
import TrackingChart from '@/components/TrackingChart';
import {
  downloadPayins,
  fetchMerchantAnalytics,
  fetchMerchantsList,
  fetchMerchantAnalyticsSnapshot,
  fetchMerchantAnalyticsPayins,
  fetchMerchantAnalyticsPayouts
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
import { useIntl } from '@umijs/max';
import { Button, Col, Row, message } from 'antd';
import { useEffect, useState } from 'react';
import { getInitialState } from '@/app';
import { useModel } from 'umi';

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

const option = [ "12H", "7D", "15D"]

const Welcome = () => {
  /* Preload merchants list */
  const [merchantsList, setMerchantsList] = useState<API.LinkedMerchantListItem[]>([]);
  const [analytics, setAnalytics] = useState<API.AnalyticsData>();
  const [deposit, setDeposit] = useState("7D");
  const [depositData, setDepositData] = useState({payins: []});
  const [withdraw, setWithdraw] = useState("7D")
  const [withdrawData, setWithdrawData] = useState({payouts: []});
  const [snapshot, setSnapshot] = useState();

  const [formValues, setFormValues] = useState({
    merchant_code: '',
    time_period: "7d",
    time_period2: "7d",
  });

  const intl = useIntl();

  const coins = [
    {
      icon: <img src="/assets/icons/deposit.jpg" width="52" alt=""/>,
      title: `${intl.formatMessage({
        id: 'pages.general.deposit',
        defaultMessage: 'Deposit'
      })} (${snapshot?.lifetime?.deposits?.count ?? 0})`,
      description: `${asINR(snapshot?.lifetime?.deposits?.amount ?? 0)}`
    },
    {
      icon: <img src="/assets/icons/commission.jpg" width="52" alt=""/>,
      title: `${intl.formatMessage({
        id: 'pages.general.deposit',
        defaultMessage: 'Deposit'
      })} %`,
      description:  `${asINR(snapshot?.lifetime?.deposits?.commission ?? 0)}`
    },
    {
      icon: <img src="/assets/icons/withdraw.jpg" width="52" alt=""/>,
      title: `${intl.formatMessage({
        id: 'pages.general.withdrawals',
        defaultMessage: 'Withdrawals'
      })} (${snapshot?.lifetime?.withdrawals?.count ?? 0})`,
      description: `${asINR(snapshot?.lifetime?.withdrawals?.amount ?? 0)}`
    },
    {
      icon: <img src="/assets/icons/commission.jpg" width="52" alt=""/>,
      title: `${intl.formatMessage({
        id: 'pages.general.withdrawals',
        defaultMessage: 'Withdrawals'
      })} %`,
      description: `${asINR(snapshot?.lifetime?.withdrawals?.commission ?? 0)}`
    },
  ]

  useEffect(() => {
    (async () => {
      try {
        const fetchedMerchants = await fetchMerchantsList('');
        setMerchantsList(fetchedMerchants);
        handleMerchantChange(fetchedMerchants[0]?.label)
      } catch (error) {
        console.error('Error fetching merchants:', error);
      }
    })();
  }, []);

  useEffect(() => {
    handleFormSubmit("snapshot");
  }, [formValues.merchant_code])

  useEffect(() => {
    handleFormSubmit("submit");
  }, [formValues.merchant_code, formValues.time_period])

  useEffect(() => {
    handleFormSubmit("submit2");
  }, [formValues.merchant_code, formValues.time_period2])

  useEffect(() => {
    setFormValues({
      ...formValues,
      time_period: deposit?.toLowerCase(),
    })
  }, [deposit]);

  useEffect(() => {
    setFormValues({
      ...formValues,
      time_period2: withdraw?.toLowerCase(),
    })
  }, [withdraw]);

  const { initialState } = useModel('@@initialState');

  useEffect(() => {
  }, [initialState]); 

  const handleFormSubmit = async (action: string) => {
    console.log('Form values:', formValues);
    const { merchant_code, time_period, time_period2 } = formValues;

    try {
      // if (action === 'download') {
      //   await downloadPayins(merchant_code, dateFromMs(from_date), dateFromMs(to_date));
      // } else 
      if (action === 'submit') {
        
        const payins = await fetchMerchantAnalyticsPayins(
          merchant_code,
          time_period,
        );
        console.log("-----------payins-------------", payins)
        setDepositData(payins);
      } else if (action === 'submit2') {
        
        const payouts = await fetchMerchantAnalyticsPayouts(
          merchant_code,
          time_period2,
        );
        console.log("-----------payouts-------------", payouts)
        setWithdrawData(payouts);
      } else if (action === 'snapshot') {

        const snap = await fetchMerchantAnalyticsSnapshot(
          merchant_code,
          "15d"
        )
        console.log("---------snapshot----------", snap)
        setSnapshot(snap);
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

  return (
    <PageContainer className={`${initialState?.settings?.navTheme}`}>
      <Row gutter={[16, 16]}>
        <ProForm layout="horizontal" submitter={false}>
          <ProFormSelect
            width="lg"
            labelCol={{ span: 6 }}
            options={merchantsList.map((merchant) => merchant.label)}
            name="merchant_code"
            label="Merchant Code"
            value={merchantsList[0]?.label}
            required
            onChange={handleMerchantChange}
          />
        </ProForm>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span = {14}>
          <Coins data = {coins}/>
        </Col>
        <Col span = {10}>
          <BalanceStats main ={{name: `${intl.formatMessage({
            id: 'pages.dashboard.netBalance',
            defaultMessage: 'Net Balance'
          })}`, value: `${asINR(snapshot?.lifetime?.balance ?? 0)}`}} sub={[
            {name: `${intl.formatMessage({
              id: 'pages.dashboard.deposits',
              defaultMessage: 'Deposits'
            })}`, value: `${asINR(snapshot?.lifetime?.deposits?.amount ?? 0)}`},
            {name: `${intl.formatMessage({
              id: 'pages.dashboard.withdrawals',
              defaultMessage: 'Withdrawals'
            })}`, value: `${asINR(snapshot?.lifetime?.withdrawals?.amount ?? 0)}`},
            {name: `${intl.formatMessage({
              id: 'pages.dashboard.commission',
              defaultMessage: 'Commission'
            })}`, value: `${asINR(parseFloat(snapshot?.lifetime?.deposits?.commission ?? 0) + parseFloat(snapshot?.lifetime?.withdrawals?.commission ?? 0))}`},
            {name: `${intl.formatMessage({
              id: 'pages.dashboard.outstanding',
              defaultMessage: 'Outstanding'
            })}`, value: `${asINR(snapshot?.lifetime?.settlements?.amount ?? 0)}`},
          ]}/>

        </Col>
      </Row>
        <div style={{
          margin:"20px 0",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <TrackingChart graphData={depositData.payins.map(item => {
            return {
              name: item.day_ist,
              channel1: item.amount,
              channel2: 0
            }
          })} title={`${intl.formatMessage({
            id: 'pages.general.deposit',
            defaultMessage: 'Deposit'
          }).toUpperCase()}`} amount={asINR(depositData.amount)} count={depositData.count} duration={deposit} setDuration={setDeposit} options={option} />
          
          <TrackingChart graphData={withdrawData.payouts.map(item => {
            return {
              name: item.day_ist,
              channel1: item.amount,
              channel2: 0
            }
          })} title={`${intl.formatMessage({
            id: 'pages.general.withdrawals',
            defaultMessage: 'Withdrawals'
          }).toUpperCase()}`} amount={asINR(withdrawData.amount)} count={withdrawData.count} duration={withdraw} setDuration={setWithdraw} options={option} />
        </div>
    </PageContainer>
  );
};

export default Welcome;
