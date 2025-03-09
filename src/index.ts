import joplin from 'api';
import { MenuItemLocation } from 'api/types';
import { FolderMenuRegister, ActionRegister, FolderMenuItem } from './commands';


joplin.plugins.register({
	onStart: async function() {
		// eslint-disable-next-line no-console
		console.info('joplin folder mapping plugin started!');

        // 注册插件设置
        await joplin.settings.registerSection('folderMappingSection', {
            label: 'Folder Mapping',
            iconName: 'fas fa-folder',
        });

        await joplin.settings.registerSettings({
            'defaultFolderPath': {
                value: '',
                type: 2, // String
                section: 'folderMappingSection',
                public: true,
                label: '默认根路径',
                description: '用于与Joplin笔记本路径拼接为系统完整路径',
            },
        });

        // 笔记本右键菜单注册初始化
        FolderMenuRegister.init();

        // 动作行为事件注册初始化
        ActionRegister.init();

		// 创建笔记本右键菜单项
        await joplin.views.menuItems.create('MappingOpen_MenuOfFolder_001', FolderMenuItem.OPEN_SYSTEM_FOLDER, MenuItemLocation.FolderContextMenu);

        // 创建Tools菜单项
        // await joplin.views.menus.create('MappingOpen_MenuOfFolder_002', 'Folder Mapping', [
        //     {
        //         commandName: FolderMenuItem.OPEN_SYSTEM_FOLDER,
        //     },
        //     {
        //         commandName: FolderMenuItem.TEST,
        //     },
        // ], MenuItemLocation.Tools)
	},
});
