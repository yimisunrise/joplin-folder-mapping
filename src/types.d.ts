
declare const webviewApi: {
    postMessage: <T>(payload: any) => Promise<T>;
};