import joplin from 'api';
import { FolderUtils } from './utils';
import * as path from 'path';


/**
 * 笔记本右键菜单项
 */
export enum FolderMenuItem {

    /**
     * 打开系统目录
     */
    OPEN_SYSTEM_FOLDER = "FolderMapping_MenuOfFolder_OpenSystemFolder",

    TEST = "test",

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
        this.test();
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

    private static async test() {
        await joplin.commands.register({
            name: FolderMenuItem.TEST,
            label: '查看所有目录',
            execute: async () => {
                const folders = FolderUtils.getFolders();
                console.info(folders);
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
    }
}
