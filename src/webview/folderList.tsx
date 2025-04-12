import React, { useEffect } from 'react';
import { FolderMappingData, JoplinFolder, SystemFolder, jsonToFolderMappingData } from '../dto/folderMappingData';

// function handleMessage(event) {
  
//     // 2. 获取数据
//     // const receivedData = event.data;
//     console.log('Received:', event);
//   }

// console.log('webviewApi--89->', webviewApi, webviewApi.postMessage);

// window.addEventListener('message', handleMessage);

const FolderList: React.FC = () => {
    const [ folderData, setFolderData ] = React.useState<FolderMappingData>(null);
    useEffect(() => {
        webviewApi.postMessage({ event: 'getData', message: '' }).then((response: string) => {
            const data = jsonToFolderMappingData(response);
            console.log('data--89->', data);
            setFolderData(data);
        })
    }, []);

    const handleClick = (folder: JoplinFolder) => {
        console.log('folder--92->', folder);
        alert(folder.path);
    };

    return (
        <ul>
            {folderData && folderData.joplinFolders.map((joplinFolder: JoplinFolder, index: number) => (
                <li key={index}>
                    <div onClick={()=>{handleClick(joplinFolder)}}>{joplinFolder.path}</div>
                </li>
            ))}
        </ul>
    );
};

export default FolderList;
