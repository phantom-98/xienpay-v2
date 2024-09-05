import { addChargeback, chargeback, fetchMerchantsList } from '@/services/ant-design-pro/api';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormMoney,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, FormattedNumber, useAccess, useIntl } from '@umijs/max';
import { Button, Drawer, Form, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { utcToist, validateRequest } from '../../utils';

function transformToAPI(item: API.AddChargebackItem): API.AddChargebackAPIItem {
  const { amount, merchant, merchant_order_id, username, when } = item;

  return {
    amount,
    merchant_code: merchant,
    merchant_order_id,
    username,
    when,
  };
}

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.AddChargebackItem) => {
  const hide = message.loading('Adding');
  try {
    await addChargeback(transformToAPI(fields));
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

const ChargebackList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ChargebackListItem>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [selectedRowsState, setSelectedRows] = useState<API.ChargebackListItem[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const intl = useIntl();
  const access = useAccess();
  
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

  const columns: ProColumns<API.ChargebackListItem>[] = [
    {
      title: <FormattedMessage id="pages.chargebackTable.id" defaultMessage="ID" />,
      dataIndex: 'id',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.chargebackTable.merchant" defaultMessage="Merchant" />,
      dataIndex: 'merchant',
      valueType: 'textarea',
      valueEnum: Map.from(merchantsList, (merchant) => [merchant.value, merchant.label]),
    },
    {
      title: (
        <FormattedMessage
          id="pages.chargebackTable.merchant_order_id"
          defaultMessage="Merchant Order ID"
        />
      ),
      dataIndex: 'merchant_order_id',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.chargebackTable.username" defaultMessage="User" />,
      dataIndex: 'username',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.chargebackTable.amount" defaultMessage="Amount" />,
      dataIndex: 'amount',
      render: (_, record) => (
        <span>
          ₹
          <FormattedNumber
            value={record.amount}
            currencySign="accounting"
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        </span>
      ),
    },
    {
      title: <FormattedMessage id="pages.chargebackTable.when" defaultMessage="When" />,
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      render: (_, record) => <span>{utcToist(record.updated_at)}</span>,
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<API.ChargebackListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.chargebackTable.title',
          defaultMessage: 'Chargebacks List',
        })}
        scroll={{ x: 'max-content' }}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          access.canChargebackCreate ? (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalOpen(true);
                form.resetFields();
              }}
            >
              <PlusOutlined />{' '}
              <FormattedMessage
                id="pages.chargebackTable.new-payment-link"
                defaultMessage="New Chargeback"
              />
            </Button>
          ) : null,
          <Button
            type="text"
            key="text"
            onClick={() => {
              actionRef.current?.reload();
            }}
          >
            <ReloadOutlined />
          </Button>,
        ]}
        request={async (req) => {
          const res = validateRequest(req);
          if (typeof res === 'string') {
            messageApi.error(res);
            throw new Error(res)
          }
          else return await chargeback(res);
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        pagination={{
          showSizeChanger: true,
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
        </FooterToolbar>
      )}
      {createModalOpen && (
        <ModalForm
          title={intl.formatMessage({
            id: 'pages.searchTable.createForm.newChargeback',
            defaultMessage: 'New chargeback',
          })}
          open={createModalOpen}
          onOpenChange={handleModalOpen}
          layout="horizontal"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          width={720}
          labelAlign="left"
          form={form}
          onFinish={async (value) => {
            const success = await handleAdd(value as API.AddChargebackItem);
            if (success) {
              handleModalOpen(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        >
          <ProFormText width="md" name="merchant" label="Merchant" required={true} />
          <ProFormText
            width="md"
            name="merchant_order_id"
            label="Merchant Order ID"
            required={true}
          />
          <ProFormText width="md" name="username" label="User" required={true} />
          <ProFormMoney
            label="Amount"
            name="amount"
            width="md"
            required={true}
            fieldProps={{ moneySymbol: false }}
            locale="en-US"
          />
          <ProFormText width="md" name="when" label="When" required={false} />
        </ModalForm>
      )}
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.id && (
          <ProDescriptions<API.SettlementListItem>
            column={1}
            title={<p>Settlement ID. {currentRow?.id}</p>}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.SettlementListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ChargebackList;
