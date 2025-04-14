import React, { useEffect } from 'react';
import { SystemFile } from '../dto/folderMappingData';
import { SettingKey } from '../types';
import { JoplinMessageEvent, WebviewMessageEvent } from '../webviewTypes';

const SystemFileList: React.FC = () => {
    const [ systemFiles, setSystemFiles ] = React.useState<SystemFile[]>([]);
    const [ settings, setSettings ] = React.useState<Record<string, any>>({});
    useEffect(() => {
        // 监听Joplin发送的消息
        webviewApi.onMessage((payload: any) => {
            // 接收文件列表数据
            if (payload.message.event === JoplinMessageEvent.SYSTEM_FILES) {
                setSystemFiles(payload.message.data);
            }
        });
        // 获取面板设置项
        webviewApi.postMessage({ event: WebviewMessageEvent.GET_FILE_PANEL_SETTINGS}).then((settings: Record<string, any>) => {
            setSettings(settings);
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

    const renderSystemFileListItem = (file: SystemFile, index: number) => {
        if (!file || (settings[SettingKey.SYSTEM_FILE_PANEL_IS_SHOW_HIDDEN_FILES] === false && file.isHidden)) {
            return;
        }
        return (
            <li key={index} onDoubleClick={() => { openFileClick(file) }}>
                <span>{file.name}</span>
            </li>
        );
    }

    const renderSystemFileList = () => {
        if (!systemFiles || systemFiles.length === 0) {
            return (
                <div className="empty">
                    <span>没有系统文件</span>
                </div>
            );
        }
        return (
            <ul style={{ height: settings[SettingKey.SYSTEM_FILE_PANEL_HEIGHT_SETTING] + 'px' }}>
                {systemFiles.map((file: SystemFile, index: number) => (
                    renderSystemFileListItem(file, index)
                ))}
            </ul>
        );
    }

    return (
        <div className="system-file-list">
            <div className='header'>
                <span>系统文件</span>
                <span className='help-tips' data-tips='双击列表中文件名打开文件'>?</span>
                <i onClick={() => {openFolderClick()}}>打开</i>
            </div>
            {renderSystemFileList()}
        </div>
    );
};

export default SystemFileList;
