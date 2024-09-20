import { acceptPayout, addPayout, downloadPayoutAsExcel, fetchMerchantsList, fetchPlayerList, rejectPayout, removePayout, updatePayout } from '@/services/ant-design-pro/api';
import { Button, Drawer, Dropdown, message, Modal } from 'antd';
import { useState, useEffect, useRef } from 'react';
import UpdateForm, { FormValueType } from './UpdateForm';
import { ActionType, FooterToolbar, ModalForm, PageContainer, ProColumns, ProDescriptions, ProDescriptionsItemProps, ProFormMoney, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, FormattedNumber, useAccess, useIntl } from '@umijs/max';
import { utcToist, validateRequest } from '@/utils';
import { DownloadOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { ApprovalModal, ConfirmModal, RejectModal } from '@/components/Modals';


type PayoutType = {
    title: string,
    defaultTitle: string,
    table: string[],
    search: string[],
    download?: boolean,
    createPayout?: boolean,
    action?: boolean,
    confirm?: boolean,
    uuid?: boolean,
    reversed?: boolean,
    payout: (parems: API.PageParams & {
        pageSize?: number;
        current?: number;
        keyword?: string;
    }) => Promise<API.PayoutList>
}

const PayoutTable: React.FC<PayoutType> = ({title, defaultTitle, table, search, download = false, createPayout = false, action = false, confirm = false, uuid = false, reversed = false, payout}) => {
    /**
     * @en-US Add node
     * @zh-CN 添加节点
     * @param fields
     */
    const handleAdd = async (fields: API.PaymentLinkResponse) => {
        const hide = message.loading('Adding');
        try {
    
            const response = await addPayout(uuid ? {...fields} : { ...fields, merchant_order_id: crypto.randomUUID().toString() });
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
    const [downloadModalOpen, handleDownloadModalOpen] = useState<boolean>(false);

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
                reversed: reversed ? {
                    text: (
                        <FormattedMessage id="pages.payoutTable.payoutStatus.reversed" defaultMessage="Reversed" />
                    ),
                    status: 'Error',
                } : undefined,
            },
        },
        {
            title: <FormattedMessage id="pages.payinTable.utr" defaultMessage="Dur" />,
            dataIndex: 'time_taken',
            valueType: 'textarea',
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
            title: <FormattedMessage id="pages.payinTable.commission" defaultMessage="Commission" />,
            dataIndex: 'commission',
            render: (_, record) => (
              <span>
                ₹
                <FormattedNumber
                  value={record.commission}
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
                <FormattedMessage id="pages.bankAcctTable.searchTable.ac_name" defaultMessage="Account Name" />
            ),
            dataIndex: 'account_holder_name',
            valueType: 'textarea',
        },
        {
            title: (
                <FormattedMessage id="pages.bankAcctTable.searchTable.ac_no" defaultMessage="Account Number" />
            ),
            dataIndex: 'account_number',
            valueType: 'textarea',
        },
        {
            title: (
              <FormattedMessage id="pages.bankAcctTable.searchTable.bank_name" defaultMessage="Bank Name" />
            ),
            dataIndex: 'bank_name',
            valueType: 'textarea',
        },
        {
            title: (
              <FormattedMessage id="pages.payoutTable.utr" defaultMessage="UTR Id" />
            ),
            dataIndex: 'utr_id',
            valueType: 'textarea',
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
        {
            title: <FormattedMessage id="pages.payoutTable.updatedAt" defaultMessage="Last updated (IST)" />,
            dataIndex: 'updated_at',
            valueType: 'dateTime',
            render: (_, record) => <span>{utcToist(record.updated_at)}</span>,
        },
        {
            title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
            dataIndex: 'option',
            valueType: 'option',
            render: (_, record) =>
              access.canPayoutAuthorize && (
                record.status === 'initiated' ? [
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
                            if (e.key === 'approve')
                                setApprove(true)
                            else setReject(true)
                        }
                    }} onClick={ async (e) => {
                        setPayoutId(record.id)
                        setApprove(true)
                    }} type='primary' key='approve'>Approve</Dropdown.Button>
                ] : (record.status === 'success' || record.status === 'failed' || record.status === 'reversed') ? [
                    <Button onClick={() => {
                        setPayoutId(record.id)
                        setReset(true)
                    }} key='reset'>Reset</Button>
                ] : null
            )
        },
    ].map(item => {
        const hideInSearch = !search.includes(item.dataIndex);
        const hideInTable = !table.includes(item.dataIndex);
        return {
          ...item,
          hideInSearch,
          hideInTable,
          order: hideInSearch ? 0 : search.length - search.indexOf(item.dataIndex),
          sort: hideInTable ? 0 : table.length - table.indexOf(item.dataIndex),
        };
      }).filter(item => !item.hideInSearch || !item.hideInTable).sort((a, b) => (b.sort - a.sort));

    const [messageApi, contextHolder] = message.useMessage();

    return (
        <PageContainer>
            {contextHolder}
            <ProTable<API.PayoutListItem, API.PageParams>
                headerTitle={intl.formatMessage({
                    id: title,
                    defaultMessage: defaultTitle,
                })}
                scroll={{ x: 'max-content' }}
                actionRef={actionRef}
                rowKey="id"
                search={{
                    labelWidth: 120,
                }}
                toolBarRender={() => [
                    download && access.canPayoutPendingDownload
                    ?
                        <Button
                            key="second"
                            onClick={() => {
                                handleDownloadModalOpen(true);
                            }}
                        >
                            <DownloadOutlined />{' '}
                            <FormattedMessage
                                id="pages.payoutTable.download"
                                defaultMessage="Download as excel"
                            />
                        </Button>
                    : null,
                    createPayout && access.canPayoutCreate
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
                request={async (req) => {
                    const res = validateRequest(req);
                    if (typeof res === 'string') {
                        messageApi.error(res);
                        throw new Error(res)
                    }
                    else {
                        return await payout(res);
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
                <FooterToolbar extra={
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
                }>
                    <Button onClick={async () => {
                        await handleRemove(selectedRowsState);
                        setSelectedRows([]);
                        actionRef.current?.reloadAndRest?.();
                    }}>
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
            {createPayout && (
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
                    <ProFormSelect
                        showSearch
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
                        label="User ID(Account)"
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
            )}
            {download && (
                <ModalForm
                    title={intl.formatMessage({
                        id: 'pages.searchTable.createForm.download',
                        defaultMessage: 'Download',
                    })}
                    open={downloadModalOpen}
                    onOpenChange={handleDownloadModalOpen}
                    layout="horizontal"
                    labelCol={{
                        span: 10,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    labelAlign="left"
                    onFinish={async (value) => {
                        const o = Object.keys(value).filter((k) => value[k]).reduce((a, k) => ({ ...a, [k]: value[k] }), {});
                        await downloadPayoutAsExcel({
                            ...o,
                            merchants: JSON.stringify(o.merchant_codes)
                        });
                    }}
                    width={500}
                >
                    <ProFormSelect
                        options={merchantsList}
                        name="merchant_codes"
                        label="Merchant Codes"
                        fieldProps={{ mode: 'multiple'}}
                        initialValue={merchantsList.map(merchant => merchant.value)}
                        rules={[{required:true}]}
                        style={{ width: '100%'}}
                    />
                    <ProFormSelect
                        options={[{
                            label: "Jena",
                            value: "jena"
                        },{
                            label: "Bandhan",
                            value: "bandhan"
                        },{
                            label: "Axis",
                            value: "axis"
                        },{
                            label: "Saraswat",
                            value: "saraswat"
                        }]}
                        name="template"
                        label="Template"
                        rules={[{required:true}]}
                        style={{ width: '100%'}}
                    />
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

            {action && (
                <>
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
                    />
                </>
            )}

            {confirm && (
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
                />
            )}
        </PageContainer>
    )
}

export default PayoutTable;