import joplin from 'api';
import { ViewHandle } from 'api/types';
import webviewBridge from './webViewBridge';
import { JoplinDataUtils } from './utils';
import { WebViewID } from './webViewType';
import { getJoplinSettingValue, PanelShowType, SYSTEM_FILE_PANEL_SHOW_TYPE_SETTING } from './settings';

export class WebView {
    private static instance: WebView;

    public joplin = joplin;

    public viewHandles = {
        [WebViewID.SYSTEM_FILE_PANEL]: null as ViewHandle | null,
        [WebViewID.COMPARE_DIALOG]: null as ViewHandle | null,
    };

    private viewCssPath: string = './webview/style.css';
    private viewJsPath: string = './main.js';

    private constructor() {
        // 私有构造函数防止外部实例化
    }

    public static getInstance(): WebView {
        if (!WebView.instance) {
            WebView.instance = new WebView();
        }
        return WebView.instance;
    }

    public getData = async (): Promise<string | null> => {
        return JoplinDataUtils.getData();
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
                <div id="compareDialog">loading</div>
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
        let viewHandle = this.viewHandles[WebViewID.SYSTEM_FILE_PANEL];
        if (!viewHandle) {
            viewHandle = await joplin.views.panels.create(WebViewID.SYSTEM_FILE_PANEL);
            this.viewHandles[WebViewID.SYSTEM_FILE_PANEL] = viewHandle;
            await joplin.views.panels.setHtml(viewHandle, `
                <div id="systemFilePanel">loading</div>
            `);
            await joplin.views.panels.onMessage(viewHandle, webviewBridge(this));
            await joplin.views.panels.addScript(viewHandle, this.viewCssPath);
            await joplin.views.panels.addScript(viewHandle, this.viewJsPath);
        }
        this.updateSystemFilePanel();
    }

    /**
     * 更新系统文件面板
     * @returns
     * @description 通过设置项的值来决定是否显示系统文件面板
     */
    public async updateSystemFilePanel(): Promise<void> {
        const isShow = (await getJoplinSettingValue(SYSTEM_FILE_PANEL_SHOW_TYPE_SETTING) === PanelShowType.SHOW);
        if (isShow) {
            await joplin.views.panels.show(this.viewHandles[WebViewID.SYSTEM_FILE_PANEL]);
        } else {
            await joplin.views.panels.hide(this.viewHandles[WebViewID.SYSTEM_FILE_PANEL]);
        }
    }

}

export const setupWebview = async () => {
    setTimeout(() => {
        WebView.getInstance().initSystemFilePanel();
    }, 300);
};