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
  colorPrimary: '#639f52',
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
    colorTextAppListIconHover: '#fff',
    colorTextAppListIcon: '#313131',
    sider: {
      colorMenuItemDivider: '#313131',
      colorBgMenuItemHover: '#e1e1e149',
      colorTextMenu: 'white',
      colorTextMenuSelected: 'white',
      colorTextMenuActive: 'white',
    },
  },
};

export default Settings;
