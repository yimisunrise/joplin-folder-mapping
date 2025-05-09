import { WebView } from "src/webview";
import { WebviewMessageEvent } from "./webviewTypes";
import { Commands } from "./commands";

function webviewBridge(instence: WebView) {
    return async (request) => {
        switch (request.event) {
            case WebviewMessageEvent.GET_FILE_PANEL_SETTINGS:
                // 获取系统文件面板设置
                return instence.getSystemFilePanelSettings();
            case WebviewMessageEvent.NOTIFICATION_UPDATE_SYSTEM_FILES:
                // 发送系统文件列表数据
                return instence.sendSystemFilePanelData();
            case WebviewMessageEvent.OPEN_FILE:
                // 打开文件
                return instence.systemUtils.openFileOrFolder(request.data);
            case WebviewMessageEvent.OPEN_SELECTED_FOLDER:
                // 打开当前选中的笔记本对应的系统文件夹
                return instence.executeCommand(Commands.OPEN_SYSTEM_FOLDER_BY_SELECTED);
            case WebviewMessageEvent.CREATE_NOTEBOOK_AT_CURRENT_NOTEBOOK:
                console.log("创建笔记本:", request.data);
                // 创建笔记本
                return instence.executeCommand(Commands.CREATE_NOTEBOOK_AT_CURRENT_NOTEBOOK, request.data);
            default:
                break;
        }
    };
}

export default webviewBridge;
