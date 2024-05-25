import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  //navTheme: 'realDark',
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Xien Pay Admin',
  pwa: true,
  // logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  logo: 'https://www.svgrepo.com/show/353863/haxe.svg',
  iconfontUrl: '',
  token: {
    typography: {
      fontFamily: 'Poppins',
    },
    header: {
      colorBgHeader: '#292f33',
      colorHeaderTitle: '#fff',
      colorTextMenu: '#dfdfdf',
      colorTextMenuSecondary: '#dfdfdf',
      colorTextMenuSelected: '#fff',
      colorBgMenuItemSelected: '#22272b',
      colorTextMenuActive: 'rgba(255,255,255,0.85)',
      colorTextRightActionsItem: '#dfdfdf',
    },
    colorTextAppListIconHover: '#fff',
    colorTextAppListIcon: '#dfdfdf',
    sider: {
      colorMenuBackground: '#001529',
      colorMenuItemDivider: '#dfdfdf',
      colorBgMenuItemHover: '#f6f6f6',
      colorTextMenu: 'white',
      colorTextMenuSelected: 'orange',
      colorTextMenuActive: 'orange',
    },
  },
};

export default Settings;
