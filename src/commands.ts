import joplin from 'api';
import { JoplinFolderUtils, SystemUtils, JoplinDataUtils } from './utils';
import * as path from 'path';


/**
 * 笔记本右键菜单项
 */
export enum FolderMenuItem {

    /**
     * 打开系统目录
     */
    OPEN_SYSTEM_FOLDER = "FolderMapping_MenuOfFolder_OpenSystemFolder",

    /**
     * 同步目录结构
     */
    SYNCHRONOUS_DIRECTORY_STRUCTURE = "FolderMapping_MenuOfFolder_SynchronousDirectoryStructure",

}

/**
 * 动作行为命令项
 */
export enum ActionItem {

    /**
     * 打开系统目录
     */
    OPEN_SYSTEM_FOLDER = "FolderMapping_Action_OpenSystemFolder",

}

/**
 * 笔记本右键菜单项目注册
 */
export class FolderMenuRegister {

    static async init() {
        this.openSystemFolder();
        this.synchronousDirectoryStructure();
    }

    /**
     * 打开系统目录
     */
    private static async openSystemFolder() {
        await joplin.commands.register({
            name: FolderMenuItem.OPEN_SYSTEM_FOLDER,
            label: '打开系统目录',
            execute: async () => {
                const selectedFolder = await joplin.workspace.selectedFolder();
                if (selectedFolder) {
                    await joplin.commands.execute(ActionItem.OPEN_SYSTEM_FOLDER, selectedFolder);
                } else {
                    await joplin.views.dialogs.showMessageBox('No notebook selected');
                }
            },
        });
    }

    /**
     * 同步目录结构
     */
    private static async synchronousDirectoryStructure() {
        await joplin.commands.register({
            name: FolderMenuItem.SYNCHRONOUS_DIRECTORY_STRUCTURE,
            label: '同步目录结构',
            execute: async () => {
                // 数据存储对象
                const folderMappingData = {};
                // 获取设置中的默认根路径
                folderMappingData["system_root_path"] = await SystemUtils.getSystemRootPath();
                folderMappingData["joplin_folders"] = [];
                folderMappingData["system_folders"] = [];
                // 获取所有Joplin的目录
                const folders = await JoplinFolderUtils.getFolders();
                const foldersItems =  folders["items"];
                if (foldersItems) {
                    for (const index in foldersItems) {
                        try {
                            const item = foldersItems[index];
                            const joplinFolderPath = await JoplinFolderUtils.getFolderPath(item["id"])
                            folderMappingData["joplin_folders"].push({
                                "id": item["id"],
                                "parent_id": item["parent_id"],
                                "title": item["title"],
                                "joplin_folder_path": joplinFolderPath,
                                "system_folder_exists": await SystemUtils.pathExists(folderMappingData["system_root_path"] + joplinFolderPath),
                            });
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    }
                }
                // 获取系统目录列表
                const systemFolders = await SystemUtils.getSystemFolders(folderMappingData["system_root_path"])
                for(const index in systemFolders) {
                    const path = systemFolders[index];
                    folderMappingData["system_folders"].push({
                        "id": await SystemUtils.getSystemFolderPersistentId(path),
                        "path": path,
                    });
                }
                // 保存数据
                JoplinDataUtils.saveData(folderMappingData);
            },
        });
    }

}

/**
 * 动作事件注册
 */
export class ActionRegister {

    static async init() {
        this.openSystemFolder();
    }

    /**
     * 打开系统文件夹
     */
    static async openSystemFolder(){
        await joplin.commands.register({
            name: ActionItem.OPEN_SYSTEM_FOLDER,
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
        });
    }
}
