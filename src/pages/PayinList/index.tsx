import {
  addPayin,
  fetchMerchantsList,
  fetchPlayerList,
  payin,
  removePayin,
  updatePayin,
} from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProForm,
  ProFormMoney,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, FormattedNumber, useAccess, useIntl } from '@umijs/max';
import type { SelectProps } from 'antd';
import { Button, Drawer, Modal, Select, Switch, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

const SearchUserInput: React.FC<{
  merchantCode: string;
  placeholder: string;
  style: React.CSSProperties;
  onChange?: (value: string) => void;
}> = (props) => {
  const [data, setData] = useState<SelectProps['options']>([]);
  const [value, setValue] = useState<string>();

  const handleSearch = (newValue: string) => {
    return fetchPlayerList(props.merchantCode, newValue).then((data: any) => {
      setData(data);
    });
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    props.onChange?.(newValue);
  };

  return (
    <Select
      showSearch
      value={value}
      placeholder={props.placeholder}
      style={props.style}
      defaultActiveFirstOption={false}
      suffixIcon={null}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={null}
      options={(data || []).map((d) => ({
        value: d.value,
        label: d.label,
      }))}
    />
  );
};

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.PaymentLinkResponse) => {
  const hide = message.loading('Adding');
  try {
    const response = await addPayin({ ...fields });
    const { payinUrl } = response;
    hide();
    if (payinUrl !== null && payinUrl !== undefined) {
      navigator.clipboard.writeText(payinUrl).then(
        () => {
          message.success('Payment link copied to clipboard!');
        },
        (err) => {
          message.error('Failed to copy: ', err);
        },
      );
      Modal.success({
        content: payinUrl,
        width: 1000,
        title: 'Payment Link',
      });
    }
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('Configuring');
  try {
    await updatePayin({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    message.error('Configuration failed, please try again!');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.PayinListItem[]) => {
  const hide = message.loading('Deleting...');
  if (!selectedRows) return true;
  try {
    await removePayin({
      key: selectedRows.map((row) => row.id),
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    message.error('Delete failed, please try again');
    return false;
  }
};

const PayinList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.PayinListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.PayinListItem[]>([]);

  const [merchantCode, setMerchantCode] = useState('');

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
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

  const columns: ProColumns<API.PayinListItem>[] = [
    {
      title: <FormattedMessage id="pages.payinTable.short_code" defaultMessage="ID" />,
      dataIndex: 'id',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.payinTable.short_code" defaultMessage="Code" />,
      dataIndex: 'short_code',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.payinTable.amount" defaultMessage="Confirmed" />,
      dataIndex: 'agent_submitted_amount',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          ₹
          <FormattedNumber
            value={record.agent_submitted_amount}
            currencySign="accounting"
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        </span>
      ),
    },
    {
      title: (
        <FormattedMessage id="pages.payinTable.mcOrderId" defaultMessage="Merchant Order ID" />
      ),
      dataIndex: 'merchant_order_id',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.payinTable.mcOrderId" defaultMessage="Merchant" />,
      dataIndex: 'merchant',
      valueType: 'textarea',
      valueEnum: Map.from(merchantsList, (merchant) => [merchant.value, merchant.label]),
    },
    {
      title: <FormattedMessage id="pages.payinTable.agent" defaultMessage="User" />,
      dataIndex: 'user_id',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.payinTable.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueEnum: {
        initiated: {
          text: (
            <FormattedMessage
              id="pages.payinTable.payinStatus.default"
              defaultMessage="Initiated"
            />
          ),
          status: 'Default',
        },
        assigned: {
          text: (
            <FormattedMessage
              id="pages.payinTable.payinStatus.assigned"
              defaultMessage="Assigned"
            />
          ),
          status: 'Processing',
        },
        pending: {
          text: (
            <FormattedMessage id="pages.payinTable.payinStatus.pending" defaultMessage="Pending" />
          ),
          status: 'Processing',
        },
        success: {
          text: (
            <FormattedMessage id="pages.payinTable.payinStatus.success" defaultMessage="Success" />
          ),
          status: 'Success',
        },
        failed: {
          text: (
            <FormattedMessage id="pages.payinTable.payinStatus.failed" defaultMessage="Failed" />
          ),
          status: 'Error',
        },
        dropped: {
          text: (
            <FormattedMessage id="pages.payinTable.payinStatus.dropped" defaultMessage="Dropped" />
          ),
          status: 'Error',
        },
        dispute: {
          text: (
            <FormattedMessage id="pages.payinTable.payinStatus.dispute" defaultMessage="Dispute" />
          ),
          status: 'Warning',
        },
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.payinTable.updateForm.payinName.nameLabel"
          defaultMessage="Payin UUID"
        />
      ),
      dataIndex: 'uuid',
      tip: 'The payin uuid is the unique key',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.payinTable.amount" defaultMessage="Amount" />,
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
      title: <FormattedMessage id="pages.agentTable.testMode" defaultMessage="Test?" />,
      dataIndex: 'is_test_mode',
      hideInSearch: true,
      renderText: (val: boolean) => <Switch size="small" disabled checked={val} />,
    },
    {
      title: <FormattedMessage id="pages.payinTable.agent" defaultMessage="Agent" />,
      dataIndex: 'agent',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.payinTable.utr" defaultMessage="UTR" />,
      dataIndex: 'utr_id',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.payinTable.agent" defaultMessage="User Submitted UTR" />,
      dataIndex: 'user_submitted_utr',
      valueType: 'textarea',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.payinTable.updatedAt" defaultMessage="Last updated" />,
      dataIndex: 'updated_at',
      hideInForm: true,
      valueType: 'dateTime',
      hideInSearch: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.PayinListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.payinTable.title',
          defaultMessage: 'Payins List',
        })}
        scroll={{ x: 'max-content' }}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() =>
          access.canPayinLinkCreate
            ? [
                <Button
                  type="primary"
                  key="primary"
                  onClick={() => {
                    handleModalOpen(true);
                  }}
                >
                  <PlusOutlined />{' '}
                  <FormattedMessage
                    id="pages.payinTable.new-payment-link"
                    defaultMessage="New Payment Link"
                  />
                </Button>,
              ]
            : null
        }
        request={payin}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
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
          <Button type="primary">
            <FormattedMessage
              id="pages.searchTable.batchApproval"
              defaultMessage="Batch approval"
            />
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.newPayin',
          defaultMessage: 'New payin',
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
        labelAlign="left"
        onFinish={async (value) => {
          const success = await handleAdd(value as API.PaymentLinkResponse);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.payinName"
                  defaultMessage="Merchant Order ID is required"
                />
              ),
            },
          ]}
          initialValue={crypto.randomUUID().toString()}
          label="Merchant Order ID"
          width="md"
          name="merchant_order_id"
          placeholder="Unique order ID generated at the merchant for reference"
        />
        <ProFormSelect
          width="md"
          options={merchantsList.map((merchant) => merchant.label)}
          //options={merchantsList}
          // request={fetchRolesList}
          name="merchant_code"
          label="Merchant Code"
          onChange={setMerchantCode}
        />
        <ProForm.Item name="user_id" label="User ID" valuePropName="value">
          <SearchUserInput
            merchantCode={merchantCode}
            placeholder="Search user id"
            style={{ width: 'md' }}
          />
        </ProForm.Item>
        <ProFormText
          colProps={{ span: 12 }}
          width="md"
          name="user_email"
          label="Email"
          placeholder="Optional user email"
        />
        <ProFormText
          colProps={{ span: 12 }}
          width="md"
          name="user_phone_number"
          label="User Phone #"
          placeholder="Optional user email"
        />
        <ProFormMoney
          label="Amount"
          name="amount"
          colProps={{ span: 12 }}
          fieldProps={{ moneySymbol: false }}
          locale="en-US"
          min={0}
          placeholder="Optional amount: Will default to 0.0 and the amount submitted by the user"
        />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

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
          <ProDescriptions<API.PayinListItem>
            column={1}
            title={<p>Payin ID. {currentRow?.id}</p>}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.PayinListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default PayinList;
