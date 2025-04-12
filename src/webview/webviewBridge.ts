import { DialogView } from "src/dialogView";

function webviewBridge(instence: DialogView) {
    console.log('webviewBridge--7->', instence);
    return (request) => {
        console.log('webviewBridge--9->', request);
        switch (request.event) {
            case 'getData':
                return instence.getData();
            default:
                break;
        }
    };
}

export default webviewBridge;
