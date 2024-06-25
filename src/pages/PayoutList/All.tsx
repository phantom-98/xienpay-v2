import {
    acceptPayout,
    addPayout,
    fetchMerchantsList,
    fetchPlayerList,
    payout,
    rejectPayout,
    removePayout,
    updatePayout,
  } from '@/services/ant-design-pro/api';
  import { CheckCircleTwoTone, CloseCircleTwoTone, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
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
  import { Button, Drawer, Dropdown, Input, Modal, Popconfirm, Select, message } from 'antd';
  import React, { useEffect, useRef, useState } from 'react';
  import type { FormValueType } from './components/UpdateForm';
  import UpdateForm from './components/UpdateForm';
  import { ApprovalModal, ConfirmModal, RejectModal } from '@/components/Modals';
  import { response } from 'express';
  import { utcToist } from '../../utils';

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
        if (data.length > 0) {
          setData(data);
        } else {
          setData([{label: newValue, value: newValue}]);
        }
      });
    };

    useEffect(() => {
      handleSearch("");
    }, [props.merchantCode])

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

  // const handleReject = async (fields: API.PayoutListItem) => {
  //   rejectPayout({id: fields.id, action: 'reject'}).then(() => { message.success('Payout rejected!'); });
  // };

  /**
   * @en-US Add node
   * @zh-CN 添加节点
   * @param fields
   */
  const handleAdd = async (fields: API.PaymentLinkResponse) => {
    const hide = message.loading('Adding');
    try {

      const response = await addPayout({ ...fields, merchant_order_id: crypto.randomUUID().toString() });
      hide();
      const { payoutUrl } = response;
      if (payoutUrl !== null && payoutUrl !== undefined) {
        navigator.clipboard.writeText(payoutUrl).then(
          () => {
            message.success('Payment link copied to clipboard!');
          },
          (err) => {
            message.error('Failed to copy: ', err);
          },
        );
        Modal.success({
          content: payoutUrl,
          width: 1000,
          title: 'Payment Link',
        });
      }
      return true;
    } catch (error) {
      hide();
      message.error(error.response.data.message);
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
      await updatePayout({
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
  const handleRemove = async (selectedRows: API.PayoutListItem[]) => {
    const hide = message.loading('Deleting...');
    if (!selectedRows) return true;
    try {
      await removePayout({
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

  const PayoutList: React.FC = () => {
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
    const [currentRow, setCurrentRow] = useState<API.PayoutListItem>();
    const [selectedRowsState, setSelectedRows] = useState<API.PayoutListItem[]>([]);

    const [merchantCode, setMerchantCode] = useState('');
    const [approve, setApprove] = useState(false);
    const [reject, setReject] = useState(false);
    const [reset, setReset] = useState(false);
    const [payoutId, setPayoutId] = useState("");

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

    const columns: ProColumns<API.PayoutListItem>[] = [
      {
        title: <FormattedMessage id="pages.payoutTable.short_code" defaultMessage="ID" />,
        dataIndex: 'id',
        valueType: 'textarea',
      },
      {
        title: (
          <FormattedMessage id="pages.payoutTable.mcOrderId" defaultMessage="Merchant Order ID" />
        ),
        dataIndex: 'merchant_order_id',
        valueType: 'textarea',
      },
      {
        title: <FormattedMessage id="pages.payoutTable.mcOrderId" defaultMessage="Merchant" />,
        dataIndex: 'merchant',
        valueType: 'textarea',
        valueEnum: Map.from(merchantsList, (merchant) => [merchant.value, merchant.label]),
      },
      {
        title: <FormattedMessage id="pages.payoutTable.agent" defaultMessage="User" />,
        dataIndex: 'user_id',
        valueType: 'textarea',
      },
      {
        title: <FormattedMessage id="pages.payoutTable.status" defaultMessage="Status" />,
        dataIndex: 'status',
        valueEnum: {
          initiated: {
            text: (
              <FormattedMessage
                id="pages.payoutTable.payoutStatus.default"
                defaultMessage="Initiated"
              />
            ),
            status: 'Default',
          },
          success: {
            text: (
              <FormattedMessage
                id="pages.payoutTable.payoutStatus.success"
                defaultMessage="Success"
              />
            ),
            status: 'Success',
          },
          failed: {
            text: (
              <FormattedMessage id="pages.payoutTable.payoutStatus.failed" defaultMessage="Failed" />
            ),
            status: 'Error',
          },
        },
      },
      {
        title: <FormattedMessage id="pages.payoutTable.amount" defaultMessage="Amount" />,
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
            {record.account_number}
            <br />
            {record.account_holder_name}
            <br />
            {record.ifsc_code}
            <br />
            {record.bank_name}
          </span>
        ),
      },
      {
        title: (
          <FormattedMessage
            id="pages.payoutTable.updateForm.payoutName.nameLabel"
            defaultMessage="Payout UUID"
          />
        ),
        dataIndex: 'uuid',
        tip: 'The payout uuid is the unique key',
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
      // {
      //   title: <FormattedMessage id="pages.payoutTable.utr" defaultMessage="UTR" />,
      //   dataIndex: 'utr_id',
      //   valueType: 'textarea',
      // },
      {
        title: <FormattedMessage id="pages.payoutTable.updatedAt" defaultMessage="Last updated (IST)" />,
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
          access.canPayoutAuthorize && (
            record.status == 'initiated' ? [
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
                  setPayoutId(record.id)
                  e.key === 'approve' ? setApprove(true) : setReject(true)
                }
              }} onClick={ async (e) => {
                setPayoutId(record.id)
                setApprove(true)
              }} type='primary'>Approve</Dropdown.Button>
            ] : (record.status === 'success' || record.status === 'failed') ? [
              <Button onClick={() => {
                setPayoutId(record.id)
                setReset(true)
              }}>Reset</Button>
            ] : null
          )
      },
    ];

    return (
      <PageContainer>
        <ProTable<API.PayoutListItem, API.PageParams>
          headerTitle={intl.formatMessage({
            id: 'pages.payoutTable.inProgress',
            defaultMessage: 'In Progress',
          })}
          scroll={{ x: 'max-content' }}
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 120,
          }}
          toolBarRender={() =>
            [access.canPayoutCreate
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
                      id="pages.payoutTable.new-payment-link"
                      defaultMessage="New Payout"
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
          request={payout}
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
            id: 'pages.searchTable.createForm.newPayout',
            defaultMessage: 'New payout',
          })}
          open={createModalOpen}
          onOpenChange={handleModalOpen}
          layout="horizontal"
          labelCol={{
            span: 10,
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
          width={500}
        >
          <ProFormSelect
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.payoutMerchant_code"
                    defaultMessage="Merchant Code is required"
                  />
                ),
              },
            ]}
            options={merchantsList.map((merchant) => merchant.label)}
            name="merchant_code"
            label="Merchant Code"
            onChange={setMerchantCode}
            style={{ width: '100%'}}
          />
          <ProForm.Item
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.payoutUser_id"
                    defaultMessage="User ID is required"
                  />
                ),
              },
            ]}
            name="user_id" label="User ID(Account)" valuePropName="value" style={{ width: '100%'}}>
            <SearchUserInput
              merchantCode={merchantCode}
              placeholder="Search user id"
              style={{width: 'md'}}
            />
          </ProForm.Item>
          <ProFormText
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.payoutAc_no"
                    defaultMessage="Account number is required"
                  />
                ),
              },
            ]}
            name="ac_no"
            label="Account Number"
            placeholder="Account number"
            style={{ width: '100%'}}
          />
          <ProFormText
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.payoutAc_name"
                    defaultMessage="Account name is required"
                  />
                ),
              },
            ]}
            name="ac_name"
            label="Account holder name"
            placeholder="Account name"
            style={{ width: '100%'}}
          />
          <ProFormText
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.payoutifsc"
                    defaultMessage="IFSC is required"
                  />
                ),
              },
            ]}
            name="ifsc"
            label="IFSC code"
            placeholder="IFSC code"
            style={{ width: '100%'}}
          />

          <ProFormMoney
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.payoutAmount"
                    defaultMessage="Amount is required"
                  />
                ),
              },
            ]}
            label="Amount"
            name="amount"
            fieldProps={{ moneySymbol: false }}
            locale="en-US"
            min={100}
            placeholder="Amount"
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
            <ProDescriptions<API.PayoutListItem>
              column={1}
              title={<p>Payout ID. {currentRow?.id}</p>}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.id,
              }}
              columns={columns as ProDescriptionsItemProps<API.PayoutListItem>[]}
            />
          )}
        </Drawer>
        <ApprovalModal
          key={payoutId}
          visible={approve}
          setVisible={setApprove}
          Id={payoutId}
          onConfirm={async (method, value) => {
            await acceptPayout({ id: payoutId, action: 'approve', method, utr_id: value });
            message.success(`Payout No ${payoutId} approved!`);
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
          Id={payoutId}
          onConfirm={async (value) => {
            await rejectPayout({ id: payoutId, action: 'reject', reason: value});
            message.success(`Payout No ${payoutId} rejected!`);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
          style={{ width: 'md' }}
        >
        </RejectModal>
        <ConfirmModal
          visible={reset}
          setVisible={setReset}
          Id={payoutId}
          title="Confirm Reset for ID. "
          description="Reset Payout?"
          onConfirm={async () => {
            await rejectPayout({ id: payoutId, action: 'reset' });
            message.success(`Payout No ${payoutId} reset!`);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        >
        </ConfirmModal>
      </PageContainer>
    );
  };

  export default PayoutList;
