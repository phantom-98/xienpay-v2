import {
  addAdminUser,
  adminUser,
  changeEnableAdminUser,
  fetchRolesList,
  removeAdminUser,
  updateAdminUser,
} from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl } from '@umijs/max';
import { Button, Drawer, Switch, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

/******************
 * Switch handlers
 *****************/
function toggleEnable(adminUser_id: number) {
  console.log('toggleStatus', adminUser_id);
  return (checked: boolean) => {
    changeEnableAdminUser(adminUser_id, checked);
  };
}

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.AddAdminUserItem) => {
  const hide = message.loading('Adding');
  try {
    await addAdminUser({ ...fields });
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
    await updateAdminUser({
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
const handleRemove = async (selectedRows: API.AdminUserListItem[]) => {
  const hide = message.loading('Deleting...');
  if (!selectedRows) return true;
  try {
    await removeAdminUser({
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

const AdminUserList: React.FC = () => {
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
  const [currentRow, setCurrentRow] = useState<API.AdminUserListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.AdminUserListItem[]>([]);

  /* Preload roles list */
  const [rolesList, setRolesList] = useState<API.RoleListItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const fetchedRoles = await fetchRolesList('');
        setRolesList(fetchedRoles);
      } catch (error) {
        // Handle error
        console.error('Error fetching roles:', error);
      }
    })();
  }, []);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();

  const columns: ProColumns<API.AdminUserListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.adminUserTable.updateForm.adminUserName.nameLabel"
          defaultMessage="AdminUser name"
        />
      ),
      dataIndex: 'name',
      tip: 'The adminUser code is the unique key',
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
      title: <FormattedMessage id="pages.adminUserTable.tg_handle" defaultMessage="Username" />,
      dataIndex: 'username',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.adminUserTable.tg_handle" defaultMessage="Role" />,
      dataIndex: 'role',
      valueType: 'textarea',
      valueEnum: Map.from(rolesList, (role) => [role.value, role.label]),
    },
    {
      title: <FormattedMessage id="pages.adminUserTable.enabled" defaultMessage="Enabled?" />,
      dataIndex: 'is_enabled',
      hideInSearch: true,
      render: (_, record) => (
        <Switch
          defaultChecked={record.is_enabled}
          size="small"
          onChange={toggleEnable(record.id)}
        />
      ),
    },
    {
      title: <FormattedMessage id="pages.payinTable.lastLogin" defaultMessage="Last logged in" />,
      dataIndex: 'last_login',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record) => (record.is_logged_in ? record.last_login : record.last_logout),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.AdminUserListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.adminUserTable.title',
          defaultMessage: 'AdminUsers List',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() =>
          access.canAdmin
            ? [
                <Button
                  type="primary"
                  key="primary"
                  onClick={() => {
                    handleModalOpen(true);
                  }}
                >
                  <PlusOutlined />{' '}
                  <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
                </Button>,
              ]
            : null
        }
        request={adminUser}
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
          id: 'pages.searchTable.createForm.newAdminUser',
          defaultMessage: 'New Admin User',
        })}
        layout="horizontal"
        open={createModalOpen}
        labelCol={{ span: 8 }}
        width="480px"
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.AddAdminUserItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          width="md"
          name="name"
          required={true}
          label="Fullname"
          placeholder="Full name"
        />
        <ProFormText
          width="md"
          name="username"
          required={true}
          label="Username"
          placeholder="Login name"
        />
        <ProFormText.Password
          width="md"
          name="password"
          required={true}
          label="Password"
          placeholder="Password"
        />
        <ProFormText
          width="md"
          name="tg_handle"
          required={true}
          label="Telegram username"
          placeholder="Telegram username"
        />
        <ProFormSelect
          width="md"
          options={rolesList}
          // request={fetchRolesList}
          name="role"
          label="Role"
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
          <ProDescriptions<API.AdminUserListItem>
            column={1}
            title={<span>AdminUser No. {currentRow?.id}</span>}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.AdminUserListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default AdminUserList;
