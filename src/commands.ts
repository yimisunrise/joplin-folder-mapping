import joplin from 'api';
import { JoplinFolderUtils, SystemUtils, JoplinDataUtils } from './utils';
import { FolderMappingData, JoplinFolder, SystemFolder, jsonToFolderMappingData } from './entitys';
import { WebView } from './webview';
import * as path from 'path';
import { getSettingValue } from './settings';
import { SettingKey } from './types';

/**
 * 命令项
 */
export enum Commands {

    /**
     * 打开选中记事本对应的系统目录
     */
    OPEN_SYSTEM_FOLDER_BY_SELECTED = "FolderMapping_OpenSystemFolderBySelected",

    /**
     * 打开指定路径的系统目录
     */
    OPEN_SYSTEM_FOLDER_BY_PATH = "FolderMapping_OpenSystemFolderByPath",

    /**
     * 同步目录结构
     */
    SYNCHRONOUS_DIRECTORY_STRUCTURE = "FolderMapping_SynchronousDirectoryStructure",

    /**
     * 打开目录对比窗口
     */
    OPEN_FOLDER_COMPARE_DIALOG = "FolderMapping_OpenFolderCompareDialog",

    /**
     * 测试
     */
    TEST = "FolderMapping_Test",
}

// 菜单项命令
const MENU_ITEM_COMMANDS = [
    {
        name: Commands.OPEN_SYSTEM_FOLDER_BY_SELECTED,
        label: '打开选中目录',
        execute: async () => {
            const selectedFolder = await joplin.workspace.selectedFolder();
            if (selectedFolder) {
                await joplin.commands.execute(Commands.OPEN_SYSTEM_FOLDER_BY_PATH, selectedFolder);
            } else {
                await joplin.views.dialogs.showMessageBox('No notebook selected');
            }
        },
    },
    {
        name: Commands.OPEN_SYSTEM_FOLDER_BY_PATH,
        label: '打开指定目录',
        execute: async (selectedFolder: any) => {
            const folderId = selectedFolder ? selectedFolder.id : null;
            if (folderId) {
                // 获取设置中的默认根路径
                const systemFolderRootPath = await getSettingValue(SettingKey.SYSTEM_FOLDER_ROOT_PATH);
                // 通过目录ID获取目录路径
                const folderPath = await JoplinFolderUtils.getFolderPath(folderId);
                // 拼接系统目录路径
                const fullFolderPath = path.join(systemFolderRootPath, folderPath);
                // 创建系统目录如果不存在时
                SystemUtils.createFolderOfNotExist(fullFolderPath);
                // 打开系统目录
                SystemUtils.openFileOrFolder(fullFolderPath);
            } else {
                console.info('No folder ID provided');
            }
        },
    },
    {
        name: Commands.SYNCHRONOUS_DIRECTORY_STRUCTURE,
        label: '同步目录结构',
        execute: async () => {
            // 获取设置中的默认根路径
            const systemFolderRootPath = await getSettingValue(SettingKey.SYSTEM_FOLDER_ROOT_PATH);
            // 数据存储对象
            const folderMappingData: FolderMappingData = new FolderMappingData(systemFolderRootPath, [], []);
            // 获取所有Joplin的目录
            const folders = await JoplinFolderUtils.getFolders();
            const foldersItems =  folders["items"];
            if (foldersItems) {
                for (const index in foldersItems) {
                    const item = foldersItems[index];
                    const joplinFolderPath = await JoplinFolderUtils.getFolderPath(item["id"]);
                    const systemFolderExists = await SystemUtils.pathExists(systemFolderRootPath + joplinFolderPath);
                    folderMappingData.joplinFolders.push(new JoplinFolder(item["id"], item["title"], item["parent_id"], joplinFolderPath, systemFolderExists));
                }
            }
            // 获取系统目录列表
            const systemFolders = await SystemUtils.getFolderFullPathList(systemFolderRootPath);
            if (systemFolders) {
                for(const index in systemFolders) {
                    const path = systemFolders[index];
                    const id = await SystemUtils.getFolderPersistentId(path);
                    folderMappingData.systemFolders.push(new SystemFolder(id, path));
                }
            }
            // 保存数据
            JoplinDataUtils.saveData(folderMappingData);
        },
    },
    {
        name: Commands.OPEN_FOLDER_COMPARE_DIALOG,
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
    },
    {
        name: Commands.TEST,
        label: '测试',
        execute: async () => {
            // TODO: 测试代码
            
        },
    }
];

export const setupCommands = async () => {
    MENU_ITEM_COMMANDS.forEach(item => {
        joplin.commands.register(item);
    });
};
