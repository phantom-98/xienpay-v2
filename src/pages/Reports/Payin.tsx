import React from 'react';
import {
  downloadPayins,
  fetchMerchantsList
} from '@/services/ant-design-pro/api';
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
import { useIntl } from '@umijs/max';

function dateFromMs(ms: number): string {
  return new Date(ms).toISOString().substring(0, 10);
}

const Reports: React.FC = () => {
  const [merchantsList, setMerchantsList] = useState<API.LinkedMerchantListItem[]>([]);

  const [formValues, setFormValues] = useState({
    merchant_codes: [],
    time_period: [Date.now() - 1000 * 3600 * 24 * 15, Date.now()],
    status: undefined,
  });
  const intl = useIntl();

  const handleMerchantChange = (value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      merchant_codes: value,
    }));
  };

  const handleDateChange = (value) => {
    setFormValues((prev) => ({
      ...prev,
      time_period: value
    }))
  }

  const handleStatusChange = (value) => {
    setFormValues(prev => ({
      ...prev,
      status: value
    }))
  }

  const handleDownload = async () => {
    
    const { merchant_codes, time_period, status } = formValues;
    const [from_date, to_date] = time_period;

    await downloadPayins(merchant_codes, dateFromMs(from_date), dateFromMs(to_date), status);
  }

  useEffect(() => {
    (async () => {
      try {
        const fetchedMerchants = await fetchMerchantsList('');
        setMerchantsList(fetchedMerchants);
        handleMerchantChange([fetchedMerchants[0]?.label])
      } catch (error) {
        console.error('Error fetching merchants:', error);
      }
    })();
  }, []);

    return (
      <PageContainer>
        <Row gutter={[16, 16]}>
          <ProForm layout="horizontal" submitter={false}>
            <ProFormSelect
              width="lg"
              labelCol={{ span: 6 }}
              options={merchantsList.map((merchant) => merchant.label)}
              name="merchant_codes"
              label="Merchant Codes"
              rules={[{required: true}]}
              fieldProps={{
                mode: 'multiple'
              }}
              onChange={handleMerchantChange}
            />
            <ProFormSelect
              width="lg"
              labelCol={{ span: 6 }}
              options={[
                {label:"Initiated", value: "initiated"},
                {label:"Assigned", value: "assigned"},
                {label:"Success", value: "success"},
                {label:"Failed", value: "failed"},
                {label:"Dropped", value: "dropped"},
                {label:"Dispute", value: "dispute"},
              ]}
              name="status"
              label="Status"
              onChange={handleStatusChange}
            />
          </ProForm>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col span={10}>
            <ProCard boxShadow>
              <ProForm
                layout="horizontal"
                initialValues={formValues}
                onValuesChange={(_, values) => handleDateChange(values.time_period)}
                submitter={{
                  render: (props, _x) => (
                    <Row gutter={8} align="middle">
                      <Col>
                        <Button
                          key="download"
                          icon={<DownloadOutlined />}
                          style={{ backgroundColor: '#639f52', borderColor: '#639f52', color: "white" }}
                          onClick={async () => {
                            const values = await props.form?.validateFields();
                            handleDownload();
                          }}
                        >
                          {intl.formatMessage({
                            id: 'pages.general.download',
                            defaultMessage: 'Download',
                          })}
                        </Button>
                      </Col>
                    </Row>
                  ),
                  searchConfig: {
                    submitText: 'Search',
                  },
                }}
                style={{
                  padding: "24px 32px"
                }}
              >
                <ProFormDateRangePicker
                  labelCol={{ span: 5 }}
                  width="md"
                  name="time_period"
                  label="Select Duration"
                  fieldProps={{
                    format: (value) => value.format('YYYY-MM-DD'),
                  }}
                  required
                />
              </ProForm>
            </ProCard>
          </Col>
        </Row>
      </PageContainer>
    );
  };
  
  export default Reports;
