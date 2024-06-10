import moment from 'moment'
import React from 'react'
import { Image, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { CheckBox } from 'react-native-elements'
import { syncDownObj, syncUpObjCreateFromMem } from '../../../../api/SyncUtils'
import { AccountPaidVal, ContractBtnType, StepVal } from '../../../../enums/Contract'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { DropDownType } from '../../../../enums/Manager'
import { handlePressDeclineCDA } from '../../../../helper/rep/ContractHelper'
import { getCurrentOrNextYear } from '../../../../hooks/CustomerContractTabHooks'
import { t } from '../../../../../common/i18n/t'
import {
    setActiveStep,
    setCheckedYear,
    setSurveyQuestions,
    setSurveyQuestionsModalVisible
} from '../../../../redux/action/ContractAction'
import { getAllFieldsByObjName } from '../../../../utils/SyncUtils'
import CText from '../../../../../common/components/CText'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { styles } from './SelectYearModalHeader'
import { TIME_FORMAT } from '../../../../../common/enums/TimeFormat'
import { getCDAEndDate, getCDAStartDate } from '../../../../helper/rep/StartNewCDAHelper'

interface SelectYearScreenProps {
    setShowYearModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    setRefreshFlag: React.Dispatch<React.SetStateAction<number>>
    setDeclinedCDALoading: any
    declinedCDALoading: boolean
    checkedYear: any
    dropDownRef: any
    retailStore: any
}

export const unCheckCircle = () => {
    return <View style={styles.uncheckCircleView} />
}

const SelectYearModalChildren = (props: SelectYearScreenProps) => {
    const {
        setShowYearModalVisible,
        setRefreshFlag,
        setDeclinedCDALoading,
        declinedCDALoading,
        checkedYear,
        dropDownRef,
        retailStore
    } = props

    const dispatch = useDispatch()
    const buttonClicked = useSelector((state: any) => state.contractReducer.buttonClicked)
    const disabledYear = useSelector((state: any) => state.contractReducer.disabledYear)
    const currentYear = getCurrentOrNextYear().currentYear
    const nextYear = getCurrentOrNextYear().nextYear
    const pepsicoCalendar = useSelector((state: any) => state.contractReducer.pepsicoCalendar)
    const surveyQuestions = useSelector((state: any) => state.contractReducer.surveyQuestions)

    const onPressYes = async () => {
        setDeclinedCDALoading(true)

        const contractObj = {
            AccountId: retailStore.AccountId,
            Status: 'In progress',
            Contract_Status__c: 'Declined',
            CDA_Year__c: checkedYear,
            Signed_Medal_Tier__c: '',
            StartDate: moment(checkedYear).startOf('year').format(TIME_FORMAT.Y_MM_DD),
            EndDate: moment(checkedYear).endOf('year').format(TIME_FORMAT.Y_MM_DD)
        }

        try {
            const contracts = await syncUpObjCreateFromMem('Contract', [contractObj])
            const contract = contracts[0]?.data[0]
            if (contract?.Id) {
                await syncDownObj(
                    'RetailStore',
                    `SELECT ${getAllFieldsByObjName('RetailStore').join()} FROM RetailStore WHERE Id IN ('${
                        retailStore.Id
                    }')`
                )
                setRefreshFlag((prevSaveTimes) => prevSaveTimes + 1)
                setShowYearModalVisible(false)
            }
            setDeclinedCDALoading(false)
        } catch (error) {
            setDeclinedCDALoading(false)
            dropDownRef.current.alertWithType(DropDownType.ERROR, t.labels.PBNA_MOBILE_CDA_DECLINE_CDA_FAILURE, error)
        }
    }

    const handlePressCancel = () => {
        setShowYearModalVisible(false)
    }

    const handlePressSave = async () => {
        setShowYearModalVisible(false)
        if (buttonClicked === ContractBtnType.CUSTOMER_DECLINED) {
            handlePressDeclineCDA(checkedYear, onPressYes)
        }
        if (buttonClicked === ContractBtnType.START_NEW_CDA) {
            dispatch(setActiveStep(StepVal.ONE))
            const { startDate } = await getCDAStartDate({
                customerDetail: retailStore,
                checkedYear,
                pepsicoCalendar
            })
            const endDate = getCDAEndDate(checkedYear, pepsicoCalendar)

            dispatch(
                setSurveyQuestions({
                    ...surveyQuestions,
                    StartDate: startDate,
                    EndDate: endDate,
                    Account_Paid__c: AccountPaidVal.ON_TICKET
                })
            )
            dispatch(setSurveyQuestionsModalVisible(true))
        }
    }

    return (
        <View style={styles.modalChildrenView}>
            <View style={styles.childrenTitleView}>
                <CText style={[styles.childrenTitle]}>{t.labels.PBNA_MOBILE_CDA_SELECT_THE_YEAR}</CText>
            </View>
            <View style={styles.childrenBodyView}>
                <View>
                    <CheckBox
                        title={currentYear}
                        onPress={() => {
                            if (disabledYear !== currentYear) {
                                dispatch(setCheckedYear(currentYear))
                            }
                        }}
                        disabled={disabledYear === currentYear}
                        checked={checkedYear === currentYear}
                        checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                        uncheckedIcon={unCheckCircle()}
                        containerStyle={[styles.radioContainer]}
                        textStyle={[styles.radioLabel, { color: disabledYear === currentYear ? '#D3D3D3' : '#000' }]}
                    />
                    <CheckBox
                        title={nextYear}
                        onPress={() => {
                            if (disabledYear !== nextYear) {
                                dispatch(setCheckedYear(nextYear))
                            }
                        }}
                        disabled={disabledYear === nextYear}
                        checked={checkedYear === nextYear}
                        checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                        uncheckedIcon={unCheckCircle()}
                        containerStyle={[styles.radioContainer]}
                        textStyle={[styles.radioLabel, { color: disabledYear === nextYear ? '#D3D3D3' : '#000' }]}
                    />
                </View>
            </View>
            <View>
                <FormBottomButton
                    onPressCancel={handlePressCancel}
                    onPressSave={handlePressSave}
                    disableSave={declinedCDALoading}
                    rightButtonLabel={
                        buttonClicked === ContractBtnType.START_NEW_CDA
                            ? t.labels.PBNA_MOBILE_START_NEW
                            : t.labels.PBNA_MOBILE_CDA_DECLINE
                    }
                    leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                    relative
                />
            </View>
        </View>
    )
}

export default SelectYearModalChildren
