/*
 * @Description:
 * @LastEditors: Yi Li
 */

import React, { ForwardedRef, forwardRef, useState, useRef } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { t } from '../../../../../common/i18n/t'
import EmptyPos from '../../../../../../assets/image/empty_pos.svg'
import CText from '../../../../../common/components/CText'
import POSRequestModal from './POSRequestModal'
import { FullScreenModalRef } from '../../lead/common/FullScreenModal'
import _ from 'lodash'
import PosListView from './PosListView'
import POSDetailModal from './POSDetailModal'
interface PosViewProps {
    customer: any
    posList: any
    setRefreshListFlag: any
}
const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    containerStyle: {
        width: width,
        backgroundColor: '#F2F4F7',
        alignItems: 'center'
    },
    emptyCon: {
        marginTop: 120,
        alignItems: 'center'
    },
    emptyPos: {
        width: 118,
        height: 159
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginTop: 30
    },
    emptySubTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#565656',
        textAlign: 'center',
        marginTop: 8
    }
})

const renderEmptyView = () => {
    return (
        <View style={styles.emptyCon}>
            <EmptyPos style={styles.emptyPos} />
            <CText style={styles.emptyTitle}>{t.labels.PBNA_MOBILE_NO_NEW_REQUEST}</CText>
            <CText style={styles.emptySubTitle}>{t.labels.PBNA_MOBILE_NO_NEW_POINT}</CText>
        </View>
    )
}
const POSView = forwardRef((props: PosViewProps, ref: ForwardedRef<FullScreenModalRef>) => {
    const { customer, posList, setRefreshListFlag } = props
    const posDetailRef = useRef<FullScreenModalRef>(null)
    const [posHeaderDetail, setPosHeaderDetail] = useState({})

    const onPressTile = (item: any) => {
        setPosHeaderDetail(item)
        posDetailRef?.current?.openModal()
    }

    const renderListView = () => {
        if (_.size(posList) > 0) {
            return <PosListView dataList={posList} onPress={onPressTile} />
        }
        return renderEmptyView()
    }

    return (
        <View style={styles.containerStyle}>
            {renderListView()}
            <POSRequestModal
                ref={ref}
                customer={customer}
                onCloseModal={() => {
                    setRefreshListFlag((v) => v + 1)
                }}
            />
            <POSDetailModal cRef={posDetailRef} customer={customer} posHeaderDetail={posHeaderDetail} />
        </View>
    )
})

POSView.displayName = 'PosView'

export default POSView
