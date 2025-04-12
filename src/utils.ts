import joplin from 'api';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

/**
 * Joplin目录工具类
 */
export class JoplinFolderUtils {

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
    
}


/**
 * 系统工具类
 */
export class SystemUtils {
    
    /**
     * 获取指定系统目录下的所有子目录（递归）
     * @param rootPath - 要扫描的根目录路径
     * @returns 所有子目录路径数组
     */
    static async getSystemFolders(rootPath: string): Promise<string[]> {
        if (!this.pathExists(rootPath)) {
            return [];
        }
        return this.getAllSubFolders(rootPath);
    }

    /**
     * 递归获取所有子目录
     * @param dirPath - 当前目录路径
     * @param result - 结果数组
     * @returns 所有子目录路径数组
     */
    private static getAllSubFolders(dirPath: string, result: string[] = []): string[] {
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                if (item.isDirectory()) {
                    const fullPath = path.join(dirPath, item.name);
                    result.push(fullPath);
                    this.getAllSubFolders(fullPath, result); // 递归调用
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error reading system folders:', error);
            return result;
        }
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
     * 判断操作系统中指定文件是否存在
     * @param filePath - 要检查的文件路径
     * @returns 如果文件存在则返回true，否则返回false
     */
    static fileExists(filePath: string): boolean {
        return fs.existsSync(filePath);
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

    /**
     * 获取系统目录的持久化唯一标识符
     * @param folderPath - 目录路径
     * @returns 目录的唯一标识符
     */
    static async getSystemFolderPersistentId(folderPath: string): Promise<string> {
        if (!this.pathExists(folderPath)) {
            throw new Error(`目录不存在: ${folderPath}`);
        }

        try {
            const stats = fs.statSync(folderPath);
            if (!stats.isDirectory()) {
                throw new Error(`路径不是目录: ${folderPath}`);
            }

            // 跨平台唯一标识符方案
            if (process.platform === 'win32') {
                // Windows系统：使用文件创建时间和大小组合作为唯一标识
                const birthtime = stats.birthtimeMs || stats.ctimeMs;
                return `${birthtime}-${stats.size}`;
            } else if (process.platform === 'darwin') {
                // macOS系统：使用inode和创建时间组合
                const birthtime = stats.birthtimeMs || stats.ctimeMs;
                return `mac-${stats.ino}-${birthtime}`;
            } else {
                // Unix/Linux系统：使用inode
                return `unix-${stats.ino}`;
            }
        } catch (error) {
            console.error('获取目录唯一标识符失败:', error);
            throw error;
        }
    }
}

/**
 * 数据工具类
 */
export class JoplinDataUtils {

    /**
     * 数据文件路径
     */
    private static dataFileName =  "data.json";

    /**
     * 数据对象
     */
    private static dataObj = undefined;

    /**
     * 获取数据文件路径
     * @returns 
     */
    static async getDataFilePath(): Promise<string> {
        // 文件路径
        return await this.getPluginDataDir() + "/" + this.dataFileName;
    }

    /**
     * 获取插件数据目录
     * @returns 插件数据目录
     */
    static async getPluginDataDir(): Promise<string> {
        const dataDir = await joplin.plugins.dataDir();
        console.log("dataDir:", dataDir);
        return dataDir;
    }

    /**
     * 读取JSON数据
     * @returns JSON数据
     */
    static async getData(): Promise<string | null> {
        try {
            const filePath = await this.getDataFilePath();
            if (!SystemUtils.fileExists(filePath)) {
                return null;
            }
            const data = fs.readFileSync(filePath, 'utf8');
            return data;
        } catch (error) {
            console.error('Error reading data:', error);
            return null;
        }
    }

    /**
     * 保存JSON数据
     * @param data - 要保存的JSON对象
     */
    static async saveData(data: any): Promise<void> {
        try {
            this.dataObj = data;
            const filePath = await this.getDataFilePath();
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

}
