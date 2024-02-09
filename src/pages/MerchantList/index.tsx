import { addMerchant, removeMerchant, merchant, updateMerchant } from '@/services/ant-design-pro/api';
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
const handleAdd = async (fields: API.MerchantListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addMerchant({ ...fields });
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
    await updateMerchant({
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
const handleRemove = async (selectedRows: API.MerchantListItem[]) => {
  const hide = message.loading('Deleting...');
  if (!selectedRows) return true;
  try {
    await removeMerchant({
      key: selectedRows.map((row) => row.code),
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

const MerchantList: React.FC = () => {
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
  const [currentRow, setCurrentRow] = useState<API.MerchantListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.MerchantListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.MerchantListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.merchantTable.updateForm.merchantName.nameLabel"
          defaultMessage="Merchant name"
        />
      ),
      dataIndex: 'code',
      tip: 'The merchant code is the unique key',
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
      title: <FormattedMessage id="pages.merchantTable.siteUrl" defaultMessage="Site" />,
      dataIndex: 'site_url',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.merchantTable.apiKey" defaultMessage="API Key" />,
      dataIndex: 'api_key',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.merchantTable.notifyUrl" defaultMessage="Notify Url" />,
      dataIndex: 'notify_url',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.merchantTable.returnUrl" defaultMessage="Return Url" />,
      dataIndex: 'return_url',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.merchantTable.payin" defaultMessage="Max Payin" />,
      render: (dom, entity, index, action, schema) =>
        <span>
        ₹
        <FormattedNumber value={entity.min_payin}
                       currencySign='accounting'
                       minimumFractionDigits={2}
                       maximumFractionDigits={2}/>
        &nbsp;-&nbsp;
       ₹
       <FormattedNumber value={entity.max_payin}
                      currencySign='accounting'
                      minimumFractionDigits={2}
                      maximumFractionDigits={2}/>
      </span>
      },
    {
      title: <FormattedMessage id="pages.merchantTable.testMode" defaultMessage="Test?" />,
      dataIndex: 'is_test_mode',
      renderText: (val: boolean) =>
        <Switch checked={val} style={{backgroundColor: val ? 'orange' : 'green'}}/>
    },
    {
      title: (
        <FormattedMessage
          id="pages.merchantTable.payinCommission"
          defaultMessage="Payin Commission"
        />
      ),
      dataIndex: 'payin_commission',
      hideInForm: true,
      renderText: (val: number) => `${val} %`
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.MerchantListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.merchantTable.title',
          defaultMessage: 'Merchants List',
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
        request={merchant}
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
          id: 'pages.searchTable.createForm.newMerchant',
          defaultMessage: 'New merchant',
        })}
        width="400px"
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.MerchantListItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          merchants={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.merchantName"
                  defaultMessage="Merchant name is required"
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
        {currentRow?.code && (
          <ProDescriptions<API.MerchantListItem>
            column={1}
            title={currentRow?.code}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.code,
            }}
            columns={columns as ProDescriptionsItemProps<API.MerchantListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default MerchantList;
