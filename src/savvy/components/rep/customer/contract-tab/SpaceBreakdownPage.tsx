import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View, Image, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import CText from '../../../../../common/components/CText'
import AuditStyle from '../../../../styles/manager/AuditStyle'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { t } from '../../../../../common/i18n/t'
import { Input } from 'react-native-elements'
import {
    checkShowOptimizationOrStash,
    getContractedShelves,
    getExecutionData,
    getScore,
    showComplianceScoreFormat
} from '../../../../helper/rep/AuditHelper'
import { formatNullValue } from './SpaceViewPage'
import _ from 'lodash'
import { setAuditData } from '../../../../redux/action/AuditAction'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

const styles = StyleSheet.create({
    ...AuditStyle,
    titleView: {
        marginLeft: 22,
        marginVertical: 25
    },
    title: {
        fontWeight: '900',
        fontSize: 18,
        fontStyle: 'normal',
        color: '#000000'
    },
    titleSmall: {
        fontSize: 14,
        fontWeight: '700'
    },
    filletCardView: {
        marginHorizontal: 22,
        marginBottom: 10,
        backgroundColor: '#F2F4F7',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    filletCardTitle: {
        fontWeight: '400',
        fontSize: 14,
        fontStyle: 'normal',
        color: '#000000',
        flex: 1
    },
    filletCardInput: {
        width: 'auto',
        paddingLeft: 6,
        paddingRight: 6,
        minWidth: 60,
        fontWeight: '700',
        fontSize: 16,
        fontStyle: 'normal',
        color: '#000000',
        textAlign: 'center',
        lineHeight: 36
    }
})
const TitleView = ({ title, titleStyle = null }: { title: string; titleStyle?: any }) => {
    return (
        <View style={[styles.titleView]}>
            <CText style={[styles.title, titleStyle]}>{title}</CText>
        </View>
    )
}
const FilletCard = ({ title, value }: { title: string; value: any }) => {
    return (
        <View style={styles.filletCardView}>
            <CText style={styles.filletCardTitle}>{title}</CText>
            <CText style={[styles.tableRowDisabledInput, styles.filletCardInput]}>{value}</CText>
        </View>
    )
}
const TableRowHeader = ({ children }: { children: any }) => {
    return (
        <View style={styles.auditTableRowHeaderView}>
            <CText style={styles.tableRowHeaderText}>{children}</CText>
        </View>
    )
}
const TableRow = ({ item }: { item: any }) => {
    const inputTotalStyle = styles.auditTableRowInput
    const getShelfDifferenceStyle = () => {
        if (item.differenceVal < 0) {
            return styles.auditTableRowRedInput
        } else if (item.differenceVal >= 0 && item.difference) {
            return styles.auditTableRowGreenInput
        }
        return null
    }
    const getDifferenceVal = () => {
        return `${item.differenceVal > 0 ? '+' : ''}${item.difference}`
    }
    return (
        <View style={[styles.tableRowView, { borderBottomColor: '#FFFFFF' }]}>
            <View style={styles.tableRowTitleView}>
                <CText style={styles.tableRowTitleText}>{item.title}</CText>
            </View>

            <View style={styles.tableRowInputContainer}>
                <Input
                    editable={false}
                    style={styles.auditTableInputStyle}
                    containerStyle={inputTotalStyle}
                    returnKeyType="done"
                    placeholder={''}
                    textAlign="center"
                    inputContainerStyle={styles.auditInputContainerStyle}
                    keyboardType="number-pad"
                    inputStyle={styles.auditTableRowInputStyle}
                    value={item.actual}
                />
                <Input
                    editable={false}
                    style={styles.auditTableInputStyle}
                    containerStyle={inputTotalStyle}
                    returnKeyType="done"
                    placeholder={'-'}
                    textAlign="center"
                    inputContainerStyle={styles.auditInputContainerStyle}
                    keyboardType="number-pad"
                    inputStyle={styles.auditTableRowInputStyle}
                    value={item.required}
                />
                <Input
                    style={styles.auditTableInputStyle}
                    editable={false}
                    containerStyle={[inputTotalStyle, getShelfDifferenceStyle()]}
                    returnKeyType="done"
                    placeholder={''}
                    textAlign="center"
                    inputContainerStyle={styles.auditInputContainerStyle}
                    keyboardType="number-pad"
                    inputStyle={styles.auditTableRowInputStyle}
                    value={getDifferenceVal()}
                />
            </View>
        </View>
    )
}

export interface ScoreState {
    executionScore: number | ''
    OptimizationScore: number | ''
}

const SpaceBreakdownPage: React.FC<{ spaceBreakdownRequired: { error?: string } }> = ({ spaceBreakdownRequired }) => {
    const auditData = useSelector((state: any) => state.AuditReducer.auditData)
    const dispatch = useDispatch()
    const executionData = getExecutionData(auditData, spaceBreakdownRequired)
    const [showComplianceScore, setShowComplianceScore] = useState(false)
    const [score, setScore] = useState<ScoreState>({
        executionScore: '',
        OptimizationScore: ''
    })
    const contractedShelvesVal = getContractedShelves(auditData)
    const getScoreParams = () => {
        return {
            isMedal: true,
            spaceBreakdownData: executionData,
            contractedShelves: getContractedShelves(auditData) === '' ? null : _.toNumber(contractedShelvesVal)
        }
    }
    useEffect(() => {
        getScore({ params: getScoreParams() })
            .then((scoreRes) => {
                dispatch(
                    setAuditData({
                        ...auditData,
                        executionDataScore: scoreRes,
                        contractedShelves: contractedShelvesVal
                    })
                )
                setScore(scoreRes)
            })
            .catch((err) => {
                dispatch(setAuditData({ ...auditData, contractedShelves: contractedShelvesVal }))
                storeClassLog(
                    Log.MOBILE_ERROR,
                    `getScore-Audit`,
                    `Get Audit OptimizationScore Score Fail` + ErrorUtils.error2String(err)
                )
            })
    }, [])

    useEffect(() => {
        spaceBreakdownRequired.error &&
            Alert.alert(t.labels.PBNA_MOBILE_AUDIT_CATEGORY_FAILED, spaceBreakdownRequired.error)
    }, [])

    const complianceScore = formatNullValue(score.OptimizationScore)

    useEffect(() => {
        // Optimizations core should be displayed when both actual and required values come in. Until then, we should display a dash.
        setShowComplianceScore(checkShowOptimizationOrStash(auditData, spaceBreakdownRequired))
    }, [auditData])

    return (
        <>
            <TitleView title={t.labels.PBNA_MOBILE_CATEGORY_OPTIMIZATION} />
            <FilletCard title={t.labels.PBNA_MOBILE_CONTRACTED_SHELVES} value={contractedShelvesVal} />
            <FilletCard
                title={t.labels.PBNA_MOBILE_OPTIMIZATION_SCORE}
                value={showComplianceScoreFormat(showComplianceScore, complianceScore)}
            />
            <TitleView title={t.labels.PBNA_MOBILE_POST_SPACE_BREAKDOWN} />
            <View>
                <View style={[styles.auditRevertContainer]}>
                    <TouchableOpacity disabled style={styles.auditTableHeaderContainer}>
                        <Image source={ImageSrc.REVERT_GREY} style={styles.auditTableHeaderImage} />
                        <CText style={styles.auditRevertText}>
                            {t.labels.PBNA_MOBILE_CDA_IR_SYNC.toLocaleUpperCase()}
                        </CText>
                    </TouchableOpacity>
                    <View style={styles.tableRowHeaderContainer}>
                        <TableRowHeader>{t.labels.PBNA_MOBILE_COPILOT_ACTUAL}</TableRowHeader>
                        <TableRowHeader>{t.labels.PBNA_MOBILE_REQUIRED}</TableRowHeader>
                        <TableRowHeader>{t.labels.PBNA_MOBILE_SHELF_DIFFERENCE}</TableRowHeader>
                    </View>
                </View>
                <View style={styles.tableView}>
                    {executionData.slice(0, 9).map((item: any) => {
                        return <TableRow key={item.id} item={item} />
                    })}
                </View>
                <TitleView title={t.labels.PBNA_MOBILE_CDA_CHILLED_JUICE} titleStyle={styles.titleSmall} />
                <View style={styles.tableView}>
                    {executionData.slice(9, 10).map((item: any) => {
                        return <TableRow key={item.id} item={item} />
                    })}
                </View>
            </View>
        </>
    )
}

export default SpaceBreakdownPage
