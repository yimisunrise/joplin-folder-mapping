import joplin from 'api';
import { MenuItemLocation } from 'api/types';
import { FolderUtils } from './utils';
import * as path from 'path';

joplin.plugins.register({
	onStart: async function() {
		// eslint-disable-next-line no-console
		console.info('joplin folder transport plugin started!');

        // 注册插件设置
        await joplin.settings.registerSection('folderTransportSection', {
            label: 'Folder Transport',
            iconName: 'fas fa-folder',
        });

        await joplin.settings.registerSettings({
            'defaultFolderPath': {
                value: '',
                type: 2, // String
                section: 'folderTransportSection',
                public: true,
                label: '默认根路径',
                description: '用于与Joplin笔记本路径拼接为系统完整路径',
            },
        });

        // 处理菜单项点击事件
        await joplin.commands.register({
            name: 'TransportOpen_MenuOfFolder_OpenSystemFolder',
            label: '打开系统目录',
            execute: async () => {
                const selectedFolder = await joplin.workspace.selectedFolder();
                if (selectedFolder) {
                    await joplin.commands.execute('FolderTransport_OpenSystemFolder', selectedFolder);
                } else {
                    await joplin.views.dialogs.showMessageBox('No notebook selected');
                }
            },
        });

		// 打开系统文件夹
		await joplin.commands.register({
            name: 'FolderTransport_OpenSystemFolder',
            label: '打开系统目录',
            execute: async (selectedFolder: any) => {
				const folderId = selectedFolder ? selectedFolder.id : null;
                if (folderId) {
                    // 获取设置中的默认根路径
                    const settings = await joplin.settings.values(['defaultFolderPath']);
                    const defaultFolderPath = settings['defaultFolderPath'] as string;

					// 通过目录ID获取目录路径
					const folderPath = await FolderUtils.getFolderPath(folderId);

					// 拼接系统目录路径
                    const fullFolderPath = path.join(defaultFolderPath, folderPath);

					// 创建系统目录如果不存在时
					FolderUtils.createSystemFolderOfNotExist(fullFolderPath);

					// 打开系统目录
					FolderUtils.openSystemFolder(fullFolderPath);
                } else {
                    console.info('No folder ID provided');
                }
            },
        });

		// 注册右键菜单项
        await joplin.views.menuItems.create('TransportOpen_MenuOfFolder_001', 'TransportOpen_MenuOfFolder_OpenSystemFolder', MenuItemLocation.FolderContextMenu);
	},
});
