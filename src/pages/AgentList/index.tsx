import {
  addAgent,
  agent,
  changeEnableAgent,
  removeAgent,
  updateAgent,
} from '@/services/ant-design-pro/api';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, FormattedNumber, useAccess, useIntl } from '@umijs/max';
import { Button, Drawer, Switch, message } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import { utcToist } from '../../utils';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.AddAgentItem) => {
  const hide = message.loading('Adding');
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

  const [loading, setLoading] = useState({});

  /******************
   * Switch handlers
   *****************/
  function toggleEnable(agent: API.AgentListItem) {
    console.log('toggleStatus', agent.id);
    return async (checked: boolean) => {
      setLoading({...loading, [agent.id]: true});
      try {
        await changeEnableAgent(agent.id, checked);
        agent.is_enabled = checked;
      } catch (error) {

      }
      setLoading({...loading, [agent.id]: false});
    };
  }

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();

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
      hideInSearch: true,
      renderText: (val: boolean) => (
        <FormattedNumber
          value={val}
          currencySign="accounting"
          minimumFractionDigits={2}
          maximumFractionDigits={2}
        />
      ),
    },
    {
      title: <FormattedMessage id="pages.agentTable.remitType" defaultMessage="Type" />,
      dataIndex: 'remit_acct_type',
      hideInSearch: true,
      valueEnum: {
        'upi-mc': {
          text: <FormattedMessage id="pages.payinTable.remit.upi-mc" defaultMessage="Intent" />,
          status: 'Success',
        },
        'upi-p2p': {
          text: <FormattedMessage id="pages.payinTable.remit.upi-p2p" defaultMessage="Collect" />,
          status: 'Processing',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.agentTable.upi" defaultMessage="UPI" />,
      dataIndex: 'upi_id',
      hideInSearch: true,
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.agentTable.online?" defaultMessage="Online?" />,
      dataIndex: 'is_logged_in',
      valueType: 'switch',
      renderText: (val: boolean) => <Switch size="small" disabled checked={val} />,
    },
    {
      title: <FormattedMessage id="pages.agentTable.apprpved" defaultMessage="Approved?" />,
      dataIndex: 'is_approved',
      hideInSearch: true,
      render: (_, record) => <Switch defaultChecked={record.is_enabled} disabled size="small" />,
    },
    {
      title: <FormattedMessage id="pages.agentTable.enabled" defaultMessage="Enabled?" />,
      dataIndex: 'is_enabled',
      valueType: 'switch',
      render: (_, record) => (
        <Switch
          size="small"
          loading={loading[record.id]}
          checked={record.is_enabled}
          onClick={toggleEnable(record)}
        />
      ) 
    },
    {
      title: <FormattedMessage id="pages.payinTable.lastLogin" defaultMessage="Last logged in (IST)" />,
      dataIndex: 'last_login',
      hideInSearch: true,
      valueType: 'dateTime',
      render: (_, record) => <span>{utcToist(record.is_logged_in ? record.last_login : record.last_logout)}</span>,
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
        rowKey="name"
        toolBarRender={() =>
          [access.canAgentCreate
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
        request={agent}
        columns={columns}
        search={{
          labelWidth: 'auto',
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
          id: 'pages.searchTable.createForm.newAgent',
          defaultMessage: 'New agent',
        })}
        width="400px"
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.AddAgentItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText width="md" name="name" required={true} placeholder="Agent Nickname" />
        <ProFormText width="md" name="tg_id" required={true} placeholder="Telegram ID" />
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
