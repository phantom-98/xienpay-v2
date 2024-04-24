import {
  addBankAcct,
  bankAcct,
  changeStatusBankAcct,
  removeBankAcct,
  updateBankAcct,
} from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormMoney,
  ProFormSwitch,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, FormattedNumber, useIntl } from '@umijs/max';
import { Button, Col, Drawer, Input, Row, Space, Switch, message } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.BankAcctListItem) => {
  const hide = message.loading('Adding');
  try {
    await addBankAcct({ ...fields });
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
    await updateBankAcct({
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
const handleRemove = async (selectedRows: API.BankAcctListItem[]) => {
  const hide = message.loading('Deleting');
  if (!selectedRows) return true;
  try {
    await removeBankAcct({
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

const TableList: React.FC = () => {
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
  const [currentRow, setCurrentRow] = useState<API.BankAcctListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.BankAcctListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.BankAcctListItem>[] = [
    {
      title: (
        <FormattedMessage id="pages.bankAcctTable.searchTable.name" defaultMessage="Rule name" />
      ),
      dataIndex: 'name',
      tip: 'The bank name is the unique key',
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
      title: (
        <FormattedMessage id="pages.bankAcctTable.searchTable.details" defaultMessage="Details" />
      ),
      dataIndex: 'ac_name',
      valueType: 'textarea',
      render: (_, record) => (
        <span>
          {record.ac_name}
          <br />
          {record.ac_no}
          <br />
          {record.ifsc}
        </span>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.bankAcctTable.searchTable.payinLimits"
          defaultMessage="Payin Limits"
        />
      ),
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
          id="pages.bankAcctTable.searchTable.upi-id"
          defaultMessage="Number of service calls"
        />
      ),
      dataIndex: 'upi_id',
    },
    {
      title: (
        <FormattedMessage
          id="pages.bankAcctTable.searchTable.remit-intent?"
          defaultMessage="Allow Intent?"
        />
      ),
      dataIndex: 'has_remit_intent',
      renderText: (val: boolean) => <Switch checked={val} />,
    },
    {
      title: (
        <FormattedMessage
          id="pages.bankAcctTable.searchTable.remit-qr?"
          defaultMessage="Show QR?"
        />
      ),
      dataIndex: 'has_remit_qr',
      renderText: (val: boolean) => <Switch checked={val} />,
    },
    {
      title: (
        <FormattedMessage
          id="pages.bankAcctTable.searchTable.remit-bank?"
          defaultMessage="Show Bank?"
        />
      ),
      dataIndex: 'has_remit_bank',
      renderText: (val: boolean) => <Switch checked={val} />,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
      dataIndex: 'is_enabled',
      render: (_, record) => (
        <Switch checked={record.is_enabled} onChange={changeStatusBankAcct(record.id)} />
      ),
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
      dataIndex: 'is_enabled',
      hideInForm: true,
      hideInTable: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.default"
              defaultMessage="Shut down"
            />
          ),
          status: 'Default',
        },
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.running" defaultMessage="Running" />
          ),
          status: 'Processing',
        },
        2: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.online" defaultMessage="Online" />
          ),
          status: 'Success',
        },
        3: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.abnormal"
              defaultMessage="Abnormal"
            />
          ),
          status: 'Error',
        },
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleUpdatedAt"
          defaultMessage="Last scheduled time"
        />
      ),
      sorter: true,
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return (
            <Input
              {...rest}
              placeholder={intl.formatMessage({
                id: 'pages.searchTable.exception',
                defaultMessage: 'Please enter the reason for the exception!',
              })}
            />
          );
        }
        return defaultRender(item);
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      hideInTable: true,
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormattedMessage id="pages.searchTable.config" defaultMessage="Configuration" />
        </a>,
        <a key="subscribeAlert" href="https://procomponents.ant.design/">
          <FormattedMessage
            id="pages.searchTable.subscribeAlert"
            defaultMessage="Subscribe to alerts"
          />
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.BankAcctListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={bankAcct}
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
                {selectedRowsState.reduce((pre, item) => pre + item.id!, 0)}{' '}
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
          id: 'pages.bankAcctTable.createform.newBankAcct',
          defaultMessage: 'New bank account',
        })}
        layout="horizontal"
        grid={true}
        submitter={{
          render: (props, doms) => {
            return (
              <Row>
                <Col span={14} offset={4}>
                  <Space>{doms}</Space>
                </Col>
              </Row>
            );
          },
        }}
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.BankAcctListItem);
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
                  id="pages.bankAcctTable.searchTable.name"
                  defaultMessage="Bank acct name is required"
                />
              ),
            },
          ]}
          label="Bank Account Nick Name"
          name="name"
          colProps={{
            span: 18,
          }}
          placeholder="Enter a nickname for this bank account"
        />
        <ProFormSwitch
          colProps={{
            span: 6,
          }}
          initialValue={false}
          label="Enabled?"
          name="is_enabled"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.bankAcctTable.searchTable.ac_name"
                  defaultMessage="Bank acct holder name is required"
                />
              ),
            },
          ]}
          label="Bank Account Holders Name"
          name="ac_name"
          placeholder="Enter the bank account holders name"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.bankAcctTable.searchTable.ac_name"
                  defaultMessage="Bank acct no is required"
                />
              ),
            },
          ]}
          label="Account No."
          width="md"
          name="ac_no"
          colProps={{ md: 12, xl: 12 }}
          placeholder="Enter the 16 digit account number"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.bankAcctTable.searchTable.ac_name"
                  defaultMessage="Bank IFSC is required"
                />
              ),
            },
          ]}
          label="IFSC Code"
          name="ifsc"
          colProps={{ md: 12, xl: 12 }}
          placeholder="Enter 16 digit IFSC code"
        />
        <ProFormText name="upi_id" label="UPI ID" placeholder="UPI ID for this bank account" />
        <ProFormSwitch
          colProps={{
            span: 8,
          }}
          initialValue={false}
          label="QR?"
          name="has_remit_qr"
        />
        <ProFormSwitch
          colProps={{
            span: 8,
          }}
          initialValue={false}
          label="Intent?"
          name="has_remit_intent"
        />
        <ProFormSwitch
          colProps={{
            span: 8,
          }}
          initialValue={false}
          label="Bank?"
          name="has_remit_bank"
        />
        <ProFormMoney
          label="Min Payin"
          name="min_payin"
          colProps={{ span: 12 }}
          fieldProps={{
            moneySymbol: false,
          }}
          locale="en-US"
          initialValue={50.0}
          min={0}
        />
        <ProFormMoney
          label="Max Payin"
          name="max_payin"
          colProps={{ span: 12 }}
          fieldProps={{
            moneySymbol: false,
          }}
          locale="en-US"
          initialValue={100.0}
          min={0}
        />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          console.log('update', value);
          const success = await handleUpdate(value);
          console.log('update1', success);
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
        {currentRow?.name && (
          <ProDescriptions<API.BankAcctListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.BankAcctListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
