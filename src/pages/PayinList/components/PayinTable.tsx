import { useState, useEffect, useRef } from 'react';
import { confirmNotified, fetchMerchantsList, fetchPlayerList, generatePaymentLink, generatePermaPaymentLink, getPresignedURL, payin, removePayin, updatePayin } from "@/services/ant-design-pro/api";
import { ActionType, FooterToolbar, ModalForm, PageContainer, ProColumns, ProDescriptions, ProDescriptionsItemProps, ProFormDependency, ProFormMoney, ProFormSelect, ProFormSwitch, ProFormText, ProTable } from "@ant-design/pro-components"
import { Button, Drawer, Dropdown, message, Modal, Tag } from "antd";
import UpdateForm, { FormValueType } from "./UpdateForm";
import { FormattedMessage, FormattedNumber, useAccess, useIntl } from '@umijs/max';
import { BellOutlined, CheckCircleOutlined, ExclamationCircleOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import { utcToist, validateRequest } from '@/utils';

type PayinType = {
  type: 'all' | 'progress' | 'drop' | 'success'
};


const PayinTable: React.FC<PayinType> = ({ type = 'all'}) => {

  /**
   * @en-US Add node
   * @zh-CN 添加节点
   * @param fields
   */
  const handleAdd = async (fields: API.PaymentLinkItem) => {
    const hide = message.loading('Adding');
    try {
      let payinUrl: string | undefined = '';
      if (fields.one_time_paylink === true) {
        const response = await generatePaymentLink({
          ...fields,
          merchant_order_id: crypto.randomUUID().toString(),
        });
        payinUrl = response.payinUrl;
      } else {
        const response = await generatePermaPaymentLink({
          ...fields,
        });
        payinUrl = response.permalink;
      }
  
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
  const [userImage, setUserImage] = useState('');

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
      order: 1,
    },
    type === 'drop' ? {
      title: <FormattedMessage id="pages.payinTable.amount" defaultMessage="Amount" />,
      dataIndex: 'amount',
      order: 2,
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
    } : null,
    type !== 'drop' ? {
      title: <FormattedMessage id="pages.payinTable.short_code" defaultMessage="Code" />,
      dataIndex: 'short_code',
      valueType: 'textarea',
      copyable: true,
    } : null,
    type !== 'drop' ? {
      title: <FormattedMessage id="pages.payinTable.amount" defaultMessage={type === 'all' ? "Confirmed" : "Amount"} />,
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
      order: 2,
    } : null,
    ...(type === 'all' ? [
      {
        title: (
          <FormattedMessage id="pages.payinTable.mcOrderId" defaultMessage="Merchant Order ID" />
        ),
        dataIndex: 'merchant_order_id',
        valueType: 'textarea',
        copyable: true,
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
        title: <FormattedMessage id="pages.payinTable.bank" defaultMessage="Bank" />,
        dataIndex: 'bank',
        valueType: 'textarea',
      },
      {
        title: <FormattedMessage id="pages.payinTable.status" defaultMessage="Status" />,
        dataIndex: 'status',
        hideInTable: true,
        valueEnum: {
          initiated: { text: 'Initiated', status: 'Default' },
          assigned: { text: 'Assigned', status: 'Processing' },
          pending: { text: 'Pending', status: 'Warning' },
          success: { text: 'Success', status: 'Success' },
          failed: { text: 'Failed', status: 'Error' },
          dropped: { text: 'Dropped', status: 'Error' },
          dispute: { text: 'Dispute', status: 'Error' },
          duplicate: { text: 'Duplicate', status: 'Error' },
        },
      },
    ] : []),
    {
      title: <FormattedMessage id="pages.payinTable.status" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInSearch: true,
      render: (status, record) => {
        const statusMap = {
          initiated: (
            <Tag color="default">
              <FormattedMessage
                id="pages.payinTable.payinStatus.default"
                defaultMessage="Initiated"
              />
            </Tag>
          ),
          assigned: (
            <Tag icon={<SyncOutlined spin />} color="processing">
              <FormattedMessage
                id="pages.payinTable.payinStatus.assigned"
                defaultMessage="Assigned"
              />
            </Tag>
          ),
          pending: (
            <Tag color="orange">
              <FormattedMessage
                id="pages.payinTable.payinStatus.pending"
                defaultMessage="Pending"
              />
            </Tag>
          ),
          success: (
            <>
              {status === 'success' && !record.is_notified ? (
                <>
                  <Tag color="success">
                    <FormattedMessage
                      id="pages.payinTable.payinStatus.success"
                      defaultMessage="Success"
                    />
                  </Tag>
                  <Button
                    type="primary"
                    size="small"
                    onClick={async () => {
                      await confirmNotified(record);
                      actionRef.current?.reloadAndRest?.();
                    }}
                  >
                    <BellOutlined />
                  </Button>
                </>
              ) : (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  <FormattedMessage
                    id="pages.payinTable.payinStatus.success"
                    defaultMessage="Success"
                  />
                </Tag>
              )}
            </>
          ),
          failed: (
            <Tag icon={<ExclamationCircleOutlined />} color="warning">
              <FormattedMessage id="pages.payinTable.payinStatus.failed" defaultMessage="Failed" />
            </Tag>
          ),
          dropped: (
            <Tag color="red">
              <FormattedMessage
                id="pages.payinTable.payinStatus.dropped"
                defaultMessage="Dropped"
              />
            </Tag>
          ),
          dispute: (
            <Tag icon={<ExclamationCircleOutlined />} color="#f50">
              <FormattedMessage
                id="pages.payinTable.payinStatus.dispute"
                defaultMessage="Dispute"
              />
            </Tag>
          ),
          duplicate: (
            <Tag icon={<ExclamationCircleOutlined />} color="#f05">
              <FormattedMessage
                id="pages.payinTable.payinStatus.duplicate"
                defaultMessage="Duplicate"
              />
            </Tag>
          ),
        };

        // Return the component corresponding to the status
        return statusMap[status] || null;
      },
    },
    {
      title: <FormattedMessage id="pages.payinTable.utr" defaultMessage="Dur" />,
      dataIndex: 'time_taken',
      valueType: 'textarea',
      order: 6,
      hideInTable: type === 'drop' || type === 'progress'
    },
    ...(type !== 'all' ? [
      {
        title: <FormattedMessage id="pages.payinTable.agent" defaultMessage="User" />,
        dataIndex: 'user_id',
        valueType: 'textarea',
        order: 4,
      },
      {
        title: <FormattedMessage id="pages.payinTable.mcOrderId" defaultMessage="Merchant" />,
        dataIndex: 'merchant',
        valueType: 'textarea',
        valueEnum: Map.from(merchantsList, (merchant) => [merchant.value, merchant.label]),
        order: 5,
      },
      type === 'success' ? {
        title: <FormattedMessage id="pages.payinTable.utr" defaultMessage="UTR" />,
        dataIndex: 'utr_id',
        valueType: 'textarea',
        order: 7,
        render: (_, record) => (<div style={{
          display: "flex",
          gap: "6px",
        }}>
          <span>{record.utr_id}</span>
          {
            record.user_submitted_image && <PictureOutlined onClick={async () => {
              const url = await getPresignedURL(record.id);
              setUserImage(url?.url);
            }} style={{
              cursor: "pointer"
             }}/>
          }
        </div>)
      } : {
        title: <FormattedMessage id="pages.payinTable.utr" defaultMessage="UTR" />,
        dataIndex: 'utr_id',
        valueType: 'textarea',
        order: 7,
        hideInTable: true,
      },
      {
        title: (
          <FormattedMessage id="pages.payinTable.mcOrderId" defaultMessage="Merchant Order ID" />
        ),
        dataIndex: 'merchant_order_id',
        valueType: 'textarea',
        copyable: true,
        order: 8,
      },
      {
        title: <FormattedMessage id="pages.payinTable.bank" defaultMessage="Bank" />,
        dataIndex: 'bank',
        valueType: 'textarea',
      },
    ] : []),
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
      copyable: true,
      order: 9,
    },
    ...(type === 'all' ? [
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
        title: <FormattedMessage id="pages.payinTable.agent" defaultMessage="Agent" />,
        dataIndex: 'agent',
        valueType: 'textarea',
      },
      {
        title: <FormattedMessage id="pages.payinTable.utr" defaultMessage="UTR" />,
        dataIndex: 'utr_id',
        valueType: 'textarea',
        render: (_, record) => (<div style={{
          display: "flex",
          gap: "6px",
        }}>
          <span>{record.utr_id}</span>
          {
            record.user_submitted_image && <PictureOutlined onClick={async () => {
              const url = await getPresignedURL(record.id);
              setUserImage(url?.url);
            }} style={{
              cursor: "pointer"
             }}/>
          }
        </div>)
      },
      {
        title: <FormattedMessage id="pages.payinTable.agent" defaultMessage="User Submitted UTR" />,
        dataIndex: 'user_submitted_utr',
        valueType: 'textarea',
        hideInSearch: true,
      },
    ] : []),
    {
      title: <FormattedMessage id="pages.payinTable.updatedAt" defaultMessage="Last updated (IST)" />,
      dataIndex: 'updated_at',
      hideInForm: true,
      valueType: 'dateTime',
      hideInSearch: true,
      order: 10,
      render: (_, record) => <span>{utcToist(record.updated_at)}</span>,
    },
  ].filter(item => item);

  const [messageApi, contextHolder] = message.useMessage();

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<API.PayinListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.payinTable.' + type === 'all' ? 'title' : type === 'progress' ? 'inProgress' : type === 'drop' ? 'dropped' : 'completed',
          defaultMessage: type === 'all' ? 'Payins List' : type === 'progress' ? 'In Progress' : type === 'drop' ? 'Dropped' : 'Completed',
        })}
        scroll={{ x: 'max-content' }}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() =>
          [(type === 'all' || type === 'progress') && access.canPayinLinkCreate
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
                id="pages.payinTable.new-payment-link"
                defaultMessage="New Payment Link"
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
        request={async (req) => {
          const res = validateRequest(req);
          if (typeof res === 'string') {
            messageApi.error(res);
            throw new Error(res)
          }
          else {
            switch (type) {
              case 'all':
                return await payin(res);
              case 'progress':
                return await payin({...res, status: 'assigned'});
              case 'drop':
                return await payin({...res, status: 'dropped'});
              case 'success':
                return await payin({...res, status: 'success'});
            }
          }
        }}
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
          {type === 'drop' ? (
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
                {
                  label: "Delete",
                  key: "delete"
                },
              ],
              onClick: async (e) => {
                console.log("on click", e)
              }
            }} onClick={ async (e) => {
              console.log("button click", e)
            }} type='primary'>Approve</Dropdown.Button>
          ) : (
            <>
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
            </>
          )}
        </FooterToolbar>
      )}
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.newPayin',
          defaultMessage: 'New payment link',
        })}
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        layout="horizontal"
        labelCol={{
          span: 10,
        }}
        wrapperCol={{
          span: 14,
        }}
        labelAlign="left"
        onFinish={async (value) => {
          const success = await handleAdd(value as API.PaymentLinkItem);
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
          style={{width: "100%"}}
        />
        <ProFormSelect
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
          name="user_id"
          label="User ID"
          placeholder="Search user id"
          request={ async (e) => {
            if (merchantCode && e.keyWords) {
              return fetchPlayerList(merchantCode, e.keyWords).then((data: any) => {
                if (data.length > 0) {
                  return data;
                } else {
                  return [{ label: e.keyWords, value: e.keyWords }];
                }
              });
            } else return null;
          }}
        />
        <ProFormSwitch
          colProps={{
            span: 8,
          }}
          initialValue={false}
          label="One time payment link?"
          name="one_time_paylink"
        />
        <ProFormDependency name={['one_time_paylink']}>
          {({ one_time_paylink }) => {
            return one_time_paylink === true ? (
              <>
                <ProFormText
                  name="user_email"
                  label="Email"
                  placeholder="Optional user email"
                  style={{ width: '100%'}}
                />
                <ProFormText
                  name="user_phone_number"
                  label="User Phone #"
                  placeholder="Optional user phone"
                  style={{ width: '100%'}}
                />
                <ProFormMoney
                  label="Amount"
                  name="amount"
                  fieldProps={{ moneySymbol: false }}
                  locale="en-US"
                  min={0}
                  placeholder="Optional amount"
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

      {(type === 'all' || type === 'success') && (
        <div style={{
          position: "fixed",
          top: "0",
          bottom: "0",
          left: "0",
          right: "0",
          transition: "display 0.2s ease",
          display: userImage ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          background: "#111d",
          zIndex: "100",
        }} onClick={() => setUserImage('')}>
          <img src={userImage} style={{
            maxWidth: "72vw",
            maxHeight: "80vh"
          }}/>
        </div>
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
  )
}

export default PayinTable;