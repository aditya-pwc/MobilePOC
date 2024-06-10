/**
 * @description The wrapper for collapsible section.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React, { FC, useState, ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'
import ChevronSvg from '../../../../assets/image/ios-chevron.svg'
import Collapsible from '../../../common/components/Collapsible'
import InfoSvg from '../../../../assets/image/icon-info-blue.svg'
import Tooltip from 'react-native-walkthrough-tooltip'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    collapseContainer: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    topLine: {
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    collapseTitleContainer: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
        backgroundColor: 'white'
    },
    toolTipContainer: {
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 10,
        backgroundColor: baseStyle.color.white,
        borderRadius: 4,
        padding: 0,
        alignSelf: 'flex-start',
        marginLeft: 40,
        marginTop: -15
    },
    toolTipTriangle: {
        width: 0,
        height: 0,
        bottom: 20,
        borderWidth: 15,
        borderTopWidth: 15,
        borderColor: 'transparent',
        borderTopColor: '#fff',
        marginBottom: -30
    },
    backupTitleStyle: {
        fontWeight: '900',
        fontSize: 18
    },
    tooltipContent: {
        fontWeight: '500',
        fontSize: 16
    },
    infoSvg: {
        width: 18,
        height: 18,
        marginLeft: 7
    },
    chevronSvgFallBack: {
        width: 19,
        height: 20
    },
    btnBasic: {
        color: '#0098D4',
        fontWeight: '700'
    }
})

interface CollapseContainerProps {
    showContent: any
    setShowContent: any
    title: any
    children?: any
    showEdit?: boolean
    showReset?: boolean
    reset?: any
    titleStyle?: any
    containerStyle?: any
    chevronStyle?: any
    noTopLine?: boolean
    noBottomLine?: boolean
    chevronIcon?: any
    metricsData?: any
    metricsSet?: any
    isAuthEnabled?: boolean
    loading?: boolean
    onPressEdit?
    showInfo?: any
    titleComponents?: JSX.Element | ReactNode
    disable?: boolean
}

const CollapseContainer: FC<CollapseContainerProps> = (props: CollapseContainerProps) => {
    const {
        showContent,
        setShowContent,
        title,
        children,
        showEdit,
        noTopLine,
        noBottomLine,
        loading,
        onPressEdit,
        showInfo,
        titleComponents,
        disable = false
    } = props
    const [showTooltip, setShowTooltip] = useState(false)
    const renderItem = () => {
        return titleComponents || <CText style={props.titleStyle || styles.backupTitleStyle}>{title}</CText>
    }
    return (
        <View style={[!noTopLine && styles.topLine, !noBottomLine && styles.collapseContainer]}>
            <TouchableOpacity
                disabled={disable}
                onPress={() => {
                    setShowContent(!showContent)
                }}
                style={props.containerStyle || styles.collapseTitleContainer}
            >
                <View style={[commonStyle.flexRowAlignCenter, { flex: 1 }]}>
                    {renderItem()}
                    {showInfo && (
                        <Tooltip
                            content={<CText style={styles.tooltipContent}>{showInfo}</CText>}
                            placement={'top'}
                            isVisible={showTooltip}
                            onClose={() => {
                                setShowTooltip(false)
                            }}
                            backgroundStyle={{ backgroundColor: 'white' }}
                            backgroundColor={'rgba(0,0,0,0)'}
                            tooltipStyle={styles.toolTipContainer}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setShowTooltip(true)
                                }}
                                hitSlop={commonStyle.hitSlop15}
                            >
                                {showTooltip && <View style={styles.toolTipTriangle} />}
                                <InfoSvg style={styles.infoSvg} />
                            </TouchableOpacity>
                        </Tooltip>
                    )}
                    <ActivityIndicator
                        animating={!!loading}
                        hidesWhenStopped
                        style={{ marginLeft: title.length > 25 ? 0 : 10 }}
                    />
                    {showEdit && showContent && (
                        <TouchableOpacity
                            onPress={() => {
                                onPressEdit && onPressEdit()
                            }}
                            hitSlop={commonStyle.hitSlop30}
                        >
                            <CText
                                style={{
                                    ...styles.btnBasic,
                                    fontSize: 14,
                                    marginLeft: 10
                                }}
                            >
                                {t.labels.PBNA_MOBILE_EDIT.toUpperCase()}
                            </CText>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={commonStyle.flexRowCenter}>
                    <View>
                        {props.chevronIcon || (
                            <ChevronSvg
                                style={[
                                    props.chevronStyle || styles.chevronSvgFallBack,
                                    {
                                        transform: [{ rotate: showContent ? '0deg' : '180deg' }]
                                    }
                                ]}
                                fill={disable ? '#D3D3D3' : '#000000'}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
            <Collapsible collapsed={!showContent}>{children}</Collapsible>
        </View>
    )
}

export default CollapseContainer
