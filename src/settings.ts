import joplin from 'api';
import { SettingItemType } from 'api/types';

export const SYSTEM_FILE_PANEL_SHOW_TYPE_SETTING = 'systemFilePanelShowType';
export enum PanelShowType {
  SHOW,
  HIDE,
}

export const SECTION_NAME = 'Folder Mapping Section';

export const SETTINGS = {
  defaultFolderPath: {
    label: '基准根路径',
    type: SettingItemType.String,
    public: true,
    value: '',
    section: SECTION_NAME,
    description: '用于与Joplin笔记本路径拼接为系统完整路径',
  },
  [SYSTEM_FILE_PANEL_SHOW_TYPE_SETTING]: {
    label: '系统文件面板',
    type: SettingItemType.Int,
    public: true,
    value: PanelShowType.SHOW,
    isEnum: true,
    options: {
      [PanelShowType.SHOW]: '现实',
      [PanelShowType.HIDE]: '隐藏',
    },
    section: SECTION_NAME,
    description: "开启后，选中Joplin笔记本后对应的系统文件路径下的文件列表将显示在面板中，关闭后隐藏",
  },
};

export const setupSettings = async () => {
  await joplin.settings.registerSection(SECTION_NAME, {
    label: 'Folder Mapping',
  });

  await joplin.settings.registerSettings(SETTINGS);
};