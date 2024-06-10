/*
 * @Description:
 * @Author: fangfang ji
 * @Date: 2021-08-03 20:14:28
 * @LastEditTime: 2022-02-16 04:44:58
 * @LastEditors: Mary Qian
 */

import React from 'react'
import { RefreshControl } from 'react-native'
import { t } from '../../../../common/i18n/t'

const RefreshControlM = (props: any) => {
    const { loading, refreshAction } = props
    return (
        <RefreshControl
            title={t.labels.PBNA_MOBILE_LOADING}
            tintColor={'#00A2D9'}
            titleColor={'#00A2D9'}
            refreshing={loading}
            onRefresh={() => refreshAction && refreshAction()}
        />
    )
}

export default RefreshControlM
