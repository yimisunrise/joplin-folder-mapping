import { WebView } from "src/webView";
import { WebviewMessageEvent } from "./webViewTypes";
import { Commands } from "./commands";

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
                return instence.executeCommand(Commands.OPEN_SYSTEM_FOLDER_BY_SELECTED);
            default:
                break;
        }
    };
}

export default webviewBridge;
