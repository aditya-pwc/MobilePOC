import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import { AssessmentIndicators, AuditAssessmentIndicators, PercentageEnum } from '../../../../enums/Contract'
import { useDispatch, useSelector } from 'react-redux'
import AuditStyle from '../../../../styles/manager/AuditStyle'
import { BottomLine } from './Present'
import CText from '../../../../../common/components/CText'
import CollapseContainer from '../../../common/CollapseContainer'
import { t } from '../../../../../common/i18n/t'
import { Input } from 'react-native-elements'
import _ from 'lodash'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { AuditCDACard } from '../CustomerContractTab'
import { getExecutionElementsData, multiplyBy100KeepInteger } from '../../../../helper/rep/AuditHelper'
import { setAuditData } from '../../../../redux/action/AuditAction'
import { getOmitZeroDigitalRoundNumber } from '../../../../components/rep/customer/contract-tab/SpaceViewPage'
const auditStyles = StyleSheet.create({
    ...AuditStyle
})

const TableRowHeader = ({ children }: { children: string }) => {
    return (
        <View style={auditStyles.auditTableRowHeaderView}>
            <CText style={auditStyles.tableRowHeaderText}>{children} </CText>
        </View>
    )
}

const TableRow = ({ item }: { item: any }) => {
    const inputTotalStyle = auditStyles.auditTableRowInput
    const getShelfDifferenceStyle = () => {
        return item.difference < 0 ? auditStyles.auditTableRowRedInput : auditStyles.auditTableRowGreenInput
    }
    const getDifferenceVal = () => {
        return `${item.difference > 0 ? '+' : ''}${item.difference}`
    }
    return (
        <View style={[auditStyles.tableRowView, { borderBottomColor: '#FFFFFF' }]}>
            <View style={auditStyles.tableRowTitleView}>
                <CText style={auditStyles.tableRowTitleText}>{item.title}</CText>
            </View>

            <View style={auditStyles.tableRowInputContainer}>
                <Input
                    editable={false}
                    style={auditStyles.auditTableInputStyle}
                    containerStyle={inputTotalStyle}
                    returnKeyType="done"
                    placeholder={''}
                    textAlign="center"
                    inputContainerStyle={auditStyles.auditInputContainerStyle}
                    keyboardType="number-pad"
                    inputStyle={auditStyles.auditTableRowInputStyle}
                    value={item.actual}
                />
                <Input
                    editable={false}
                    style={auditStyles.auditTableInputStyle}
                    containerStyle={inputTotalStyle}
                    returnKeyType="done"
                    placeholder={''}
                    textAlign="center"
                    inputContainerStyle={auditStyles.auditInputContainerStyle}
                    keyboardType="number-pad"
                    inputStyle={auditStyles.auditTableRowInputStyle}
                    value={item.required}
                />
                <Input
                    style={auditStyles.auditTableInputStyle}
                    editable={false}
                    containerStyle={[inputTotalStyle, getShelfDifferenceStyle()]}
                    returnKeyType="done"
                    placeholder={''}
                    textAlign="center"
                    inputContainerStyle={auditStyles.auditInputContainerStyle}
                    keyboardType="number-pad"
                    inputStyle={auditStyles.auditTableRowInputStyle}
                    value={getDifferenceVal()}
                />
            </View>
        </View>
    )
}

