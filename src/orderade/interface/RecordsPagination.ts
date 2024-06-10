export interface MoveCursorToNextInput {
    cursorRef: any
    records: Array<any>
    currentPageRef: any
    setRecords: Function
    totalPageRef: any
    fields: Array<string>
    soupName: string
    transformRecords?: Function
}
