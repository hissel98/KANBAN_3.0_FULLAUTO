import type { CapacitorConfig } from '@capacitor/cli';

type ExtendedCapacitorConfig = CapacitorConfig & {
  bundledWebRuntime: false;
};

const config: ExtendedCapacitorConfig = {
  appId: 'com.dasistmeinetest.kanban',
  appName: 'Kanban Board',
  webDir: 'out',
  plugins: {
    DeepLinks: {
      schemes: ['com.dasistmeinetest.kanban', 'https', 'http'],
    },
  },
  bundledWebRuntime: false,
};

export default config;
