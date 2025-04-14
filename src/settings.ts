import joplin from 'api';
import { SettingItemSubType, SettingItemType } from 'api/types';
import { SettingKey } from './types';

export const SECTION_NAME = 'Folder Mapping Section';

export const SETTINGS = {
  [SettingKey.SYSTEM_FOLDER_ROOT_PATH]: {
    label: '基准根路径',
    type: SettingItemType.String,
    public: true,
    value: '',
    section: SECTION_NAME,
    description: '用于与Joplin笔记本路径拼接为系统完整路径',
  },
  [SettingKey.SYSTEM_FILE_PANEL_ENABLED]: {
    label: '是否启用系统文件面板',
    type: SettingItemType.Bool,
    public: true,
    value: true,
    section: SECTION_NAME,
    description: "若开启系统文件面板，选中Joplin笔记本后对应的系统文件路径下的文件会在面板中显示，若不勾选则不显示系统文件面板",
  },
  [SettingKey.SYSTEM_FILE_PANEL_IS_SHOW_HIDDEN_FILES]: {
    label: '是否显示隐藏文件',
    type: SettingItemType.Bool,
    subType: SettingItemSubType.FilePathAndArgs,
    public: true,
    value: true,
    section: SECTION_NAME,
    description: "系统文件面板文件列表中默认显示隐藏文件，若不够选则不显示隐藏文件",
  },
  [SettingKey.SYSTEM_FILE_PANEL_HEIGHT_SETTING]: {
    label: '系统文件面板高度',
    type: SettingItemType.Int,
    public: true,
    value: 500,
    section: SECTION_NAME,
    description: "系统文件面板高度, 根据自己需求情况进行调整，单位为px",
  },
};

/**
 * 注册设置项
 * @returns
 */
export const setupSettings = async () => {
  await joplin.settings.registerSection(SECTION_NAME, {
    label: 'Folder Mapping',
    description: '目录映射插件的设置项',
  });
  await joplin.settings.registerSettings(SETTINGS);
};

/**
 * 获取Joplin设置项的值
 * @param key - 设置项的key
 * @returns 
 */
export const getSettingValue = async (key: string): Promise<any> => {
  const settings = await joplin.settings.values([key]);
  return settings[key];
}

/**
 * 获取多个Joplin设置项的值
 * @param key - 设置项的key
 * @returns 
 */
export const getSettingValues = async (keys: string[]): Promise<Record<string, any>> => {
  const settings = await joplin.settings.values(keys);
  return settings;
}