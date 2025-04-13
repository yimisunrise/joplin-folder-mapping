
/**
 * Webview组建UI的ID
 */
export enum WebViewID {
    COMPARE_DIALOG = 'compareDialog',
    SYSTEM_FILE_PANEL = 'systemFilePanel',
}

/**
 * 从Joplin发送到Webview的消息事件
 * @enum {string}
 */
export enum JoplinMessageEvent {
    SYSTEM_FILES = 'SYSTEM_FILES'
}

/**
 * 从Webview发送到Joplin的消息事件
 * @enum {string}
 */
export enum WebviewMessageEvent {
    OPEN_FILE = 'openFile',
    OPEN_SELECTED_FOLDER = 'openSelectedFolder',
    GET_FILE_PANEL_HEIGHT = 'getFilePanelHeight',
}