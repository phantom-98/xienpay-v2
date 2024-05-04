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

/** 获取规则列表 GET /api/payins */
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

/** 更新规则 PUT /api/payins */
export async function updateBankAcct(options?: { [key: string]: any }) {
  return request<API.BankAcctListItem>('/api/bankAccts', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/payins */
export async function addBankAcct(options?: { [key: string]: any }) {
  return request<API.BankAcctListItem>('/api/bankAccts', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/payins */
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

export async function changeStatusMerchant(merchant_id: number, checked: boolean) {
  console.log('changeStatusMerchant', merchant_id, checked);
  return request('/api/merchants/changeStatus', {
    method: 'POST',
    data: {
      id: merchant_id,
      is_enabled: checked ? true : false,
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

export async function fetchMerchantsList(
  merchant_name: string,
): Promise<API.LinkedMerchantListItem[]> {
  console.log('fetching user', merchant_name);

  return request('/api/merchants/lookup', {
    method: 'POST',
    data: {
      merchant_name: merchant_name,
      limit: 5,
    },
  }).then((response) =>
    response.data.map((merchant: { id: number; name: string; code: string }) => ({
      label: merchant.code, // `${merchant.name || ''} ${merchant.code}`,
      value: merchant.id,
    })),
  );
}

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
