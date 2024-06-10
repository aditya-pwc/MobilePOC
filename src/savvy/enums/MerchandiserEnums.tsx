/*
 * @Description:
 * @Author: Yi Li
 * @Date: 2021-11-10 19:54:33
 * @LastEditTime: 2023-03-28 14:00:40
 * @LastEditors: Yi Li
 */

export enum COLOR_TYPE {
    RED = '#EB445A',
    PURPLE = '#6C0CC3',
    YELLOW = '#FFC409',
    GREEN = '#2DD36F',
    BLUE = '#00A2D9',
    GRAY = '#D3D3D3',
    EMPTY = ''
}
export enum POINT_TYPE {
    EVENT = 'event',
    BREADCRUMB = 'breadcrumb',
    FLAG = 'flag'
}
export enum ENTRY_TYPE {
    START = 'start',
    END = 'end'
}
export enum ARROW_TYPE {
    RED_UP = 'redUp',
    RED_DOWN = 'redDown',
    GREEN_UP = 'greenUp',
    GREEN_DOWN = 'greenDown',
    HIDDEN = 'hidden'
}
export enum NUMBER_VALUE {
    ZERO_NUM = 0,
    ONE_NUM = 1,
    TWO_NUM = 2,
    FOUR_NUM = 4,
    FIVE_NUM = 5,
    TEN_WIDTH = 10,
    THIRTY_NUM = 30,
    MARGIN_WIDTH = 44,
    TIME_UNIT = 60,
    NINETY_NUM = 90
}

export enum EVENT_EMITTER {
    REFRESH_MY_VISITS = 'RefreshMyVisits'
}

export enum RANGE_TYPE {
    IN = 'IN',
    OUT = 'OUT'
}

export enum AssessmentTask {
    NAME = 'Customer Signature',
    TYPE = 'Other'
}
