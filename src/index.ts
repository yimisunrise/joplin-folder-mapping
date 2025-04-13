import joplin from 'api';
import { MenuItemLocation } from 'api/types';
import { Commands, setupCommands } from './commands';
import { setupSettings } from './settings';
import { setupWebview } from './webView';


joplin.plugins.register({
	onStart: async function() {
		// eslint-disable-next-line no-console
		console.info('joplin folder mapping plugin started!');

        await setupSettings();
        await setupCommands();
        await setupWebview();

		// 创建笔记本右键菜单项
        await joplin.views.menuItems.create('MappingOpen_MenuOfFolder_001', Commands.OPEN_SYSTEM_FOLDER_BY_SELECTED, MenuItemLocation.FolderContextMenu);

        // 创建Tools菜单项
        // await joplin.views.menus.create('MappingOpen_MenuOfFolder_002', 'Folder Mapping', [
        //     {
        //         commandName: Commands.OPEN_SYSTEM_FOLDER_BY_SELECTED,
        //     },
        //     {
        //         commandName: Commands.SYNCHRONOUS_DIRECTORY_STRUCTURE,
        //     },
        //     {
        //         commandName: Commands.OPEN_FOLDER_COMPARE_DIALOG,
        //     },
        //     {
        //         commandName: Commands.TEST,
        //     }
        // ], MenuItemLocation.Tools);
	},
});
