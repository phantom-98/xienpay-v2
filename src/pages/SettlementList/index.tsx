import {
  acceptSettlement,
  addSettlement,
  fetchMerchantsList,
  rejectSettlement,
  removeSettlement,
  settlement,
  updateSettlement,
} from '@/services/ant-design-pro/api';
import { CheckCircleTwoTone, CloseCircleTwoTone, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormDependency,
  ProFormMoney,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, FormattedNumber, useAccess, useIntl } from '@umijs/max';
import { Button, Drawer, Input, Modal, Popconfirm, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

const ApprovalModal: React.FC<{
  placeholder: string;
  style: React.CSSProperties;
  onConfirm?: (value: string) => void;
}> = (props) => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    if (inputValue && inputValue.length > 0) {
      props.onConfirm?.(inputValue);
      setVisible(false);
      setInputValue(''); // Reset input value
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setInputValue(''); // Reset input value
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <>
      <CheckCircleTwoTone
        style={{ fontSize: '20px' }}
        twoToneColor={'#00ff00'}
        onClick={showModal}
      />
      <Modal
        title={`Confirm Approval for ID. ${props.settlementId}`}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="OK"
        cancelText="Cancel"
        visible={visible}
        centered
        width={400}
      >
        <Input
          placeholder="Enter UTR ID"
          width="sm"
          value={inputValue}
          onChange={handleInputChange}
        />
      </Modal>
    </>
  );
};

// const handleReject = async (fields: API.SettlementListItem) => {
//   rejectSettlement({id: fields.id, action: 'reject'}).then(() => { message.success('Settlement rejected!'); });
// };

