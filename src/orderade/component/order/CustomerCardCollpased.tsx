import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { useRetailStore } from '../../hooks/VisitDetailHook'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import { renderStoreIcon } from '../visits/CustomerCard'
import { VisitStatus } from '../../enum/VisitType'

export const COLLAPESED_HEIGHT = 80
const TRANSFORM_DISTANCE = 2
const styles = StyleSheet.create({
    ...commonStyle,
    container: {
        width: '100%',
        backgroundColor: baseStyle.color.white,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 2
    },
    statusDot: {
        backgroundColor: baseStyle.color.purple,
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 12
    },
    font_18_900: {
        fontSize: 18,
        fontWeight: '900'
    },
    chevron_left: {
        ...commonStyle.chevron,
        marginRight: 20,
        marginTop: 3,
        width: 12,
        height: 12,
        borderTopWidth: 3,
        borderRightWidth: 3
    }
})

interface CustomerCardProps {
    visitId?: string
    storeId: string
    parentInitialOffsetTop: number
    onGoBack: () => void
    paddingTop?: number
    store?: any
    actions?: React.JSX.Element
    animatedTranslateY: any
}

const CustomerCardCollapsed = (props: CustomerCardProps) => {
    const storeFromQuery = useRetailStore(props.storeId)
    const {
        store: storeFromProps,
        actions,
        parentInitialOffsetTop,
        paddingTop = 0,
        onGoBack,
        animatedTranslateY
    } = props
    const [isVisible, setIsVisible] = useState<boolean>(false)
    const isVisibleRef = useRef<boolean>(false)

    useEffect(() => {
        const handle = animatedTranslateY.addListener((i: any) => {
            const animateMax = parentInitialOffsetTop - COLLAPESED_HEIGHT - paddingTop
            if (animateMax - i.value < TRANSFORM_DISTANCE) {
                if (!isVisibleRef.current) {
                    isVisibleRef.current = true
                    setIsVisible(true)
                }
            } else {
                if (isVisibleRef.current) {
                    isVisibleRef.current = false
                    setIsVisible(false)
                }
            }
        })
        return () => {
            animatedTranslateY.removeListener(handle)
        }
    }, [parentInitialOffsetTop])

    const store = storeFromProps || storeFromQuery
    if (!store) {
        return null
    }
    const { StoreName = '', CustUniqId = '' } = store
    let animatedOpacity
    if (parentInitialOffsetTop > 0) {
        const animateMax = parentInitialOffsetTop - COLLAPESED_HEIGHT - paddingTop
        animatedOpacity = animatedTranslateY.interpolate({
            inputRange: [0, animateMax - TRANSFORM_DISTANCE, animateMax],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp'
        })
    } else {
        animatedOpacity = 0
    }
    const isCompletedVisit = store.Status === VisitStatus.COMPLETE
    const isInProgressVisit = store.Status === VisitStatus.IN_PROGRESS
    return (
        <Animated.View
            pointerEvents={isVisible ? 'auto' : 'none'}
            style={[
                styles.container,
                styles.flexRowCenter,
                styles.paddingHorizontal_22,
                {
                    paddingTop: 20,
                    height: COLLAPESED_HEIGHT + paddingTop,
                    opacity: isVisible ? animatedOpacity : 0
                }
            ]}
        >
            <TouchableOpacity style={[styles.chevron_left]} onPress={onGoBack} hitSlop={styles.hitSlop30} />
            <View style={styles.marginRight_22}>
                {renderStoreIcon(store, styles.iconLarge)}
                {isCompletedVisit && <View style={[styles.statusDot, { backgroundColor: baseStyle.color.green }]} />}
                {isInProgressVisit && <View style={styles.statusDot} />}
            </View>
            <View style={[styles.flex_1, styles.marginRight_22, styles.flexDirectionColumn]}>
                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.font_18_900}>
                    {StoreName}
                </CText>
                {CustUniqId && (
                    <CText numberOfLines={1} ellipsizeMode="tail" style={styles.font_12_700}>
                        {t.labels.PBNA_MOBILE_NUMBER_SIGN + CustUniqId}
                    </CText>
                )}
            </View>
            {actions}
        </Animated.View>
    )
}

export default CustomerCardCollapsed
