import joplin from 'api';
import * as fs from 'fs';
import { exec } from 'child_process';

export class FolderUtils {

    /**
     * 根据目录ID获取目录对象
     * @param folderId - 目录的ID
     * @returns 目录对象
     */
    static async getFolderById(folderId: string) {
        try {
            const folder = await joplin.data.get(['folders', folderId], { fields: ['id', 'title', 'parent_id'] });
            return folder;
        } catch (error) {
            console.error('Error fetching folder:', error);
            throw error;
        }
    }

    /**
     * 获取所有目录列表
     * @returns
     */
    static async getFolders() {
        try {
            const folders = await joplin.data.get(['folders']);
            return folders;
        } catch (error) {
            console.error('Error fetching folders:', error);
            throw error;
        }
    }

    /**
     * 递归获取目录结构
     * @param parentId 
     * @param depth 
     */
    static async buildFolderTree(parentId: string = '', depth: number = 0) {
        const folders = await joplin.data.get(['folders'], {
          fields: ['id', 'title'],
          query: { parent_id: parentId },
        });
      
        for (const folder of folders.items) {
          console.log('  '.repeat(depth) + '📁 ' + folder.title);
          // 递归子笔记本
          await this.buildFolderTree(folder.id, depth + 1); 
        }
    }

    /**
     * 根据目录ID生成从根至该目录的完整路径字符串，用斜杠分割目录
     * @param folderId - 目录的ID
     * @returns 从根至该目录的完整路径字符串
     */
    static async getFolderPath(folderId: string): Promise<string> {
        let fullPath = '';
        let currentFolderId = folderId;

        while (currentFolderId) {
            const folder = await this.getFolderById(currentFolderId);
            fullPath = `/${folder.title}${fullPath}`;
            currentFolderId = folder.parent_id;
        }

        return fullPath;
    }

    /**
     * 判断操作系统中指定路径是否存在
     * @param folderPath - 要检查的路径
     * @returns 如果路径存在则返回true，否则返回false
     */
    static pathExists(folderPath: string): boolean {
        return fs.existsSync(folderPath);
    }

    /**
     * 创建系统目录如果不存在时
     * @param folderPath - 要创建的目录路径
     */
    static createSystemFolderOfNotExist(folderPath: string): void {
        if (!this.pathExists(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            console.info(`系统目录已创建: ${folderPath}`);
        } else {
            console.info(`系统目录已存在: ${folderPath}`);
        }
    }

    /**
     * 打开系统目录
     * @param folderPath - 要打开的目录路径
     */
    static openSystemFolder(folderPath: string): void {
        if (this.pathExists(folderPath)) {
            switch (process.platform) {
                case 'win32':
                    exec(`start "" "${folderPath}"`);
                    break;
                case 'darwin':
                    exec(`open "${folderPath}"`);
                    break;
                case 'linux':
                    exec(`xdg-open "${folderPath}"`);
                    break;
                default:
                    console.error('Unsupported platform:', process.platform);
            }
        } else {
            console.error(`系统目录不存在: ${folderPath}`);
        }
    }
}