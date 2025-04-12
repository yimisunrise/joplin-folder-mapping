import joplin from 'api';
import { JoplinFolderUtils, SystemUtils, JoplinDataUtils } from './utils';
import { FolderMappingData, JoplinFolder, SystemFolder, jsonToFolderMappingData } from './dto/folderMappingData';
import { WebView } from './webView';
import * as path from 'path';

/**
 * 菜单项命令
 */
export enum MenuItemCommands {

    /**
     * 打开系统目录
     */
    OPEN_SYSTEM_FOLDER = "FolderMapping_Menu_OpenSystemFolder",

    /**
     * 同步目录结构
     */
    SYNCHRONOUS_DIRECTORY_STRUCTURE = "FolderMapping_Menu_SynchronousDirectoryStructure",

    /**
     * 打开系统目录对比
     */
    OPEN_FOLDER_COMPARE = "FolderMapping_Menu_OpenFolderCompare",

}

/**
 * 动作行为命令
 */
export enum ActionItemCommands {

    /**
     * 打开系统目录
     */
    OPEN_SYSTEM_FOLDER = "FolderMapping_Action_OpenSystemFolder",
}

// 菜单项命令
const MENU_ITEM_COMMANDS = [
    {
        name: MenuItemCommands.OPEN_SYSTEM_FOLDER,
        label: '打开系统目录',
        execute: async () => {
            const selectedFolder = await joplin.workspace.selectedFolder();
            if (selectedFolder) {
                await joplin.commands.execute(ActionItemCommands.OPEN_SYSTEM_FOLDER, selectedFolder);
            } else {
                await joplin.views.dialogs.showMessageBox('No notebook selected');
            }
        },
    },
    {
        name: MenuItemCommands.SYNCHRONOUS_DIRECTORY_STRUCTURE,
        label: '同步目录结构',
        execute: async () => {
            // 获取设置中的默认根路径
            const systemRootPath = await SystemUtils.getSystemRootPath();
            // 数据存储对象
            const folderMappingData: FolderMappingData = new FolderMappingData(systemRootPath, [], []);
            // 获取所有Joplin的目录
            const folders = await JoplinFolderUtils.getFolders();
            const foldersItems =  folders["items"];
            if (foldersItems) {
                for (const index in foldersItems) {
                    const item = foldersItems[index];
                    const joplinFolderPath = await JoplinFolderUtils.getFolderPath(item["id"]);
                    const systemFolderExists = await SystemUtils.pathExists(systemRootPath + joplinFolderPath);
                    folderMappingData.joplinFolders.push(new JoplinFolder(item["id"], item["title"], item["parent_id"], joplinFolderPath, systemFolderExists));
                }
            }
            // 获取系统目录列表
            const systemFolders = await SystemUtils.getSystemFolders(systemRootPath);
            if (systemFolders) {
                for(const index in systemFolders) {
                    const path = systemFolders[index];
                    const id = await SystemUtils.getSystemFolderPersistentId(path);
                    folderMappingData.systemFolders.push(new SystemFolder(id, path));
                }
            }
            // 保存数据
            JoplinDataUtils.saveData(folderMappingData);
        },
    },
    {
        name: MenuItemCommands.OPEN_FOLDER_COMPARE,
        label: '打开目录对比',
        execute: async () => {
            // 获取数据
            const folderMappingDataJson = await JoplinDataUtils.getData();
            console.log("folderMappingDataJson", folderMappingDataJson);
            const folderMappingData = jsonToFolderMappingData(folderMappingDataJson);
            // 目录对比
            folderMappingData.compares = []
            folderMappingData.compares.push({
                "id": "daf"
            });
            // 保存数据
            JoplinDataUtils.saveData(folderMappingData);
            // 打开窗口
            WebView.getInstance().openDialog();
        },
    }
];

// 动作行为命令
const ACTION_ITEM_COMMANDS = [
    {
        name: ActionItemCommands.OPEN_SYSTEM_FOLDER,
        label: '打开系统目录',
        execute: async (selectedFolder: any) => {
            const folderId = selectedFolder ? selectedFolder.id : null;
            if (folderId) {
                // 获取设置中的默认根路径
                const defaultFolderPath = await SystemUtils.getSystemRootPath();
                // 通过目录ID获取目录路径
                const folderPath = await JoplinFolderUtils.getFolderPath(folderId);
                // 拼接系统目录路径
                const fullFolderPath = path.join(defaultFolderPath, folderPath);
                // 创建系统目录如果不存在时
                SystemUtils.createSystemFolderOfNotExist(fullFolderPath);
                // 打开系统目录
                SystemUtils.openSystemFolder(fullFolderPath);
            } else {
                console.info('No folder ID provided');
            }
        },
    }
];

export const setupCommands = async () => {
    [...ACTION_ITEM_COMMANDS, ...MENU_ITEM_COMMANDS].forEach(item => {
        joplin.commands.register(item);
    });
};
