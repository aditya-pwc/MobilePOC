/**
 * @description The wrapper for collapsible section.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React, { FC, useState, ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../common/components/CText'
import { LeadDetailBaseProps } from '../../interface/LeadInterface'
import ChevronSvg from '../../../../assets/image/ios-chevron.svg'
import InnovationDistributionItem from '../rep/customer/metrics/InnovationDistributionItem'
import _ from 'lodash'
import Collapsible from '../../../common/components/Collapsible'
import { t } from '../../../common/i18n/t'
import InfoSvg from '../../../../assets/image/icon-info-blue.svg'
import Tooltip from 'react-native-walkthrough-tooltip'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'

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

interface CollapseContainerProps extends LeadDetailBaseProps {
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
    isMetrics?: boolean
    metricsData?: any
    metricsSet?: any
    isAuthEnabled?: boolean
    loading?: boolean
    onPressEdit?
    showInfo?: any
    titleComponents?: JSX.Element | ReactNode
    preload?: boolean
}

const CollapseContainer: FC<CollapseContainerProps> = (props: CollapseContainerProps) => {
    const {
        showContent,
        setShowContent,
        title,
        children,
        showEdit,
        showReset,
        reset,
        noTopLine,
        noBottomLine,
        isMetrics,
        metricsData,
        metricsSet,
        isAuthEnabled,
        loading,
        onPressEdit,
        showInfo,
        titleComponents,
        preload
    } = props
    const [showTooltip, setShowTooltip] = useState(false)
    const renderItem = () => {
        if (isMetrics) {
            return (
                <InnovationDistributionItem
                    showContent={showContent}
                    item={metricsData}
                    isAuthEnabled={isAuthEnabled}
                />
            )
        }
        return titleComponents || <CText style={props.titleStyle || styles.backupTitleStyle}>{title}</CText>
    }
    return (
        <View style={[!noTopLine && styles.topLine, !noBottomLine && styles.collapseContainer]}>
            <TouchableOpacity
                onPress={() => {
                    if (isMetrics) {
                        const temp = _.cloneDeep(metricsSet)
                        temp[metricsData.index] = !temp[metricsData.index]
                        setShowContent(temp)
                    } else {
                        setShowContent(!showContent)
                    }
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
                                    fontSize: showReset && title.length > 20 ? 10 : 14,
                                    marginLeft: showReset && title.length > 20 ? -20 : 10
                                }}
                            >
                                {t.labels.PBNA_MOBILE_EDIT.toUpperCase()}
                            </CText>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={commonStyle.flexRowCenter}>
                    {showReset && (
                        <TouchableOpacity style={{ marginRight: 10 }} onPress={reset}>
                            <CText
                                style={{
                                    ...styles.btnBasic,
                                    fontSize: showEdit && showContent && title.length > 20 ? 10 : 14,
                                    marginLeft: title.length > 25 ? -10 : 10
                                }}
                            >
                                {t.labels.PBNA_MOBILE_RESET.toUpperCase()}
                            </CText>
                        </TouchableOpacity>
                    )}
                    {!isMetrics && (
                        <View>
                            {props.chevronIcon || (
                                <ChevronSvg
                                    style={[
                                        props.chevronStyle || styles.chevronSvgFallBack,
                                        {
                                            transform: [{ rotate: showContent ? '0deg' : '180deg' }]
                                        }
                                    ]}
                                />
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            <Collapsible collapsed={!showContent} preload={preload}>
                {children}
            </Collapsible>
        </View>
    )
}

export default CollapseContainer
