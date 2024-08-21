import {
  acceptSettlement,
  addSettlement,
  fetchMerchantsList,
  rejectSettlement,
  removeSettlement,
  settlement,
  settlementAccount,
  updateSettlement,
} from '@/services/ant-design-pro/api';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
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
import { Button, Drawer, Dropdown, Form, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import { ApprovalModal, ConfirmModal, RejectModal } from '@/components/Modals';
import { utcToist } from '../../utils';

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

  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.SettlementListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.SettlementListItem[]>([]);

  const [merchantCode, setMerchantCode] = useState("");
  const [method, setMethod] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [ifsc, setIFSC] = useState("")

  const [searchData, setSearchData] = useState([]);
  const [bankNameOptions, setBankNameOptions] = useState([]);
  const [bankNumberOptions, setBankNumberOptions] = useState([]);
  const [ifscOptions, setifscOptions] = useState([]);
  const [walletOption, setWalletOption] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const res = await settlementAccount({
        current: 1,
        pageSize: 20
      }, {
        method,
        merchantCode
      });
      
      if (res.success) {
        setSearchData(res.data);
        if (method === "bank") {
          let options = res.data?.filter((acc) => acc.method === "bank_transfer" && acc.method_account_name).map(acc => acc.method_account_name);
          options = options?.filter((opt, pos) => options.indexOf(opt) === pos);
          setBankNameOptions(options);
          const ac_name = options?.length > 0 ? options[0] : null;
          setBankName(ac_name)
          form.setFieldValue('ac_name', ac_name);
        } else {
          const options = res.data?.filter(acc => acc.method === 'crypto').map(acc => acc.method_account_number)
          setifscOptions([{label: "usdt", value: "USDT"}, {label: "bitcoin", value: "BTC"}, {label: "ethereum", value: "ETH"}])
          setIFSC("USDT");
          form.setFieldValue('currency', "USDT");
          setWalletOption(options);
        }
      }
    }
    
    setBankName('');
    form.setFieldValue('ac_name', '');
    setBankNumber('');
    form.setFieldValue('ac_no', '');
    setIFSC('');
    form.setFieldValue('ifsc', '');
    if (merchantCode && method) {
      fetchOptions();
    }
  }, [merchantCode, method])

  useEffect(() => {
    if (searchData.length > 0) {
      const option = searchData.filter((acc) => acc.method === (method==="bank"?"bank_transfer":"crypto") && acc.method_account_name === bankName).map(acc => ({
        number: acc.method_account_number,
        code: acc.method_account_branch_code
      }));
      setBankNumberOptions(option.map(item => item.number))
      const num = option?.length > 0 ? option[0].number : null;
      setBankNumber(num);
      form.setFieldValue('ac_no', num);
      setifscOptions(option.map(item => item.code))
      // const code = option?.length > 0 ? option[0].code : null;
      // setIFSC(code);
      // form.setFieldValue('ac_no', code);
    }
  }, [bankName])

  useEffect(() => {
    if (bankNumber && method === 'bank') {
      const index = bankNumberOptions.findIndex(num => num === bankNumber);
      if (ifscOptions[index] !== ifsc) {
        setIFSC(ifscOptions[index]);
        form.setFieldValue('ifsc', ifscOptions[index]);
      }
    }
  }, [bankNumber])

  useEffect(() => {
    if (ifsc) {
      if (method === 'bank') {
        const index = ifscOptions.findIndex(code => code === ifsc);
        if (bankNumberOptions[index] !== bankNumber) {
          setBankNumber(bankNumberOptions[index]);
          form.setFieldValue('ac_no', bankNumberOptions[index]);
        }
      } else {
        const option = walletOption.filter(w => (ifsc !== 'BTC') === w?.startsWith("0x"));
        setBankNumberOptions(option)
        const num = option?.length > 0 ? option[0] : null;
        setBankNumber(num);
        form.setFieldValue('address', num);
      }
    }
  }, [ifsc])

  const [approve, setApprove] = useState(false);
  const [reject, setReject] = useState(false);
  const [reset, setReset] = useState(false);
  const [settlementId, setSettlementId] = useState("");

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
        <FormattedMessage id="pages.settlementTable.updatedAt" defaultMessage="Last updated (IST)" />
      ),
      dataIndex: 'updated_at',
      hideInForm: true,
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record) => <span>{utcToist(record.updated_at)}</span>,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) =>
        access.canSettlementAuthorize && (
          record.status === 'pending' ? [
            <Dropdown.Button menu={{
              items: [
                {
                  label: "Approve",
                  key: "approve"
                },
                {
                  label: "Reject",
                  key: "reject"
                },
              ],
              onClick: async (e) => {
                e.key === 'approve' ? setApprove(true) : setReject(true)
              }
            }} onClick={ async (e) => {
              setSettlementId(record.id)
              setApprove(true)
            }} type='primary'>Approve</Dropdown.Button>
          ] : record.status === 'success' ? [
            <Button onClick={() => {
              setSettlementId(record.id)
              setReset(true)
            }}>Reset</Button>
          ] : null
        )
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
        rowKey="id"
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
      {createModalOpen && (
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
          form={form}
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
            initialValue={selectedRowsState[selectedRowsState.length-1]?.merchant}
            onChange={setMerchantCode}
          />
          <ProFormMoney
            label="Amount"
            name="amount"
            width="md"
            required={true}
            fieldProps={{ moneySymbol: false }}
            locale="en-US"
          />
          <ProFormSelect
            name="method"
            width="md"
            label={intl.formatMessage({
              id: 'pages.settlementTable.method',
              defaultMessage: 'bank',
            })}
            initialValue={selectedRowsState[selectedRowsState.length-1]?.method}
            onChange={setMethod}
            valueEnum={{
              bank: 'bank',
              cash: 'cash',
              aed: 'aed',
              crypto: 'crypto',
            }}
          />
          <ProFormDependency name={['method']}>
            {({ method }) => {
              return method === 'bank' ? (
                <>
                  <ProFormSelect
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
                    showSearch
                    onChange={setBankName}
                    options={bankNameOptions}
                    label="Bank Account Holders Name"
                    name="ac_name"
                    width="md"
                    placeholder="Enter the bank account holders name"
                  />
                  <ProFormSelect
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
                    onChange={setBankNumber}
                    options={bankNumberOptions}
                    label="Account No."
                    width="md"
                    name="ac_no"
                    placeholder="Enter the 16 digit account number"
                  />
                  <ProFormSelect
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
                    onChange={setIFSC}
                    options={ifscOptions}
                    label="IFSC Code"
                    name="ifsc"
                    width="md"
                    placeholder="Enter 16 digit IFSC code"
                  />
                </>
              ) : method === 'crypto' ? (
                <>
                  <ProFormSelect
                    name="currency"
                    width="md"
                    label={intl.formatMessage({
                      id: 'pages.settlementTable.wallet',
                      defaultMessage: 'Wallet',
                    })}
                    onChange={setIFSC}
                    valueEnum={{
                      USDT: 'usdt',
                      BTC: 'bitcoin',
                      ETH: 'ethereum',
                    }}
                  />
                  <ProFormSelect
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
                    onChange={setBankNumber}
                    options={bankNumberOptions}
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
      )}
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
      <ApprovalModal
        key={settlementId}
        visible={approve}
        setVisible={setApprove}
        Id={settlementId}
        settlement
        onConfirm={async (_, value) => {
          await acceptSettlement({ id: settlementId, action: 'approve', ref_id: value });
          message.success(`Settlement No ${settlementId} approved!`);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
        placeholder={'Input UTR ID'}
        style={{ width: 'md' }}
      />
      <RejectModal
        visible={reject}
        setVisible={setReject}
        Id={settlementId}
        onConfirm={async (value) => {
          await rejectSettlement({ id: settlementId, action: 'reject', reason: value});
          message.success(`Settlement No ${settlementId} rejected!`);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
        style={{ width: 'md' }}
      >
      </RejectModal>
      <ConfirmModal
        title={"Confirm Reset for ID. "}
        description="Reset Settlement?"
        visible={reset}
        setVisible={setReset}
        Id={settlementId}
        onConfirm={async () => {
          await rejectSettlement({ id: settlementId, action: 'reset' });
          message.success(`Settlement No ${settlementId} reset!`);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      >
      </ConfirmModal>
    </PageContainer>
  );
};

export default SettlementList;
