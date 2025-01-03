import {
  addMerchant,
  merchant,
  removeMerchant,
  updateMerchant,
} from '@/services/ant-design-pro/api';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormMoney,
  ProFormText,
  ProFormSelect,
  ProFormSwitch,
  ProTable,
  ProForm,
} from '@ant-design/pro-components';
import { FormattedMessage, FormattedNumber, useAccess, useIntl } from '@umijs/max';
import { Button, Drawer, Select, Switch, message, Descriptions, Row, Col, Flex } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.AddMerchantItem) => {
  const hide = message.loading('Adding');
  try {
    await addMerchant({ ...fields });
    hide();
    message.success('Added successfully');
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
    await updateMerchant({
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
const handleRemove = async (selectedRows: API.MerchantListItem[]) => {
  const hide = message.loading('Deleting...');
  if (!selectedRows) return true;
  try {
    await removeMerchant({
      key: selectedRows.map((row) => row.code),
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

// const { Option } = Select;
const SelectBefore:React.FC<{name:string}> = ({name}) => {
  return (
    <ProFormSelect
      name={name}
      placeholder="https://"
      options={[
        {label: "http://", value: "http://"},
        {label: "https://", value: "https://"}
      ]}
      initialValue="http://"
      defaultActiveFirstOption={true}
    />
  )
};

const MerchantList: React.FC = () => {
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
  const [currentRow, setCurrentRow] = useState<API.MerchantListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.MerchantListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();

  const columns: ProColumns<API.MerchantListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.merchantTable.updateForm.merchantName.nameLabel"
          defaultMessage="Merchant name"
        />
      ),
      dataIndex: 'code',
      hideInSearch: true,
      tip: 'The merchant code is the unique key',
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
      title: <FormattedMessage id="pages.merchantTable.siteUrl" defaultMessage="Site" />,
      dataIndex: 'site_url',
      valueType: 'textarea',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.merchantTable.apiKey" defaultMessage="API Key" />,
      dataIndex: 'api_key',
      valueType: 'textarea',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.merchantTable.notifyUrl" defaultMessage="Notify Url" />,
      dataIndex: 'notify_url',
      valueType: 'textarea',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.merchantTable.returnUrl" defaultMessage="Return Url" />,
      dataIndex: 'return_url',
      valueType: 'textarea',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.merchantTable.balance" defaultMessage="Balance" />,
      hideInSearch: true,
      render: (_, record) => (
        <span>
          ₹
          <FormattedNumber
            value={record.balance}
            currencySign="accounting"
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        </span>
      ),
    },
    {
      title: <FormattedMessage id="pages.merchantTable.payin" defaultMessage="Max Payin" />,
      hideInSearch: true,
      render: (_, record) => (
        <span>
          ₹
          <FormattedNumber
            value={record.min_payin}
            currencySign="accounting"
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
          &nbsp;-&nbsp; ₹
          <FormattedNumber
            value={record.max_payin}
            currencySign="accounting"
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        </span>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.merchantTable.payinCommission"
          defaultMessage="Payin Commission"
        />
      ),
      dataIndex: 'payin_commission',
      hideInSearch: true,
      renderText: (val: number) => `${val} %`,
    },
    {
      title: <FormattedMessage id="pages.merchantTable.payout" defaultMessage="Max Payout" />,
      hideInSearch: true,
      render: (_, record) => (
        <span>
          ₹
          <FormattedNumber
            value={record.min_payout}
            currencySign="accounting"
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
          &nbsp;-&nbsp; ₹
          <FormattedNumber
            value={record.max_payout}
            currencySign="accounting"
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        </span>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.merchantTable.payoutCommission"
          defaultMessage="Payout Commission"
        />
      ),
      dataIndex: 'payout_commission',
      hideInSearch: true,
      renderText: (val: number) => `${val} %`,
    },
    {
      title: <FormattedMessage id="pages.merchantTable.payoutCallbackUrl" defaultMessage="Payout Callback" />,
      dataIndex: 'payout_notify_url',
      valueType: 'textarea',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.merchantTable.testMode" defaultMessage="Test mode?" />,
      hideInSearch: true,
      dataIndex: 'is_test_mode',
      render: (_, record) => (
        <Switch
          checked={record.is_test_mode}
          size="small"
          style={{ backgroundColor: record.is_test_mode ? 'red' : 'grey' }}
          disabled
        />
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.MerchantListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.merchantTable.title',
          defaultMessage: 'Merchants List',
        })}
        actionRef={actionRef}
        rowKey="code"
        search={false}
        // search={{
        //   labelWidth: 120,
        // }}
        toolBarRender={() =>
          [access.canMerchantCreate
            ? 
                <Button
                  type="primary"
                  key="primary"
                  onClick={() => {
                    handleModalOpen(true);
                  }}
                >
                  <PlusOutlined />{' '}
                  <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
                </Button>
            : null,
                <Button
                  type="text"
                  key="text"
                  onClick={() => {
                    actionRef.current?.reload();
                  }}
                >
                  <ReloadOutlined />
                </Button>,
          ]
        }
        request={merchant}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => <Descriptions layout="vertical" bordered>
            <Descriptions.Item label="Notify/ Callback Url">{record.notify_url}</Descriptions.Item>
            <Descriptions.Item label="Return Url">{record.return_url}</Descriptions.Item>
            <Descriptions.Item label="Payout Notify/ Callback Url">{record.payout_notify_url}</Descriptions.Item>
          </Descriptions>
        }}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        pagination={{
          showSizeChanger: true
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
          id: 'pages.searchTable.createForm.newMerchant',
          defaultMessage: 'New merchant',
        })}
        labelCol={{ span: 6 }}
        width={640}
        layout="horizontal"
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd({
            ...value,
            site_url: value['site_prefix'] + value['site_url'],
            return_url: value['return_prefix'] + value['return_url'],
            notify_url: value['notify_prefix'] + value['notify_url'],
            payout_notify_url: value['payout_notify_prefix'] + value['payout_notify_url'],
          } as API.AddMerchantItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          label="Code"
          name="code" 
          rules={[{required:true}]}
          placeholder="Unique merchant code"
        />
        <ProFormText
          label="Url"
          name="site_url"
          rules={[{required:true}]}
          placeholder="Site Url"
          fieldProps={{
            style: {
              width: 336
            }
          }}
          addonBefore={<SelectBefore name="site_prefix"/>}
        />
        <ProFormText
          label="Return"
          name="return_url"
          rules={[{required:true}]}
          placeholder="Return Url"
          fieldProps={{
            style: {
              width: 336
            }
          }}
          addonBefore={<SelectBefore name="return_prefix"/>}
        />
        <ProFormText
          label="Callback"
          name="notify_url"
          rules={[{required:true}]}
          placeholder="Callback Url"
          fieldProps={{
            style: {
              width: 336
            }
          }}
          addonBefore={<SelectBefore name="notify_prefix"/>}
        />
        <ProForm.Item label="Min Payin">
          <Flex justify='space-between' gap={40}>
            <ProFormMoney
              fieldProps={{ moneySymbol: false }}
              locale="en-US"
              initialValue={10.0}
              name="min_payin"
              placeholder="Min Payin"
            />
            <ProFormMoney
              label="Max Payin"
              fieldProps={{ moneySymbol: false }}
              locale="en-US"
              initialValue={100.0}
              name="max_payin"
              placeholder="Max Payin "
            />
          </Flex>
        </ProForm.Item>
        <ProFormMoney
          label="Commission"
          fieldProps={{ moneySymbol: false, precision: 2 }}
          locale="en-US"
          initialValue={5.0}
          name="commission"
          placeholder="Commission %"
        />
        <ProForm.Item label="Min Payout">
          <Flex justify='space-between' gap={40}>
            <ProFormMoney
              fieldProps={{ moneySymbol: false }}
              locale="en-US"
              initialValue={10.0}
              name="min_payout"
              placeholder="Min Payout"
            />
            <ProFormMoney
              label="Max Payout"
              fieldProps={{ moneySymbol: false }}
              locale="en-US"
              initialValue={100.0}
              name="max_payout"
              placeholder="Max Payout"
            />
          </Flex>
        </ProForm.Item>
        <ProFormMoney
          label="Payout Commission"
          fieldProps={{ moneySymbol: false, precision: 2 }}
          locale="en-US"
          initialValue={5.0}
          name="payout_commission"
          placeholder="Payout Commission %"
        />
        <ProFormText
          label="Payout Callback"
          name="payout_notify_url"
          rules={[{required:true}]}
          placeholder="Payout Callback Url"
          fieldProps={{
            style: {
              width: 336
            }
          }}
          addonBefore={<SelectBefore name="payout_notify_prefix"/>}
        />
        <ProFormSwitch
          label="Test Mode"
          name="is_test_mode"
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
        {currentRow?.code && (
          <ProDescriptions<API.MerchantListItem>
            column={1}
            title={currentRow?.code}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.code,
            }}
            columns={columns as ProDescriptionsItemProps<API.MerchantListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default MerchantList;
