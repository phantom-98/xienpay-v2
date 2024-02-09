// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    name?: string;
    avatar?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  type MerchantListItem = {
    return_url?: string;
    max_payin?: number;
    min_payin?: number;
    secret_key?: string;
    notify_url?: string;
    site_url?: string;
    api_key?: string;
    updated_at?: string;
    id?: number;
    notes?: string;
    code?: string;
    is_test_mode: boolean;
    created_at?: string;
    payin_commission?: number;
  };

  type MerchantList = {
    data?: MerchantListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };


  type AgentListItem = {
    id: number;
    name: string;
    balance: number;
    tg_handle: string;
    tg_chat_id: string;
    upi_id: string;
    is_approved: boolean;
    is_enabled: boolean;
    is_logged_in: boolean;
    last_login: string;
    last_logout: string;
    updated_at: string;
  };

  type AgentList = {
    data?: AgentListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };


  type PayinStatus = 'initiated' | 'assigned' | 'pending' | 'dropped' | 'success' | 'failure' | 'pending' | 'submitted';

  type PayinListItem = {
    id: number;
    amount: number;
    utr_id: string;
    agent_id: number;
    agent_acct_id: number;
    merchant_id: number;
    merchant_order_id: number;
    user_submitted_utr: string;
    uuid: string;
    currency: string;
    status: PayinStatus;
    updated_at?: string;
    created_at?: string;
  };

  type PayinList = {
    data?: PayinListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };
}