function transformToAPI(item: API.AddSettlementItem): API.AddSettlementAPIItem {
  const { amount, merchant_code, method, ac_no, ac_name, ifsc, address, currency } = item;

  let result: API.AddSettlementAPIItem = {
    amount,
    merchant_code,
    method,
  };

  if (method === 'bank' && ac_no && ac_name && ifsc) {
    result.bank = { ac_no, ac_name, ifsc };
  } else if (method === 'crypto' && address && currency) {
    result.crypto = { address, currency };
  }

  return result;
}

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.AddSettlementItem) => {
  const hide = message.loading('Adding');
  try {
    await addSettlement(transformToAPI(fields));
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
    await updateSettlement({
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
const handleRemove = async (selectedRows: API.SettlementListItem[]) => {
  const hide = message.loading('Deleting...');
  if (!selectedRows) return true;
  try {
    await removeSettlement({
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

const SettlementList: React.FC = () => {
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
  const [currentRow, setCurrentRow] = useState<API.SettlementListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.SettlementListItem[]>([]);

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

  const columns: ProColumns<API.SettlementListItem>[] = [
    {
      title: <FormattedMessage id="pages.settlementTable.short_code" defaultMessage="ID" />,
      dataIndex: 'id',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.settlementTable.mcOrderId" defaultMessage="Merchant" />,
      dataIndex: 'merchant',
      valueType: 'textarea',
      valueEnum: Map.from(merchantsList, (merchant) => [merchant.value, merchant.label]),
    },
    {
      title: <FormattedMessage id="pages.settlementTable.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueEnum: {
        pending: {
          text: (
            <FormattedMessage
              id="pages.settlementTable.settlementStatus.default"
              defaultMessage="Initiated"
            />
          ),
          status: 'Default',
        },
        success: {
          text: (
            <FormattedMessage
              id="pages.settlementTable.settlementStatus.success"
              defaultMessage="Success"
            />
          ),
          status: 'Success',
        },
        failed: {
          text: (
            <FormattedMessage
              id="pages.settlementTable.settlementStatus.failed"
              defaultMessage="Failed"
            />
          ),
          status: 'Error',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.settlementTable.amount" defaultMessage="Amount" />,
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
      title: (
        <FormattedMessage id="pages.bankAcctTable.searchTable.details" defaultMessage="Details" />
      ),
      dataIndex: 'ac_name',
      valueType: 'textarea',
      render: (_, record) => (
        <span>
          {record.method_account_name}
          <br />
          {record.method_account_number}
          <br />
          {record.method_account_branch_code}
          <br />
          {record.bank_name}
        </span>
      ),
    },
    {
      title: <FormattedMessage id="pages.settlementTable.utr" defaultMessage="Method" />,
      dataIndex: 'method',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.settlementTable.utr" defaultMessage="Ref." />,
      dataIndex: 'reference_id',
      valueType: 'textarea',
    },
    {
      title: (
        <FormattedMessage id="pages.settlementTable.updatedAt" defaultMessage="Last updated" />
      ),
      dataIndex: 'updated_at',
      hideInForm: true,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) =>
        record.status === 'pending' &&
        access.canSettlementAuthorize && [
          <ApprovalModal
            key={record.id}
            settlementId={record.id}
            onConfirm={async (value) => {
              await acceptSettlement({ id: record.id, action: 'approve', ref_id: value });
              message.success(`Settlement No ${record.id} approved!`);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }}
            placeholder={'Input UTR ID'}
            style={{ width: 'md' }}
          />,
          <>
            <Popconfirm
              title="Confirm"
              description="Reject Settlement?"
              onConfirm={async () => {
                await rejectSettlement({ id: record.id, action: 'reject' });
                message.success(`Settlement No ${record.id} rejected!`);
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }}
              onOpenChange={() => console.log('open change')}
            >
              <CloseCircleTwoTone style={{ fontSize: '20px' }} twoToneColor={'#ff0000'} />
            </Popconfirm>
          </>,
        ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.SettlementListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.settlementTable.title',
          defaultMessage: 'Settlements List',
        })}
        scroll={{ x: 'max-content' }}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() =>
          [access.canSettlementCreate
            ?
                <Button
                  type="primary"
                  key="primary"
                  onClick={() => {
                    handleModalOpen(true);
                  }}
                >
                  <PlusOutlined />{' '}
                  <FormattedMessage
                    id="pages.settlementTable.new-payment-link"
                    defaultMessage="New Settlement"
                  />
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
        request={settlement}
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
          id: 'pages.searchTable.createForm.newSettlement',
          defaultMessage: 'New settlement',
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
        onFinish={async (value) => {
          const success = await handleAdd(value as API.AddSettlementItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormSelect
          width="md"
          options={merchantsList.map((merchant) => merchant.label)}
          //options={merchantsList}
          // request={fetchRolesList}
          name="merchant_code"
          label="Merchant Code"
          onChange={setMerchantCode}
        />
        <ProFormMoney
          label="Amount"
          name="amount"
          width="md"
          required={true}
          fieldProps={{ moneySymbol: false }}
          locale="en-US"
          min={1.0}
        />
        <ProFormSelect
          name="method"
          width="md"
          label={intl.formatMessage({
            id: 'pages.settlementTable.method',
            defaultMessage: 'bank',
          })}
          valueEnum={{
            bank: 'bank',
            cash: 'cash',
            crypto: 'crypto',
          }}
        />
        <ProFormDependency name={['method']}>
          {({ method }) => {
            return method === 'bank' ? (
              <>
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
                  width="md"
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
                  width="md"
                  placeholder="Enter 16 digit IFSC code"
                />
              </>
            ) : null;
          }}
        </ProFormDependency>
        <ProFormDependency name={['method']}>
          {({ method }) => {
            return method === 'crypto' ? (
              <>
                <ProFormSelect
                  name="currency"
                  width="md"
                  label={intl.formatMessage({
                    id: 'pages.settlementTable.wallet',
                    defaultMessage: 'Wallet',
                  })}
                  valueEnum={{
                    USDT: 'usdt',
                    BTC: 'bitcoin',
                    ETH: 'ethereum',
                  }}
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
                  label="Wallet Address"
                  width="md"
                  name="address"
                  placeholder="Enter the wallet address"
                />
              </>
            ) : null;
          }}
        </ProFormDependency>
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

export default SettlementList;
