import { addAgent, removeAgent, agent, updateAgent } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, FormattedNumber, IntlProvider, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.AgentListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addAgent({ ...fields });
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
    await updateAgent({
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
const handleRemove = async (selectedRows: API.AgentListItem[]) => {
  const hide = message.loading('Deleting...');
  if (!selectedRows) return true;
  try {
    await removeAgent({
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

const AgentList: React.FC = () => {
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
  const [currentRow, setCurrentRow] = useState<API.AgentListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.AgentListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.AgentListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.agentTable.updateForm.agentName.nameLabel"
          defaultMessage="Agent name"
        />
      ),
      dataIndex: 'name',
      tip: 'The agent code is the unique key',
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
      title: <FormattedMessage id="pages.agentTable.tg_handle" defaultMessage="Telegram" />,
      dataIndex: 'tg_handle',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.agentTable.balance" defaultMessage="Balance" />,
      dataIndex: 'balance',
      valueType: 'textarea',
      renderText: (val: boolean) =>
        <FormattedNumber value={val}
                          currencySign='accounting'
                          minimumFractionDigits={2}
                          maximumFractionDigits={2}/>
    },
    {
      title: <FormattedMessage id="pages.agentTable.remitType" defaultMessage="Type" />,
      dataIndex: 'remit_acct_type',
      valueEnum: {
        'upi-mc': {
          text: (
            <FormattedMessage id="pages.payinTable.payinStatus.default" defaultMessage="Intent" />
          ),
          status: 'Success',
        },
        'upi-p2p': {
          text: (
            <FormattedMessage id="pages.payinTable.payinStatus.assigned" defaultMessage="Collect" />
          ),
          status: 'Processing',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.agentTable.upi" defaultMessage="UPI" />,
      dataIndex: 'upi_id',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.agentTable.online?" defaultMessage="Online?" />,
      dataIndex: 'is_logged_in',
      renderText: (val: boolean) =>
        <Switch checked={val}/>
    },
    {
      title: <FormattedMessage id="pages.agentTable.enabled" defaultMessage="Enabled?" />,
      dataIndex: 'is_enabled',
      renderText: (val: boolean) =>
        <Switch checked={val}/>
    },
    {
      title: <FormattedMessage id="pages.agentTable.enabled" defaultMessage="Approved?" />,
      dataIndex: 'is_approved',
      renderText: (val: boolean) =>
        <Switch checked={val}/>
    },
    {
      title: <FormattedMessage id="pages.payinTable.lastLogin" defaultMessage="Last logged in"/>,
      dataIndex: 'last_login',
      valueType: 'dateTime',
      render: (_, record) =>
        record.is_logged_in? record.last_login : record.last_logout
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.AgentListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.agentTable.title',
          defaultMessage: 'Agents List',
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
        request={agent}
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
          id: 'pages.searchTable.createForm.newAgent',
          defaultMessage: 'New agent',
        })}
        width="400px"
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.AgentListItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          agents={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.agentName"
                  defaultMessage="Agent name is required"
                />
              ),
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
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
          <ProDescriptions<API.AgentListItem>
            column={1}
            title={<span>Agent No. {currentRow?.id}</span>}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.AgentListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default AgentList;
