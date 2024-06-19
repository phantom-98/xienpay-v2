// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

/****************************************************************************************
 * Merchant APIs
 ***************************************************************************************/

/** 获取规则列表 GET /api/merchants */
export async function merchant(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.MerchantList>('/api/merchants', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/merchants */
export async function updateMerchant(options?: { [key: string]: any }) {
  return request<API.MerchantListItem>('/api/merchants', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/merchants */
export async function addMerchant(options?: { [key: string]: any }) {
  return request<API.MerchantListItem>('/api/merchants', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/merchants */
export async function removeMerchant(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/merchants', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

export async function fetchMerchantsList(
  merchant_name: string,
): Promise<API.LinkedMerchantListItem[]> {
  console.log('fetching user', merchant_name);

  return request('/api/merchants/lookup', {
    method: 'POST',
    data: {
      merchant_name: merchant_name,
      limit: 20,
    },
  }).then((response) =>
    response.data.map((merchant: { id: number; name: string; code: string }) => ({
      label: merchant.code, // `${merchant.name || ''} ${merchant.code}`,
      value: merchant.id,
    })),
  );
}

export async function fetchPlayerList(
  merchant_code: string,
  player_name: string,
): Promise<API.MerchantUserItem[]> {
  console.log('fetching player', merchant_code, player_name);

  return request('/api/merchants/players/lookup', {
    method: 'POST',
    data: {
      merchant_code: merchant_code,
      player_name: player_name,
      limit: 5,
    },
  }).then((response) =>
    response.data.map((player: { id: string; name: string }) => ({
      label: player.name,
      value: player.name,
    })),
  );
}

export async function fetchMerchantAnalytics(
  merchant_codes: string[],
  from_date: string,
  to_date: string,
): Promise<API.AnalyticsData> {
  return request('/api/merchants/analytics', {
    method: 'POST',
    data: {
      merchant_codes,
      from_date,
      to_date,
    },
  }).then((response) => response.data);
}
// Added code-------------------------------------------------------------------------
export async function fetchMerchantAnalyticsSnapshot(
  merchant_codes: string[],
  duration: string,
): Promise<API.AnalyticsData> {
  return request('/api/merchants/analytics/snapshot', {
    method: 'POST',
    data: {
      merchant_codes,
      duration,
    },
  }).then((response) => response.data);
}

export async function fetchMerchantAnalyticsPayins(
  merchant_codes: string[],
  duration: string,
): Promise<API.AnalyticsData> {
  return request('/api/merchants/analytics/payins', {
    method: 'POST',
    data: {
      merchant_codes,
      duration,
    },
  }).then((response) => response.data);
}

export async function fetchMerchantAnalyticsPayouts(
  merchant_codes: string[],
  duration: string,
): Promise<API.AnalyticsData> {
  return request('/api/merchants/analytics/payouts', {
    method: 'POST',
    data: {
      merchant_codes,
      duration,
    },
  }).then((response) => response.data);
}

// Finished --------------------------------------------------------------------------
export async function downloadPayins(merchant_codes: string[], from_date: string, to_date: string, status: string | undefined) {
  return request('/api/merchants/payins/download', {
    method: 'POST',
    data: {
      merchant_codes,
      from_date,
      to_date,
      status
    },
    getResponse: true, // This will return the full response object
  }).then((response) => {
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payins-${from_date}-${to_date}-${status}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}

export async function downloadPayouts(merchant_codes: string[], from_date: string, to_date: string, status: string | undefined) {
  return request('/api/merchants/payouts/download', {
    method: 'POST',
    data: {
      merchant_codes,
      from_date,
      to_date,
      status
    },
    getResponse: true, // This will return the full response object
  }).then((response) => {
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payouts-${from_date}-${to_date}-${status}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}

/****************************************************************************************
 * Agent APIs
 ***************************************************************************************/

/** 获取规则列表 GET /api/agents */
export async function agent(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.AgentList>('/api/agents', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/agents */
export async function updateAgent(options?: { [key: string]: any }) {
  return request<API.AgentListItem>('/api/agents', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/agents */
export async function addAgent(options?: { [key: string]: any }) {
  return request<API.AgentListItem>('/api/agents', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/agents */
export async function removeAgent(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/agents', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

export async function changeEnableAgent(agent_id: number, checked: boolean) {
  console.log('changeEnableAgent', agent_id, checked);
  return request('/api/agents/changeEnable', {
    method: 'POST',
    data: {
      method: 'post',
      id: agent_id,
      is_enabled: checked ? true : false,
    },
  });
}

/****************************************************************************************
 * Payin APIs
 ***************************************************************************************/

/** 获取规则列表 GET /api/payins */
export async function payin(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.PayinList>('/api/payins', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/payins */
export async function updatePayin(options?: { [key: string]: any }) {
  return request<API.PayinListItem>('/api/payins', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

export async function confirmNotified(options?: { [key: string]: any }) {
  return request<API.PayinListItem>('/api/payins//confirmNotify', {
    method: 'POST',
    data: {
      method: 'confirmNotified',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/payins */
export async function addPayin(options?: { [key: string]: any }) {
  return request<API.PayinListItem>('/api/payins', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

export async function generatePaymentLink(options?: { [key: string]: any }) {
  return request<API.PayinListItem>('/api/payins/paylink', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

export async function generatePermaPaymentLink(options?: { [key: string]: any }) {
  return request<API.PayinListItem>('/api/payins/permalink', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/payins */
export async function removePayin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/payins', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

/****************************************************************************************
 * Payout APIs
 ***************************************************************************************/

/** 获取规则列表 GET /api/payouts */
export async function payout(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  console.log("optoins her", params)
  return request<API.PayoutList>('/api/payouts', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/payouts */
export async function updatePayout(options?: { [key: string]: any }) {
  return request<API.PayoutListItem>('/api/payouts', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/payouts */
export async function addPayout(options?: { [key: string]: any }) {
  return request<API.PayoutListItem>('/api/payouts', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/payouts */
export async function removePayout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/payouts', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

export async function acceptPayout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/payouts/authorize', {
    method: 'POST',
    data: {
      method: 'rejectPayout',
      ...(options || {}),
    },
  });
}

export async function rejectPayout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/payouts/authorize', {
    method: 'POST',
    data: {
      method: 'rejectPayout',
      ...(options || {}),
    },
  });
}

export async function downloadPayoutAsExcel( params?: { [key: string]: any }) {
  return request<API.PayoutList>('/api/payouts/downloadForBulkApproval', {
    method: 'GET',
    params: {
      ...params,
      status: 'initiated'
    },
    getResponse: true
  }).then((response) => {
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payouts_in_pending-${new Date().toLocaleString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });;
}

/****************************************************************************************
 * Bank Account APIs
 ***************************************************************************************/

/** 获取规则列表 GET /api/bankAccts */
export async function bankAcct(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.BankAcctListItem>('/api/bankAccts', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/bankAccts */
export async function updateBankAcct(options?: { [key: string]: any }) {
  return request<API.BankAcctListItem>('/api/bankAccts', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/bankAccts */
export async function addBankAcct(options?: { [key: string]: any }) {
  return request<API.BankAcctListItem>('/api/bankAccts', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/bankAccts */
export async function removeBankAcct(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/bankAccts', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

export async function changeStatusBankAcct(bank_id: number, checked: boolean) {
  console.log('changeBankStatus', bank_id, checked);
  return request('/api/bankAccts/changeStatus', {
    method: 'POST',
    data: {
      id: bank_id,
      is_enabled: checked ? true : false,
    },
  });
}

export async function changeRemitFlagBankAcct(bank_id: number, flag: string, checked: boolean) {
  console.log('changeRemitFlagBankAcct', bank_id, checked);
  return request('/api/bankAccts/changeRemitFlag', {
    method: 'POST',
    data: {
      id: bank_id,
      flag: flag,
      is_enabled: checked ? true : false,
    },
  });
}

export async function changeUpiIdBankAcct(bank_id: number, upi_id: string) {
  console.log('changeUpiIDBankAcct', bank_id, upi_id);
  return request('/api/bankAccts/changeUpiId', {
    method: 'POST',
    data: {
      id: bank_id,
      upi_id: upi_id,
    },
  });
}

export async function fetchAssignedMerchants(bank_id: number) {
  return request('/api/bankAccts/assignedMerchants', {
    method: 'POST',
    data: {
      bank_id: bank_id,
    },
  });
}

export async function assignMerchants(bank_id: number, merchant_ids: number[]) {
  return request('/api/bankAccts/assignMerchants', {
    method: 'POST',
    data: {
      bank_id: bank_id,
      merchant_ids: merchant_ids,
    },
  });
}

/****************************************************************************************
 * Admin User APIs
 ***************************************************************************************/

/** 获取规则列表 GET /api/adminUsers */
export async function adminUser(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.AdminUserList>('/api/adminUsers', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/adminUsers */
export async function updateAdminUser(options?: { [key: string]: any }) {
  return request<API.AdminUserListItem>('/api/adminUsers', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/adminUsers */
export async function addAdminUser(options?: { [key: string]: any }) {
  return request<API.AdminUserListItem>('/api/adminUsers', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/adminUsers */
export async function removeAdminUser(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/adminUsers', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

export async function changeEnableAdminUser(adminUser_id: number, checked: boolean) {
  console.log('changeEnableAdminUser', adminUser_id, checked);
  return request('/api/adminUsers/changeEnable', {
    method: 'POST',
    data: {
      method: 'post',
      id: adminUser_id,
      is_enabled: checked ? true : false,
    },
  });
}

/****************************************************************************************
 * Role APIs
 ***************************************************************************************/

export async function fetchRolesList(name: string): Promise<API.RoleListItem[]> {
  console.log('fetching role', name);

  return request('/api/roles', {
    method: 'POST',
    data: {
      name: name,
      limit: 5,
    },
  }).then((response) =>
    response.data.map((role: { name: string; description: string }) => ({
      label: role.description,
      value: role.name,
    })),
  );
}

/****************************************************************************************
 * Settlement APIs
 ***************************************************************************************/

/** 获取规则列表 GET /api/settlements */
export async function settlement(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.SettlementList>('/api/settlements', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/settlements */
export async function updateSettlement(options?: { [key: string]: any }) {
  return request<API.SettlementListItem>('/api/settlements', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/settlements */
export async function addSettlement(options?: { [key: string]: any }) {
  return request<API.SettlementListItem>('/api/settlements', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/settlements */
export async function removeSettlement(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/settlements', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

export async function acceptSettlement(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/settlements/authorize', {
    method: 'POST',
    data: {
      method: 'rejectSettlement',
      ...(options || {}),
    },
  });
}

export async function rejectSettlement(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/settlements/authorize', {
    method: 'POST',
    data: {
      method: 'rejectSettlement',
      ...(options || {}),
    },
  });
}
