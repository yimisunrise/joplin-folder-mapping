
declare const webviewApi: {
    postMessage: <T>(payload: any) => Promise<T>;
    onMessage: (callback: (payload: any) => void) => void;
};