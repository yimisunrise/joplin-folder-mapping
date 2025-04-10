import joplin from 'api';
import { ViewHandle } from 'api/types';

export class DialogView {
    private static instance: DialogView;

    private viewHandle: ViewHandle | null = null;
    private viewId: string = 'FolderMappingDialogView';
    private viewCssPath: string = './webview/style.css';
    private viewJsPath: string = './main.js';

    private constructor() {
        // 私有构造函数防止外部实例化
    }

    public static getInstance(): DialogView {
        if (!DialogView.instance) {
            DialogView.instance = new DialogView();
        }
        return DialogView.instance;
    }

    /**
     * 打开对话框
     */
    public async openDialog(): Promise<void> {
        if (!this.viewHandle) {
            this.viewHandle = await joplin.views.dialogs.create(this.viewId);
            await joplin.views.dialogs.setFitToContent(this.viewHandle, false);
            await joplin.views.dialogs.setButtons(this.viewHandle, [
                {
                    id: 'cancel',
                    title: '关闭'
                }
            ]);
            await joplin.views.dialogs.setHtml(this.viewHandle, `
                <div id="lgapp">loading</div>
            `);
            await joplin.views.dialogs.addScript(this.viewHandle, this.viewCssPath);
            await joplin.views.dialogs.addScript(this.viewHandle, this.viewJsPath);
        }
        // 显示对话框
        const result = await joplin.views.dialogs.open(this.viewHandle);
        console.log('对话框，结果：', result);
    }

}
