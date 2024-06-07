import { AvatarDropdown, AvatarName, Question, SelectLang } from '@/components';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import { LinkOutlined, SunOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { Link, history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { useEffect } from 'react';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

const toggleTheme = (initialSetting : any, theme: string | undefined) => {
  const settings = {...initialSetting};
  const flag = theme === "realDark" ? true : theme === "light" ? false : settings?.navTheme === "light";
  localStorage.setItem('theme', flag ? "realDark" : "light");
  settings.navTheme = flag ? "realDark" : "light";
  settings.token.header = !flag ? {
    colorBgHeader: 'white',
    colorHeaderTitle: 'black',
    colorTextMenu: '#313131',
    colorTextMenuSecondary: '#313131',
    colorTextMenuSelected: '#fff',
    colorBgMenuItemSelected: '#22272b',
    colorTextMenuActive: 'rgba(255,255,255,0.85)',
    colorTextRightActionsItem: '#313131',
  } : {
    colorBgHeader: '#111111',
    colorHeaderTitle: 'white',
    colorTextMenu: '#dfdfdf',
    colorTextMenuSecondary: '#dfdfdf',
    colorTextMenuSelected: '#111',
    colorBgMenuItemSelected: '#e9e9e9de',
    colorTextMenuActive: 'rgba(0,0,0,0.85)',
    colorTextRightActionsItem: '#dfdfdf',
  }
  settings.token.sider = !flag ? {
    ...settings.token.sider,
    colorMenuBackground: '#495365',
  } : {
    ...settings.token.sider,
    colorMenuBackground: '#191919',
  }
  settings.token.pageContainer = !flag ? {
    colorBgPageContainer: '#f4f7fe'
  } : {
    colorBgPageContainer: '#111'
  }
  
  return settings;
}

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const theme = localStorage.getItem("theme") || "light";
  const settings = toggleTheme(defaultSettings, theme) as Partial<LayoutSettings>;
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings,
    };
  }
  return {
    fetchUserInfo,
    settings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [
      <SunOutlined key="theme" onClick={() => {
        const settings = toggleTheme(initialState?.settings, undefined) as Partial<LayoutSettings>;
        setInitialState({
          ...initialState,
          settings
        })
        }}/>,
      <SelectLang key="SelectLang" />
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <></>,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
const authHeaderInterceptor = (url: string, options: RequestConfig) => {
  const token = localStorage.getItem('xien.auth.0');
  if (token) {
    const authHeader = { Authorization: `Bearer ${token}` };
    return {
      url: `${url}`,
      options: { ...options, interceptors: true, headers: authHeader },
    };
  } else {
    return { url, options };
  }
};

const loginTokenInterceptor = (response: Response) => {
  if (response.config.url === '/api/login/account') {
    const token = response.data.token;
    if (token !== null) {
      localStorage.setItem('xien.auth.0', token);
    }
  } else if (response.config.url === '/api/login/outLogin') {
    localStorage.removeItem('xien.auth.0');
  }

  return response;
};

export const request = {
  ...errorConfig,
  requestInterceptors: [authHeaderInterceptor],
  responseInterceptors: [loginTokenInterceptor],
};
