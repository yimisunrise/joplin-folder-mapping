import React, { useEffect } from 'react';
import { SystemFile } from '../dto/folderMappingData';
import { JoplinMessageEvent, WebviewMessageEvent } from '../webViewTypes';

const SystemFileList: React.FC = () => {
    const [ systemFiles, setSystemFiles ] = React.useState<SystemFile[]>(null);
    const [ panaleHeight, setPanaleHeight ] = React.useState<string>('500px');
    useEffect(() => {
        // 监听Joplin发送的消息
        webviewApi.onMessage((payload: any) => {
            // 接收文件列表数据
            if (payload.message.event === JoplinMessageEvent.SYSTEM_FILES) {
                setSystemFiles(payload.message.data);
            }
        });
        // 获取面板高度
        webviewApi.postMessage({ event: WebviewMessageEvent.GET_FILE_PANEL_HEIGHT}).then((height: string) => {
            setPanaleHeight(height);
        });
    }, []);

    // 打开点击的文件
    const openFileClick = (file: SystemFile) => {
        webviewApi.postMessage({ event: WebviewMessageEvent.OPEN_FILE, data: file.path });
    };

    // 打开当前选中的笔记本对应的系统文件夹
    const openFolderClick = () => {
        webviewApi.postMessage({ event: WebviewMessageEvent.OPEN_SELECTED_FOLDER});
    };

    return (
        <div className="system-file-list">
            <div className='header'>
                <span>系统文件</span>
                <i onClick={() => {openFolderClick()}}>打开</i>
            </div>
            <ul style={{ height: panaleHeight }}>
            {systemFiles && systemFiles.map((file: SystemFile, index: number) => (
                <li key={index} onDoubleClick={()=>{openFileClick(file)}}>
                    <span title={file.name}>{file.name}</span>
                </li>
            ))}
            </ul>
        </div>
    );
};

export default SystemFileList;
