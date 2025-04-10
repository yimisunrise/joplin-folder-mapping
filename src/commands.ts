import joplin from 'api';
import { JoplinFolderUtils, SystemUtils, JoplinDataUtils } from './utils';
import { DialogView } from './DialogView';
import * as path from 'path';


/**
 * 菜单项命令
 */
export enum CommandMenuItem {

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
export enum CommandActionItem {

    /**
     * 打开系统目录
     */
    OPEN_SYSTEM_FOLDER = "FolderMapping_Action_OpenSystemFolder",
}

/**
 * 命令注册
 */
export class CommandsRegister {

    static async init() {
        // 注册菜单项
        this.menuOfOpenSystemFolder();
        this.menuOfSynchronousDirectoryStructure();
        this.menuOfOpenFolderCompare();
        // 注册动作行为
        this.actionOfOpenSystemFolder();
    }

    /**
     * 打开系统目录
     */
    private static async menuOfOpenSystemFolder() {
        await joplin.commands.register({
            name: CommandMenuItem.OPEN_SYSTEM_FOLDER,
            label: '打开系统目录',
            execute: async () => {
                const selectedFolder = await joplin.workspace.selectedFolder();
                if (selectedFolder) {
                    await joplin.commands.execute(CommandActionItem.OPEN_SYSTEM_FOLDER, selectedFolder);
                } else {
                    await joplin.views.dialogs.showMessageBox('No notebook selected');
                }
            },
        });
    }

    /**
     * 同步目录结构
     */
    private static async menuOfSynchronousDirectoryStructure() {
        await joplin.commands.register({
            name: CommandMenuItem.SYNCHRONOUS_DIRECTORY_STRUCTURE,
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

    /**
     * 打开系统目录对比
     */
    private static async menuOfOpenFolderCompare() {
        await joplin.commands.register({
            name: CommandMenuItem.OPEN_FOLDER_COMPARE,
            label: '打开目录对比',
            execute: async () => {
                // 获取数据
                const folderMappingData = await JoplinDataUtils.getData();
                console.log("folderMappingData", folderMappingData);
                // 目录对比
                folderMappingData["folder_compare"] = [];
                // 保存数据
                JoplinDataUtils.saveData(folderMappingData);
                // 打开目录对比窗口
                DialogView.getInstance().openDialog();
            },
        });
    }

    /**
     * 打开系统文件夹
     */
    static async actionOfOpenSystemFolder(){
        await joplin.commands.register({
            name: CommandActionItem.OPEN_SYSTEM_FOLDER,
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