const ComplianceViewPage = ({ retailStore }: { retailStore: any }) => {
    const [showCOContainer, setShowCOContainer] = useState(true)
    const [showAOContainer, setShowAOContainer] = useState(true)
    const auditData = useSelector((state: any) => state.AuditReducer.auditData)
    const customerDetail = useSelector((state: any) => state.customerReducer.customerDetailReducer.customerDetail)
    const ImageRevertGrey = ImageSrc.REVERT_GREY
    const [rewardsData, setRewardsData] = useState(true)
    const [falseRewardsData, setFalseRewardsData] = useState([])
    const dispatch = useDispatch()

    useEffect(() => {
        setFalseRewardsData([])
        const temp = _.chain(auditData.selectRewards).values().every(Boolean).value()
        const temp1 = [] as any
        if (!temp) {
            _.mapKeys(auditData.selectRewards, function (value, key) {
                if (!value) {
                    temp1.push(key)
                }
            })
        }
        setFalseRewardsData(temp1)
        setRewardsData(temp)
    }, [auditData.selectRewards])
    const complianceData: any[] = [
        {
            id: t.labels.PBNA_MOBILE_CONTRACT_PEP_LRB_PERCENT,
            title: t.labels.PBNA_MOBILE_CONTRACT_PEP_LRB_PERCENT,
            actualVal:
                multiplyBy100KeepInteger(
                    auditData.auditVisitKpi?.[AuditAssessmentIndicators.TOTAL_PEP_LRB_AUDIT]?.ActualDecimalValue
                ) || 0,
            requiredVal: Number(auditData.coldVaultData.VALUE__c * PercentageEnum.ONE_HUNDRED) || 0,
            showActual:
                auditData.auditVisitKpi?.[AuditAssessmentIndicators.TOTAL_PEP_LRB_AUDIT]?.ActualDecimalValue !== null
        },
        {
            id: t.labels.PBNA_MOBILE_CONTRACT_PEP_LRB_SHELVES,
            title: t.labels.PBNA_MOBILE_CONTRACT_PEP_LRB_SHELVES,
            actualVal: Number(
                auditData.auditVisitKpi[AuditAssessmentIndicators.TOTAL_PEP_LRB_SHELVES_AUDIT]?.ActualDecimalValue || 0
            ),
            showActual:
                auditData.auditVisitKpi?.[AuditAssessmentIndicators.TOTAL_PEP_LRB_SHELVES_AUDIT]?.ActualDecimalValue !==
                null,
            requiredVal:
                Number(
                    (auditData.coldVaultData.VALUE__c || 0) *
                        (auditData.CDAVisitKpi[AssessmentIndicators.TOTAL_LRB_SHELVES]?.ActualDecimalValue || 0)
                ) || 0
        }
    ].map((elem) => {
        const differenceVal = elem.actualVal - elem.requiredVal

        return {
            id: elem.id,
            title: elem.title,
            actualVal: elem.showActual ? elem.actualVal : '',
            actual: elem.showActual ? getOmitZeroDigitalRoundNumber(elem.actualVal) : '',
            requiredVal: elem.requiredVal,
            required: getOmitZeroDigitalRoundNumber(elem.requiredVal),
            differenceVal,
            difference: getOmitZeroDigitalRoundNumber(differenceVal)
        }
    })

    const executionData = getExecutionElementsData(auditData)

    return (
        <>
            <AuditCDACard
                list={[auditData.auditVisit]}
                readonly
                isSpaceBreakdown
                customerDetail={{
                    ...customerDetail,
                    ...retailStore
                }}
            />
            <CollapseContainer
                noTopLine
                preload
                noBottomLine
                showContent={showCOContainer}
                setShowContent={setShowCOContainer}
                title={t.labels.PBNA_MOBILE_COMPLIANCE_OVERVIEW}
            >
                <View style={auditStyles.auditTableContainer}>
                    <View style={[auditStyles.auditRevertContainer]}>
                        <TouchableOpacity disabled style={auditStyles.auditTableHeaderContainer}>
                            <Image source={ImageRevertGrey} style={auditStyles.auditTableHeaderImage} />
                            <CText style={auditStyles.auditRevertText}>
                                {t.labels.PBNA_MOBILE_CDA_IR_SYNC.toLocaleUpperCase()}
                            </CText>
                        </TouchableOpacity>
                        <View style={auditStyles.tableRowHeaderContainer}>
                            <TableRowHeader>{t.labels.PBNA_MOBILE_COPILOT_ACTUAL}</TableRowHeader>
                            <TableRowHeader>{t.labels.PBNA_MOBILE_TIER_REQUIRED}</TableRowHeader>
                            <TableRowHeader>{t.labels.PBNA_MOBILE_SHELF_DIFFERENCE}</TableRowHeader>
                        </View>
                    </View>
                    <View style={auditStyles.tableView}>
                        {complianceData.map((item) => {
                            return <TableRow key={item.id} item={item} />
                        })}
                    </View>
                </View>
                <BottomLine lineStyle={{ marginTop: 15 }} />
            </CollapseContainer>
            <CollapseContainer
                noTopLine
                preload
                noBottomLine
                showContent={showAOContainer}
                setShowContent={setShowAOContainer}
                title={t.labels.PBNA_MOBILE_ADDITIONAL_OPPORTUNITIES}
            >
                <CText style={auditStyles.auditTableContainerSubTitle}>{t.labels.PBNA_MOBILE_EXECUTION_ELEMENTS}</CText>
                <View style={[auditStyles.auditRevertContainer]}>
                    <TouchableOpacity disabled style={auditStyles.auditTableHeaderContainer}>
                        <Image source={ImageRevertGrey} style={auditStyles.auditTableHeaderImage} />
                        <CText style={auditStyles.auditRevertText}>
                            {t.labels.PBNA_MOBILE_CDA_IR_SYNC.toLocaleUpperCase()}
                        </CText>
                    </TouchableOpacity>

                    <View style={auditStyles.tableRowHeaderContainer}>
                        <TableRowHeader>{t.labels.PBNA_MOBILE_COPILOT_ACTUAL}</TableRowHeader>
                        <TableRowHeader>{t.labels.PBNA_MOBILE_TIER_REQUIRED}</TableRowHeader>
                        <TableRowHeader>{t.labels.PBNA_MOBILE_SHELF_DIFFERENCE}</TableRowHeader>
                    </View>
                </View>
                <View style={auditStyles.tableView}>
                    {executionData.map((item: any) => {
                        return <TableRow key={item.id} item={item} />
                    })}
                </View>
                <View style={auditStyles.auditRewardContainer}>
                    <CText style={auditStyles.auditRewardContainerTitle}>{t.labels.PBNA_MOBILE_REWARDS}</CText>
                    <CText style={auditStyles.auditRewardContent}>
                        {rewardsData
                            ? t.labels.PBNA_MOBILE_ALL_REWARDS_ARE_COMPIANT_AGAINST_THE_REQUIREMENTS
                            : `${t.labels.PBNA_MOBILE_FOLLOW_REWARDS_ARE_NOT_COMPLIANT}: ${falseRewardsData.join(
                                  ' , '
                              )}`}
                    </CText>
                </View>
                <BottomLine lineStyle={{ marginTop: 20 }} />
                <View style={auditStyles.auditRewardContainer}>
                    <CText style={auditStyles.auditRewardContainerSubTitle}>
                        {t.labels.PBNA_MOBILE_FOLLOW_UP_NOTES_OPTIONAL}
                    </CText>
                    <Input
                        returnKeyType="done"
                        placeholder={''}
                        maxLength={1000}
                        multiline
                        value={auditData.auditVisit.InstructionDescription}
                        onChangeText={(text) =>
                            dispatch(
                                setAuditData({
                                    ...auditData,
                                    auditVisit: { ...auditData.auditVisit, InstructionDescription: text }
                                })
                            )
                        }
                        inputContainerStyle={auditStyles.auditInputContainerStyle}
                        inputStyle={auditStyles.auditTableRowInputStyle}
                    />
                </View>
                <BottomLine lineStyle={{ marginTop: 10 }} />
            </CollapseContainer>
        </>
    )
}

export default ComplianceViewPage
