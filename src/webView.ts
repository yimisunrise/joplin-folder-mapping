import joplin from 'api';
import { ViewHandle } from 'api/types';
import webviewBridge from './webViewBridge';
import { JoplinDataUtils, JoplinFolderUtils, SystemUtils } from './utils';
import { JoplinMessageEvent, WebViewID } from './webViewTypes';
import { getJoplinSettingValue, PanelShowType, SYSTEM_FILE_PANEL_HEIGHT_SETTING, SYSTEM_FILE_PANEL_SHOW_TYPE_SETTING, SYSTEM_FOLDER_ROOT_PATH } from './settings';

export class WebView {
    private static instance: WebView;

    public joplin = joplin;
    public joplinDataUtils = JoplinDataUtils;
    public systemUtils = SystemUtils;
    public joplinFolderUtils = JoplinFolderUtils;

    public viewHandles = {
        [WebViewID.SYSTEM_FILE_PANEL]: null as ViewHandle | null,
        [WebViewID.COMPARE_DIALOG]: null as ViewHandle | null,
    };

    private viewCssPath: string = './webview/style.css';
    private viewJsPath: string = './main.js';

    /**
     * 系统文件面板是否显示
     * @returns {Promise<boolean>} - 返回一个Promise，表示系统文件面板是否显示
     */
    public isSystemFilePanelShow = async (): Promise<boolean> => {
        const isSystemFilePanelShow = await getJoplinSettingValue(SYSTEM_FILE_PANEL_SHOW_TYPE_SETTING);
        return isSystemFilePanelShow === PanelShowType.SHOW;
    }

    /**
     * 获取系统文件面板高度
     * @returns 系统文件面板高度
     */
    public getSystemFilePanelHeight = async (): Promise<string> => {
        const systemFilePanelHeight = await getJoplinSettingValue(SYSTEM_FILE_PANEL_HEIGHT_SETTING);
        return systemFilePanelHeight + 'px';
    }

    private constructor() {
        // 私有构造函数防止外部实例化
    }

    public static getInstance(): WebView {
        if (!WebView.instance) {
            WebView.instance = new WebView();
        }
        return WebView.instance;
    }

    /**
     * 打开对话框
     */
    public async openDialog(): Promise<void> {
        let viewHandle = this.viewHandles[WebViewID.COMPARE_DIALOG];
        if (!viewHandle) {
            viewHandle = await joplin.views.dialogs.create(WebViewID.COMPARE_DIALOG);
            this.viewHandles[WebViewID.COMPARE_DIALOG] = viewHandle;
            await joplin.views.dialogs.setFitToContent(viewHandle, false);
            await joplin.views.dialogs.setButtons(viewHandle, [
                {
                    id: 'cancel',
                    title: '关闭'
                }
            ]);
            await joplin.views.dialogs.setHtml(viewHandle, `
                <div id="${WebViewID.COMPARE_DIALOG}">loading</div>
            `);
            await joplin.views.panels.onMessage(viewHandle, webviewBridge(this));
            await joplin.views.dialogs.addScript(viewHandle, this.viewCssPath);
            await joplin.views.dialogs.addScript(viewHandle, this.viewJsPath);
        }
        // 显示
        const result = await joplin.views.dialogs.open(viewHandle);
        console.log('对话框，结果：', result);
    }


    /**
     * 初始化系统文件面板
     * @returns
     */
    public async initSystemFilePanel(): Promise<void> {
        // 获取面板实例
        let viewHandle = this.viewHandles[WebViewID.SYSTEM_FILE_PANEL];
        // 判断是否显示系统文件面板
        const isSystemFilePanelShow = await this.isSystemFilePanelShow();
        // 如果面板需要现实但面板未创建，则需要创建
        if (isSystemFilePanelShow && !viewHandle) {
            viewHandle = await joplin.views.panels.create(WebViewID.SYSTEM_FILE_PANEL);
            this.viewHandles[WebViewID.SYSTEM_FILE_PANEL] = viewHandle;
            await joplin.views.panels.setHtml(viewHandle, `
                <div id="${WebViewID.SYSTEM_FILE_PANEL}">loading</div>
            `);
            await joplin.views.panels.onMessage(viewHandle, webviewBridge(this));
            await joplin.views.panels.addScript(viewHandle, this.viewCssPath);
            await joplin.views.panels.addScript(viewHandle, this.viewJsPath);
            await joplin.workspace.onNoteSelectionChange(async () => {
                const isSystemFilePanelShow = await joplin.views.panels.isActive(this.viewHandles[WebViewID.SYSTEM_FILE_PANEL]);
                if (isSystemFilePanelShow) {
                    // 获取笔记所在的目录
                    const folder = await joplin.workspace.selectedFolder();
                    if (folder) {
                        console.info('Current note folder:', folder.title);
                        JoplinFolderUtils.getFolderPath(folder.id).then(async (path) => {
                            // eslint-disable-next-line no-console
                            console.info('Current note folder path:', path);
                            // 获取设置中的默认根路径
                            const systemFolderRootPath = await getJoplinSettingValue(SYSTEM_FOLDER_ROOT_PATH);
                            // 在这里可以执行打开系统文件夹的操作
                            const files = await SystemUtils.getFiles(systemFolderRootPath + path);
                            // eslint-disable-next-line no-console
                            console.info('Files in system folder:', files);
                            // 发送数据到面板
                            await joplin.views.panels.postMessage(WebView.getInstance().viewHandles[WebViewID.SYSTEM_FILE_PANEL], {
                                event: JoplinMessageEvent.SYSTEM_FILES,
                                data: files,
                            });
            
                        }).catch((error) => {
                            // eslint-disable-next-line no-console
                            console.error('Error fetching folder path:', error);
                        });
                    }
                }
            });
            // 显示面板
            await joplin.views.panels.show(viewHandle);
        }

        // 如果面板已经创建
        if (viewHandle) {
            if (isSystemFilePanelShow) {
                await joplin.views.panels.show(viewHandle);
            } else {
                await joplin.views.panels.hide(viewHandle);
            }
        }
    }

    /**
     * 执行命令
     * @param command 
     * @param args 
     */
    public async executeCommand(command: string, ...args: any[]): Promise<void> {
        // 执行命令
        await joplin.commands.execute(command, ...args);
    }

}

export const setupWebview = async () => {
    // 初始化系统文件面板
    setTimeout(() => {
        WebView.getInstance().initSystemFilePanel();
    }, 100);
    // 监听设置项变化
    joplin.settings.onChange(async (event) => {
        console.log('Setting changed keys:', event.keys);
        // 如果是系统文件面板的设置项变化
        if (event.keys.includes(SYSTEM_FILE_PANEL_SHOW_TYPE_SETTING)) {
            // 更新系统文件面板
            await WebView.getInstance().initSystemFilePanel();
        }
    });
};