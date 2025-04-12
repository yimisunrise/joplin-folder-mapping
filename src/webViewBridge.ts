import { WebView } from "src/webView";

function webviewBridge(instence: WebView) {
    return (request) => {
        switch (request.event) {
            case 'getData':
                return instence.getData();
            default:
                break;
        }
    };
}

export default webviewBridge;
