import React, { useEffect, useState, useRef } from 'react';
import { SystemFile } from '../entitys';
import { SettingKey } from '../types';
import { JoplinMessageEvent, WebviewMessageEvent } from '../webviewTypes';

const SystemFileList: React.FC = () => {
    const [ systemFiles, setSystemFiles ] = useState<SystemFile[]>([]);
    const [ settings, setSettings ] = useState<Record<string, any>>({
        [SettingKey.SYSTEM_FILE_PANEL_HEIGHT_SETTING]: 500,
        [SettingKey.SYSTEM_FILE_PANEL_IS_SHOW_HIDDEN_FILES]: true,
        [SettingKey.SYSTEM_FILE_PANEL_MENU_ITEMS]: ["OPEN_FILE", "COPY_NAME", "COPY_PATH"],
    });
    const [ showPopupMenu, setShowPopupMenu] = useState(false);
    const [ clickX, setClickX] = useState('0px');
    const [ clickY, setClickY] = useState('0px');
    const [ selectedFile, setSelectedFile] = useState<SystemFile | null>(null);
    const contextMenu = useRef(null); 
    const allMenuItems = [
        {code: "OPEN_FILE", title: "打开文件", action: () => {
            openFileClick(selectedFile);
        }},
        {code: "COPY_NAME", title: "复制名称", action: () => {
            navigator.clipboard.writeText(selectedFile.title).then(() => {
                console.log('File name copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy file name: ', err);
            });
        }},
        {code: "COPY_PATH", title: "复制路径", action: () => {
            navigator.clipboard.writeText(selectedFile.path).then(() => {
                console.log('File path copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy file path: ', err);
            });
        }},
        {code: "MODIFY_NAME", title: "修改名称", action: () => {

        }},
        {code: "MOVE_PATH", title: "移动位置", action: () => {
            
        }},
        {code: "CREATE_NOTEBOOK", title: "创建笔记本", action: () => {
            webviewApi.postMessage({ event: WebviewMessageEvent.CREATE_NOTEBOOK_AT_CURRENT_NOTEBOOK, data: { title: selectedFile.title } });
        }},
    ];

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
        // 通知更新面板列表数据
        webviewApi.postMessage({ event: WebviewMessageEvent.NOTIFICATION_UPDATE_SYSTEM_FILES});

        // 监听其他地方的点击事件
        document.addEventListener('click', _handleClick);
    }, []);

    // 打开点击的文件
    const openFileClick = (file: SystemFile) => {
        webviewApi.postMessage({ event: WebviewMessageEvent.OPEN_FILE, data: file.path });
    };

    // 打开当前选中的笔记本对应的系统文件夹
    const openFolderClick = () => {
        webviewApi.postMessage({ event: WebviewMessageEvent.OPEN_SELECTED_FOLDER});
    };

    // 刷新当前选中的笔记本对应的系统文件夹
    const updateFolderClick = () => {
        webviewApi.postMessage({ event: WebviewMessageEvent.NOTIFICATION_UPDATE_SYSTEM_FILES});
    };

    // 事件
    const handlePopupMenu =(event:any, file: SystemFile) =>{
        // 右键菜单选择的文件
        setSelectedFile(file);
        // 显示右键菜单
        setShowPopupMenu(true)
        // 鼠标相对于浏览器窗口可视区域的X，Y坐标（窗口坐标）
        setClickX(event.clientX);
        setClickY(event.clientY);
    }
    // 右键菜单的位置，加减多少看自己，位置看着舒服就行
    const rightStyle = {
        left:`${clickX + 5}px`,
        top: `${clickY + 5}px`
    }

    const _handleClick =(event:any)=>{
        const wasOutside = !(event.target.contains === contextMenu);
        // 点击其他位置需要隐藏右键菜单
        if (wasOutside) setShowPopupMenu(false);
    }

    const handleMenuItemAction =(actionCode:string)=>{
        if (!selectedFile) {
            return;
        }
        allMenuItems.map((item) => {
            if (item.code === actionCode) {
                item.action();
            }
        });
    }

    const renderSystemFileListItem = (file: SystemFile, index: number) => {
        if (!file || (settings[SettingKey.SYSTEM_FILE_PANEL_IS_SHOW_HIDDEN_FILES] === false && file.isHidden)) {
            return;
        }
        return (
            <li key={index} onDoubleClick={() => { openFileClick(file) }} onContextMenu={(e) => { handlePopupMenu(e, file) }}>
                <i className={file.isDirectory ? 'icon-notebooks' : 'icon-notes'}></i>
                <span>{file.title}</span>
                { file.isDirectory && <span className='number'>{file.childrenCount}</span> }
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

    const renderMenuPanelItem = (actionCode: string, title: string) => {
        return (
            <div className='menu-item' onClick={() => { handleMenuItemAction(actionCode) }}>
                <span>{title}</span>
            </div>
        );
    }

    const renderMenuPanelPopup = () => {
        if (showPopupMenu) {
            return (
                <div className='popup-menu-panel' style={rightStyle} onMouseLeave={() => { setShowPopupMenu(false) }} ref={contextMenu}>
                    {allMenuItems.map((item) => {
                        if (settings[SettingKey.SYSTEM_FILE_PANEL_MENU_ITEMS].includes(item.code)) {
                            if (!selectedFile.isDirectory && item.code === "CREATE_NOTEBOOK") {
                                return null;
                            }
                            return renderMenuPanelItem(item.code, item.title);
                        }
                    })}
                </div>
            );
        }
    }

    return (
        <div className="system-file-list">
            <div className='header'>
                <span>系统文件</span>
                <span className='help-tips' data-tips='双击列表中文件名打开文件'>?</span>
                <span className='right-btns'>
                    <i className='icon-update' title='刷新列表' onClick={() => {updateFolderClick()}} ></i>
                    <i className='icon-forward' title='打开目录' onClick={() => {openFolderClick()}} ></i>
                </span>
            </div>
            {renderSystemFileList()}
            {renderMenuPanelPopup()}
        </div>
    );
};

export default SystemFileList;
