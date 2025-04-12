import joplin from 'api';
import { MenuItemLocation } from 'api/types';
import { MenuItemCommands, setupCommands } from './commands';
import { setupSettings } from './settings';


joplin.plugins.register({
	onStart: async function() {
		// eslint-disable-next-line no-console
		console.info('joplin folder mapping plugin started!');

        await setupSettings();
        await setupCommands();

		// 创建笔记本右键菜单项
        await joplin.views.menuItems.create('MappingOpen_MenuOfFolder_001', MenuItemCommands.OPEN_SYSTEM_FOLDER, MenuItemLocation.FolderContextMenu);

        // 创建Tools菜单项
        await joplin.views.menus.create('MappingOpen_MenuOfFolder_002', 'Folder Mapping', [
            {
                commandName: MenuItemCommands.OPEN_SYSTEM_FOLDER,
            },
            {
                commandName: MenuItemCommands.SYNCHRONOUS_DIRECTORY_STRUCTURE,
            },
            {
                commandName: MenuItemCommands.OPEN_FOLDER_COMPARE,
            },
        ], MenuItemLocation.Tools);
	},
});
