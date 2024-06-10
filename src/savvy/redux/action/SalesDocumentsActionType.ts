export enum SalesDocumentsActionType {
    ADD_SUCCESS_DOWNLOAD_FILES = 'add_success_download_files',
    DELETE_EXECUTED_FILES = 'delete_executed_files'
}

export const addSuccessDownloadFilesAction = (fileUrlStr: string) => {
    return {
        type: SalesDocumentsActionType.ADD_SUCCESS_DOWNLOAD_FILES,
        value: fileUrlStr
    }
}

export const deleteExecutedFilesAction = (fileUrlStr: string) => {
    return {
        type: SalesDocumentsActionType.DELETE_EXECUTED_FILES,
        value: fileUrlStr
    }
}
