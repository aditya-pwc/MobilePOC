import React, { useEffect, useState } from 'react'
import { Modal, TouchableOpacity, View, Image, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import { visitStyle } from '../../../merchandiser/VisitStyle'
import { getScore, multiplyBy100KeepInteger } from '../../../../helper/rep/AuditHelper'
import { useDispatch, useSelector } from 'react-redux'
import { AuditAssessmentIndicators } from '../../../../enums/Contract'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'
import { formatNullValue } from './SpaceViewPage'
import { ScoreState } from './SpaceBreakdownPage'
import { VisitSubType } from '../../../../enums/Visit'
import { setAuditData } from '../../../../redux/action/AuditAction'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import { Log } from '../../../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface ScoreModalProps {
    modalVisible: boolean
    setModalVisible: (a: false) => void
    onPressOk: () => void
    visitSubtype: string
}

const styles = StyleSheet.create({
    ...visitStyle,
    modalGreyBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    disabled: {
        fontFamily: 'Gotham-Bold',
        backgroundColor: '#D3D3D3'
    },
    modalText: {
        width: 240,
        marginTop: 10,
        color: '#000',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '900',
        textAlign: 'center'
    },
    imgSize: {
        width: 56,
        height: 53
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        width: '100%',
        height: 60,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: '#6C0CC3'
    },
    scoreModalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        paddingTop: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 297,
        width: 300
    },
    scoreView: {
        width: 242,
        paddingHorizontal: 29,
        marginTop: 21,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    scoreBox: {
        width: 60,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 6
    },
    scoreText: {
        fontSize: 16,
        fontWeight: '700'
    },
    okText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' }
})

const sumExecutionData = (execution: { [key: string]: any }) => {
    let sumVal = 0

    for (const key in execution) {
        const value = execution[key]
        const numericValue = _.toNumber(value)

        if (!isNaN(numericValue) && value !== null && value !== undefined) {
            sumVal += numericValue
        }
    }

    return sumVal
}

export const ScoreModal: React.FC<ScoreModalProps> = ({ modalVisible, setModalVisible, onPressOk, visitSubtype }) => {
    const auditData = useSelector((state: any) => state.AuditReducer.auditData)
    const dispatch = useDispatch()
    const [score, setScore] = useState<ScoreState>({
        executionScore: '',
        OptimizationScore: ''
    })
    const [okBtnLoading, setOkBtnLoading] = useState<boolean>(true)

    const getScoreParams = () => {
        let countSelectedRewardValues = 0
        const selectRewards = auditData.selectRewards || {}
        for (const key in selectRewards) {
            if (selectRewards[key] === true) {
                countSelectedRewardValues++
            }
        }

        const formatParam = (val: string | null) => {
            if (val === null || val === undefined || val === '') {
                return val
            }

            return _.toNumber(val)
        }

        return {
            isMedal: false,
            CDASpaceCheckbox: auditData.contract.CDA_Space_Checkbox__c,
            require: {
                totalPepLRB: formatParam(auditData.requiredKPIValue.requiredShelves.totalPepLRB),
                totalPepLRBShelves: formatParam(auditData.requiredKPIValue.requiredShelves.totalPepLRBShelves),
                PEPColdVaultShelves: formatParam(auditData.requiredKPIValue.requiredShelves.PEPColdVaultShelves),
                PEPPerimeterShelves: formatParam(auditData.requiredKPIValue.requiredShelves.PEPPerimeterShelves),
                rewardLength: auditData.requiredKPIValue?.requiredReward?.length || 0,
                executionData: sumExecutionData(auditData.requiredKPIValue.requiredExecutionData)
            },
            actual: {
                totalPepLRB: multiplyBy100KeepInteger(
                    auditData.auditVisitKpi?.[AuditAssessmentIndicators.TOTAL_PEP_LRB_AUDIT]?.ActualDecimalValue
                ),
                totalPepLRBShelves: formatParam(
                    auditData.auditVisitKpi?.[AuditAssessmentIndicators.TOTAL_PEP_LRB_SHELVES_AUDIT]?.ActualDecimalValue
                ),
                PEPColdVaultShelves: formatParam(
                    auditData.auditVisitKpi?.[AuditAssessmentIndicators.REP_COLD_VAULT_SHELVES_AUDIT]
                        ?.ActualDecimalValue
                ),
                PEPPerimeterShelves: formatParam(
                    auditData.auditVisitKpi?.[AuditAssessmentIndicators.PEP_PERIMETER_SHELVES_AUDIT]?.ActualDecimalValue
                ),
                rewardLength: countSelectedRewardValues,
                executionData: sumExecutionData(auditData.executionInputValue)
            }
        }
    }
    useEffect(() => {
        getScore({ params: getScoreParams() })
            .then((scoreRes) => {
                dispatch(setAuditData({ ...auditData, ...{ executionDataScore: scoreRes } }))
                setScore(scoreRes)
                setOkBtnLoading(false)
            })
            .catch((err) => {
                setOkBtnLoading(false)
                storeClassLog(
                    Log.MOBILE_ERROR,
                    `getScore-Audit`,
                    `Get Audit executionScore Score Fail` + ErrorUtils.error2String(err)
                )
            })
    }, [])

    const getMessage = () => {
        if (visitSubtype === VisitSubType.GENERAL_AUDIT) {
            return t.labels.PBNA_MOBILE_GENERAL_AUDIT_SUCCESSFULLY
        }
        if (visitSubtype === VisitSubType.POST_CONTRACT_AUDIT) {
            return t.labels.PBNA_MOBILE_POST_AUDIT_SUCCESSFULLY
        }
        return ''
    }
    return (
        <Modal animationType="fade" visible={modalVisible} transparent>
            <View style={styles.centeredView}>
                <View style={styles.scoreModalView}>
                    <Image style={styles.imgSize} source={require('../../../../../../assets/image/icon-success.png')} />
                    <CText style={styles.modalText}>{getMessage()}</CText>
                    <View style={styles.scoreView}>
                        <CText style={{ fontSize: 14 }}>{t.labels.PBNA_MOBILE_EXECUTION_SCORE}</CText>
                        <View style={styles.scoreBox}>
                            <CText style={styles.scoreText}>
                                {formatNullValue(score.executionScore) === '' ? '' : `${score.executionScore}%`}
                            </CText>
                        </View>
                    </View>
                    <TouchableOpacity
                        disabled={okBtnLoading}
                        style={[styles.button, okBtnLoading && styles.disabled]}
                        onPress={() => {
                            setModalVisible(false)
                            onPressOk && onPressOk()
                        }}
                    >
                        <CText style={styles.okText}>{t.labels.PBNA_MOBILE_OK.toUpperCase()}</CText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}
