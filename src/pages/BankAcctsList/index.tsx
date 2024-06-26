import {
  addBankAcct,
  assignMerchants,
  bankAcct,
  changeRemitFlagBankAcct,
  changeStatusBankAcct,
  changeUpiIdBankAcct,
  fetchAssignedMerchants,
  fetchMerchantsList,
  removeBankAcct,
  updateBankAcct,
} from '@/services/ant-design-pro/api';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
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
import { FormattedMessage, FormattedNumber, useAccess, useIntl } from '@umijs/max';
import type { SelectProps } from 'antd';
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  List,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  message,
  Popover,
} from 'antd';
import debounce from 'lodash/debounce';
import React, { useMemo, useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import { utcToist } from '../../utils';
import SearchInput from '../../components/MerchantSearch';

const EditableCell = ({ text, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(text);

  const toggleEdit = () => {
    setEditing(!editing);
    setInputValue(text); // Reset on cancel
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const save = async () => {
    toggleEdit();
    try {
      await onEdit(inputValue);
      message.success('Updated successfully');
    } catch (error) {
      message.error('Update failed');
    }
  };

  return editing ? (
    <Input
      value={inputValue}
      onChange={handleInputChange}
      onPressEnter={save}
      onBlur={save}
      style={{ margin: '-5px 0' }}
    />
  ) : (
    <div>
      {text} <EditOutlined type="edit" onClick={toggleEdit} />
    </div>
  );
};

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

function DebounceSelect<
  ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}

// Usage of DebounceSelect
interface UserValue {
  label: string;
  value: number;
}

function toLinkedMerchanListItem(user: UserValue): API.LinkedMerchantListItem {
  let item: API.LinkedMerchantListItem = {
    id: 0,
    name: '',
  };
  item.id = user.value;
  item.name = user.label;
  return item;
}

/******************
 * Switch handlers
 *****************/
function toggleStatus(bank_id: number) {
  console.log('toggleStatus', bank_id);
  return (checked: boolean) => {
    changeStatusBankAcct(bank_id, checked);
  };
}

function toggleRemitFlag(bank_id: number, flag: string) {
  console.log('toggleRemitFlag', bank_id);
  return (checked: boolean) => {
    changeRemitFlagBankAcct(bank_id, flag, checked);
  };
}

const loadAssignedMerchants = async (bank_id: number) => {
  return fetchAssignedMerchants(bank_id);
};

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

  /**
   * Merchant assignment modal
   */
  const [updateMerchantsModalOpen, handleUpdateMerchantsModalOpen] = useState<boolean>(false);
  const [merchants, setMerchants] = useState<API.LinkedMerchantListItem[]>([]); // Initial items

  const [value, setValue] = useState<UserValue>();

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.BankAcctListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.BankAcctListItem[]>([]);

  const handleMerchantsDelete = (itemToDelete: API.LinkedMerchantListItem) => {
    setMerchants(merchants.filter((item) => item.id !== itemToDelete.id));
  };

  const handleMerchantsAdd = () => {
    if (value) {
      const new_merchant = toLinkedMerchanListItem(value);
      setMerchants([...merchants, new_merchant]);
    }
  };

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();

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
      render: (text, record) => (
        <EditableCell
          text={record.upi_id}
          onEdit={async (newText) => {
            setCurrentRow(record);
            await changeUpiIdBankAcct(record.id, newText);
            actionRef.current?.reloadAndRest?.();
          }}
        />
      ),
    },
    {
      title: (
        <FormattedMessage id="pages.bankAcctTable.searchTable.balance" defaultMessage="Balance" />
      ),
      render: (_, record) => (
        <span>
          ₹
          <FormattedNumber
            value={record.balance}
            currencySign="accounting"
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
          <br />
          ({record.num_payins})
        </span>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.bankAcctTable.searchTable.remit-intent?"
          defaultMessage="Allow Intent?"
        />
      ),
      dataIndex: 'has_remit_intent',
      render: (_, record) => (
        <Switch
          size="small"
          defaultChecked={record.has_remit_intent}
          onChange={toggleRemitFlag(record.id, 'intent')}
        />
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.bankAcctTable.searchTable.remit-qr?"
          defaultMessage="Show QR?"
        />
      ),
      dataIndex: 'has_remit_qr',
      render: (_, record) => (
        <Switch
          size="small"
          defaultChecked={record.has_remit_qr}
          onChange={toggleRemitFlag(record.id, 'qr')}
        />
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.bankAcctTable.searchTable.remit-bank?"
          defaultMessage="Show Bank?"
        />
      ),
      dataIndex: 'has_remit_bank',
      render: (_, record) => (
        <Switch
          size="small"
          defaultChecked={record.has_remit_bank}
          onChange={toggleRemitFlag(record.id, 'bank')}
        />
      ),
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
      dataIndex: 'is_enabled',
      render: (_, record) => (
        <Switch
          size="small"
          defaultChecked={record.is_enabled}
          onChange={toggleStatus(record.id)}
        />
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
          defaultMessage="Last scheduled time (IST)"
        />
      ),
      sorter: true,
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      render: (_, record) => <span>{utcToist(record.updated_at)}</span>,
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
      hideInTable: false,
      render: (_, record) => [
        <Popover
          title={<span>Merchants List</span>}
          content={
              <List
                dataSource={merchants}
                renderItem={(item: API.LinkedMerchantListItem) => (
                  <List.Item>
                    {item.name}
                  </List.Item>
                )}
              />}
          placement="topRight"
          onOpenChange={(visible) => {
            setCurrentRow(record);
            visible && loadAssignedMerchants(record.id).then(response => setMerchants(response.data))
          }}
        >
          <EyeOutlined style={{cursor: "pointer"}}/>
        </Popover>,
        <EditOutlined
          onClick={() => {
            setCurrentRow(record);
            handleUpdateMerchantsModalOpen(true);

            loadAssignedMerchants(record.id).then((response) => {
              console.log('loadAssignedMerchants', response.data);
              setMerchants(response.data);
            });
          }}
        />,
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
        rowKey="name"
        search={false}
        // search={{
        //   labelWidth: 120,
        // }}
        toolBarRender={() => [
          access.canBankAcctCreate ? (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalOpen(true);
              }}
            >
              <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
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
        request={bankAcct}
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

      <Modal
        title="Marchants List"
        open={updateMerchantsModalOpen}
        okText="Update"
        onOk={() => {
          if (currentRow?.id && merchants) {
            assignMerchants(
              currentRow?.id,
              merchants?.map((m) => m.id),
            );
            handleUpdateMerchantsModalOpen(false);
          }
        }}
        onCancel={() => handleUpdateMerchantsModalOpen(false)}
      >
        <List
          dataSource={merchants}
          renderItem={(item: API.LinkedMerchantListItem) => (
            <List.Item
              actions={[
                <DeleteOutlined key="delete" onClick={() => handleMerchantsDelete(item)} />,
              ]}
            >
              {item.name}
            </List.Item>
          )}
        />
        <Form layout="inline">
          <Form.Item>
            <SearchInput
              placeholder="Select users"
              onChange={setValue}
              style={{ width: '325px' }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="dashed" onClick={handleMerchantsAdd} icon={<PlusOutlined />}>
              Add Item
            </Button>
          </Form.Item>
        </Form>
      </Modal>

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