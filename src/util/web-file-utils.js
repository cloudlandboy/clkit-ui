export function downloadFile(blobParts, options, fileName) {
    const url = createBlobUrl(blobParts, options);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

export function createBlobUrl(blobParts, options) {
    const blob = new Blob([blobParts], options);
    return window.URL.createObjectURL(blob);
}

export function downloadAxiosResponse(res) {
    downloadFile(res.data, { type: res.headers['content-type'] }, decodeURIComponent(res.headers['content-disposition'].substring(20)))
}