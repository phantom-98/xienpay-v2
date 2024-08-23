import {
    addSettlementAccount,
    fetchMerchantsList,
    removeSettlementAccount,
    settlementAccount,
    updateSettlementAccount,
  } from '@/services/ant-design-pro/api';
  import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
  import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
  import {
    ModalForm,
    PageContainer,
    ProDescriptions,
    ProFormDependency,
    ProFormSelect,
    ProFormText,
    ProTable,
  } from '@ant-design/pro-components';
  import { FormattedMessage, useAccess, useIntl } from '@umijs/max';
  import { Button, Drawer, message } from 'antd';
  import React, { useEffect, useRef, useState } from 'react';
  import type { FormValueType } from './components/UpdateForm';
  import UpdateForm from './components/UpdateForm';
  import { utcToist } from '../../utils';
  
  function transformToAPI(item) {
    const { name, merchant_code, method, ac_no, ac_name, ifsc, address, currency } = item;
  
    let result = {
      merchant_code,
      method,
      name
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
      await addSettlementAccount(transformToAPI(fields));
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
      await updateSettlementAccount({
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
        hideInSearch: true,
      },
      {
        title: <FormattedMessage id="pages.settlementTable.nickname" defaultMessage="Nick Name" />,
        dataIndex: 'name',
        valueType: 'textarea',
      },
      {
        title: <FormattedMessage id="pages.settlementTable.mcOrderId" defaultMessage="Merchant" />,
        dataIndex: 'merchant',
        valueType: 'textarea',
        valueEnum: Map.from(merchantsList, (merchant) => [merchant.value, merchant.label]),
      },
      {
        title: <FormattedMessage id="pages.settlementAccountTable.utr" defaultMessage="Instrument Type" />,
        dataIndex: 'method',
        valueType: 'textarea',
      },
      {
        title: <FormattedMessage id="pages.settlementAccountTable.utr" defaultMessage="Account Name" />,
        dataIndex: 'method_account_name',
        valueType: 'textarea',
        hideInSearch: true,
      },
      {
        title: <FormattedMessage id="pages.settlementAccountTable.utr" defaultMessage="Account Number" />,
        dataIndex: 'method_account_number',
        valueType: 'textarea',
        hideInSearch: true,
      },
      {
        title: <FormattedMessage id="pages.settlementAccountTable.utr" defaultMessage="IFSC Code" />,
        dataIndex: 'method_account_branch_code',
        valueType: 'textarea',
        hideInSearch: true,
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
      }
    ];
  
    return (
      <PageContainer>
        <ProTable<API.SettlementListItem, API.PageParams>
          headerTitle={intl.formatMessage({
            id: 'pages.settlementAccountTable.title',
            defaultMessage: 'Account List',
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
                      id="pages.settlementAccountTable.new"
                      defaultMessage="New Account"
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
          request={settlementAccount}
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
        
        {createModalOpen && (
          <ModalForm
            title={intl.formatMessage({
              id: 'pages.searchTable.createForm.newAccount',
              defaultMessage: 'New account',
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
            <ProFormText
                name="name"
                label="Nick Name"
                width="md"
            />
            <ProFormSelect
              width="md"
              options={merchantsList.map((merchant) => merchant.label)}
              name="merchant_code"
              label="Merchant Code"
              initialValue={selectedRowsState[selectedRowsState.length-1]?.merchant}
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
              title={<p>Account ID. {currentRow?.id}</p>}
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
  