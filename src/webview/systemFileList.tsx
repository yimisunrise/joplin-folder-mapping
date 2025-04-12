import React, { useEffect } from 'react';
import { FolderMappingData, SystemFolder, jsonToFolderMappingData } from '../dto/folderMappingData';

const SystemFileList: React.FC = () => {
    const [ data, setData ] = React.useState<FolderMappingData>(null);
    useEffect(() => {
        // webviewApi.postMessage({ event: 'getData', data: '' }).then((response: string) => {
        //     setData(jsonToFolderMappingData(response));
        // })
        webviewApi.onMessage((payload: any) => {
            if (payload.message.event === 'message') {
                console.log('Received ---- 18 ----', payload.message.data);
                setData(jsonToFolderMappingData(payload.message.data));
            }
        });
    }, []);

    const handleClick = (folder: SystemFolder) => {
        alert(folder.path);
    };

    return (
        <div>
            <h2>系统文件</h2>
            <ul>
            {data && data.joplinFolders.map((folder: SystemFolder, index: number) => (
                <li key={index}>
                    <div onClick={()=>{handleClick(folder)}}>{folder.path}</div>
                </li>
            ))}
            </ul>
        </div>
    );
};

export default SystemFileList;
