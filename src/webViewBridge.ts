import { WebView } from "src/webView";
import { WebviewMessageEvent } from "./webViewTypes";
import { ActionItemCommands } from "./commands";

function webviewBridge(instence: WebView) {
    return async (request) => {
        switch (request.event) {
            case WebviewMessageEvent.GET_FILE_PANEL_HEIGHT:
                // 获取系统文件面板高度
                return instence.getSystemFilePanelHeight();
            case WebviewMessageEvent.OPEN_FILE:
                // 打开文件
                return instence.systemUtils.openFileOrFolder(request.data);
            case WebviewMessageEvent.OPEN_SELECTED_FOLDER:
                // 打开当前选中的笔记本对应的系统文件夹
                const selectedFolder = await instence.joplin.workspace.selectedFolder();
                return instence.executeCommand(ActionItemCommands.OPEN_SYSTEM_FOLDER, selectedFolder);
            default:
                break;
        }
    };
}

export default webviewBridge;
