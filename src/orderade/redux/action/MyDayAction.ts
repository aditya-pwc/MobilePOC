export enum MyDayActionType {
    RevampTooltipDisabledList = 'revampTooltipDisabledList'
}

export const updateMissingPriceAction = (disabledList: string[]) => {
    return {
        type: MyDayActionType.RevampTooltipDisabledList,
        payload: disabledList
    }
}
