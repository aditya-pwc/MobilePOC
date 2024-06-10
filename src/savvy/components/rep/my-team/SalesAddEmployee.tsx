/**
 * @description Add employee modal for sales manager
 * @author Sheng Huang
 * @date 2022/1/5
 */
import React, { FC, useImperativeHandle, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import { drawHeaderTriangle, isFirstStep, isSecondStep } from '../../manager/helper/MerchManagerHelper'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { SearchBar } from 'react-native-elements'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import InternalContactTile from '../lead/contact-tab/InternalContactTile'
import { useUserListFromBackEnd } from '../../../hooks/UserHooks'
import UserAvatar from '../../common/UserAvatar'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import LottieView from 'lottie-react-native'
import { CommonParam } from '../../../../common/CommonParam'
import { getRecordTypeIdByDeveloperName } from '../../../utils/CommonUtils'
import { syncUpObjCreateFromMem, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import HeaderCircle from '../lead/HeaderCircle'
import PopMessage from '../../common/PopMessage'
import ProcessDoneModal from '../../common/ProcessDoneModal'
import { useDebounce } from '../../../hooks/CommonHooks'
import _ from 'lodash'
import { DatePickerLocale } from '../../../enums/i18n'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'

interface SalesAddEmployeeProps {
    cRef: any
    onSuccess: any
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    eTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900
    },
    eHeader: {
        paddingTop: 56,
        height: 272,
        backgroundColor: baseStyle.color.white
    },
    stepView: {
        marginTop: 45,
        height: 60,
        backgroundColor: baseStyle.color.bgGray,
        flexDirection: 'row'
    },
    activeStep: {
        backgroundColor: baseStyle.color.loadingGreen
    },
    firstStep: {
        width: 190,
        paddingLeft: 22,
        justifyContent: 'center',
        ...commonStyle.fullHeight
    },
    firstStepTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray
    },
    firstStepText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    activeStepColor: {
        color: baseStyle.color.white
    },
    topTriangle: {
        width: 0,
        height: 0,
        backgroundColor: baseStyle.color.transparent,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 30,
        borderBottomWidth: 30,
        borderLeftWidth: 0,
        borderTopColor: baseStyle.color.transparent,
        borderRightColor: baseStyle.color.transparent,
        borderBottomColor: baseStyle.color.loadingGreen,
        borderLeftColor: baseStyle.color.transparent
    },
    bottomLeftTriangle: {
        transform: [{ rotateX: '180deg' }]
    },
    topRightTriangle: {
        transform: [{ rotateX: '180deg' }, { rotateY: '180deg' }]
    },
    bottomRightTriangle: {
        transform: [{ rotateY: '180deg' }]
    },
    secondStep: {
        justifyContent: 'center',
        paddingLeft: 25,
        ...commonStyle.fullWidth
    },
    secondStepTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.titleGray
    },
    secondStepText: {
        fontSize: baseStyle.fontSize.fs_16,
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.black
    },
    searchBarView: {
        marginVertical: 30,
        paddingHorizontal: baseStyle.padding.pd_22
    },
    flexRowEnd: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    eImgCheck: {
        width: 15,
        height: 15,
        marginLeft: 8
    },
    heightAuto: {
        height: 'auto'
    },
    searchBarContainer: {
        height: 36,
        marginTop: 0,
        backgroundColor: baseStyle.color.bgGray,
        borderRadius: 10,
        padding: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0
    },
    inputContainerStyle: {
        height: 36,
        backgroundColor: baseStyle.color.bgGray,
        padding: 0,
        borderRadius: 10
    },
    inputStyle: {
        marginLeft: 0,
        marginRight: 0,
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400
    },
    leftIconContainerStyle: {
        marginLeft: 5
    },
    imgSearch: {
        width: 24,
        height: 22
    },
    imgClear: {
        width: 18,
        height: 19
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    calendarModalView: {
        borderRadius: 8,
        margin: 20,
        backgroundColor: 'white',
        shadowColor: baseStyle.color.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 350,
        width: '90%'
    },
    datePicker: {
        margin: 20
    },
    secondStepCont: {
        flex: 1,
        marginTop: 40,
        marginHorizontal: '5%'
    },
    userNameV: {
        marginLeft: 15,
        justifyContent: 'space-evenly'
    },
    userNameT: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_16
    },
    userTitle: {
        color: baseStyle.color.titleGray,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_12
    },
    generalT: {
        marginTop: 40,
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_16
    },
    dateCont: {
        marginTop: 15,
        justifyContent: 'space-between'
    },
    startDateV: {
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d3d3d3'
    },
    startDateT: {
        color: baseStyle.color.titleGray,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_14
    },
    dateFormat: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_14
    },
    calendar: {
        height: 18,
        width: 20,
        marginLeft: 10
    },
    headCircle: {
        marginTop: 15,
        paddingHorizontal: '5%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    listCont: {
        flex: 1,
        backgroundColor: baseStyle.color.bgGray
    },
    datePickerCont: {
        backgroundColor: 'rgba(0, 0,0, 0.2)',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    lottieCont: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    unsuccessV: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        padding: 10
    },
    lottieV: {
        width: 150,
        height: 150
    },
    successCont: {
        backgroundColor: 'white',
        width: 300,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
    }
})

const initSelectedUser = () => {
    return {
        userStatsId: null,
        firstName: null,
        lastName: null,
        Name: null,
        title: null,
        GTMU_RTE_ID__c: null,
        relationship_end_date__c: null,
        managerRelationshipId: null,
        Id: null
    }
}

const SalesAddEmployee: FC<SalesAddEmployeeProps> = (props: SalesAddEmployeeProps) => {
    const { cRef, onSuccess } = props
    const [showModal, setShowModal] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [showLoading, setShowLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [activeStep, setActiveStep] = useState(1)
    const [tempValue, setTempValue] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const [selectedUser, setSelectedUser] = useState(initSelectedUser)
    const [selectedDate, setSelectedDate] = useState<any>(new Date())
    const [isLoading, setIsLoading] = useState(false)
    const [isCleared, setIsCleared] = useState(false)
    const userList = useUserListFromBackEnd(searchValue, setIsLoading)

    useDebounce(() => setSearchValue(tempValue), 500, [tempValue])

    const closeModal = () => {
        setShowModal(false)
        setTempValue('')
        setSearchValue('')
        setSelectedUser(initSelectedUser)
        setSelectedDate(new Date())
        setActiveStep(1)
    }

    const handleClose = () => {
        if (activeStep === 1) {
            closeModal()
        } else {
            setTempValue('')
            setSearchValue('')
            setSelectedUser(initSelectedUser)
            setSelectedDate(new Date())
            setActiveStep((v) => v - 1)
        }
    }

    useImperativeHandle(cRef, () => ({
        showModal: () => {
            setShowModal(true)
        },
        closeModal: closeModal
    }))

    const renderItem = (item) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    setSelectedUser(item.item)
                    setActiveStep(2)
                }}
            >
                {InternalContactTile(item)}
            </TouchableOpacity>
        )
    }

    const syncManagerRelationship = async () => {
        setShowLoading(true)
        try {
            const relationshipRecordTypeId = await getRecordTypeIdByDeveloperName(
                'Manager_Relationship',
                'User_Stats__c'
            )
            const relationship = {
                Id: selectedUser.managerRelationshipId,
                manager__c: CommonParam.userId,
                User__c: selectedUser.Id,
                relationship_end_date__c: null,
                relationship_begin_date__c: moment(selectedDate).format(TIME_FORMAT.Y_MM_DD),
                RecordTypeId: relationshipRecordTypeId
            }
            if (relationship.Id) {
                await syncUpObjUpdateFromMem('User_Stats__c', [relationship])
            } else {
                await syncUpObjCreateFromMem('User_Stats__c', [relationship])
            }
        } catch (e) {
            setShowLoading(false)
        }
        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
            setShowLoading(false)
            closeModal()
        }, 3000)
        setTimeout(() => {
            onSuccess()
        }, 0)
    }

    const renderSecondStep = () => {
        return (
            <View style={styles.secondStepCont}>
                <View style={commonStyle.flexDirectionRow}>
                    <UserAvatar
                        userStatsId={selectedUser.userStatsId}
                        firstName={selectedUser.firstName}
                        lastName={selectedUser.lastName}
                        avatarStyle={styles.imgUserImage}
                        userNameText={{ fontSize: 24 }}
                    />
                    <View style={styles.userNameV}>
                        <CText style={styles.userNameT}>{selectedUser.Name}</CText>
                        <CText style={styles.userTitle}>{selectedUser.title}</CText>
                    </View>
                </View>
                <CText style={styles.generalT}>{t.labels.PBNA_MOBILE_GENERAL}</CText>
                <View style={styles.dateCont}>
                    <View style={styles.startDateV}>
                        <CText style={styles.startDateT}>{t.labels.PBNA_MOBILE_EFFECTIVE_START_DATE}</CText>
                        <TouchableOpacity
                            onPress={() => {
                                setShowTimePicker(true)
                            }}
                            style={commonStyle.flexDirectionRow}
                        >
                            <CText style={styles.dateFormat}>{moment(selectedDate).format(TIME_FORMAT.MMMDDY)}</CText>
                            <Image style={styles.calendar} source={ImageSrc.IMG_CALENDAR} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    const onClearIconClick = () => {
        setIsCleared(true)
        setTempValue('')
        setSearchValue('')
    }

    const renderDefaultClearIcon = () => {
        if (isCleared) {
            return null
        }
        return (
            <TouchableOpacity onPress={onClearIconClick}>
                <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
            </TouchableOpacity>
        )
    }

    return (
        <Modal visible={showModal} animationType={'fade'}>
            <SafeAreaView style={styles.container}>
                <View style={commonStyle.flex_1}>
                    <View style={styles.headCircle}>
                        <CText style={styles.eTitle}>{t.labels.PBNA_MOBILE_ADD_EMPLOYEE}</CText>
                        <HeaderCircle
                            color={baseStyle.color.tabBlue}
                            onPress={closeModal}
                            transform={[{ rotate: '45deg' }]}
                        />
                    </View>
                    <View style={styles.stepView}>
                        <View style={[styles.firstStep, isFirstStep(activeStep) && styles.activeStep]}>
                            <CText style={[styles.firstStepTitle, isFirstStep(activeStep) && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_STEP_ONE}
                            </CText>
                            <View style={styles.flexRowEnd}>
                                <CText
                                    style={[styles.firstStepText, isFirstStep(activeStep) && styles.activeStepColor]}
                                >
                                    {t.labels.PBNA_MOBILE_SELECT_EMPLOYEE}
                                </CText>
                                {isSecondStep(activeStep) && (
                                    <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.eImgCheck} />
                                )}
                            </View>
                        </View>
                        {drawHeaderTriangle(1, activeStep, styles)}
                        <View style={[styles.secondStep, isSecondStep(activeStep) && styles.activeStep]}>
                            <CText style={[styles.secondStepTitle, isSecondStep(activeStep) && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_STEP_TWO}
                            </CText>
                            <CText style={[styles.secondStepText, isSecondStep(activeStep) && styles.activeStepColor]}>
                                {t.labels.PBNA_MOBILE_COMPLETE_PROFILE}
                            </CText>
                        </View>
                    </View>
                    {isFirstStep(activeStep) && (
                        <View style={styles.searchBarView}>
                            <SearchBar
                                containerStyle={styles.searchBarContainer}
                                inputContainerStyle={styles.inputContainerStyle}
                                inputStyle={styles.inputStyle}
                                leftIconContainerStyle={styles.leftIconContainerStyle}
                                // @ts-ignore
                                searchIcon={<Image style={styles.imgSearch} source={ImageSrc.IMG_SEARCH} />}
                                placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEE}
                                // @ts-ignore
                                onChangeText={(v) => {
                                    setTempValue(v)
                                    setIsCleared(v.length === 0)
                                }}
                                value={tempValue}
                                allowFontScaling={false}
                                platform={'default'}
                                clearIcon={() => {
                                    return renderDefaultClearIcon()
                                }}
                            />
                        </View>
                    )}
                    {isFirstStep(activeStep) && (
                        <View style={styles.listCont}>
                            {isLoading ? (
                                <View style={[commonStyle.alignCenter, commonStyle.flex_1]}>
                                    <ActivityIndicator />
                                </View>
                            ) : (
                                <FlatList data={userList} renderItem={renderItem} />
                            )}
                        </View>
                    )}
                    {isSecondStep(activeStep) && renderSecondStep()}
                </View>
                <FormBottomButton
                    leftButtonLabel={
                        activeStep === 1 ? t.labels.PBNA_MOBILE_CANCEL : _.capitalize(t.labels.PBNA_MOBILE_GO_BACK)
                    }
                    rightButtonLabel={t.labels.PBNA_MOBILE_ADD_TO_MY_TEAM}
                    relative
                    onPressCancel={handleClose}
                    onPressSave={syncManagerRelationship}
                    disableSave={activeStep === 1}
                />
            </SafeAreaView>
            <Modal
                animationType="fade"
                transparent
                visible={showTimePicker}
                onRequestClose={() => {
                    setShowTimePicker((v) => !v)
                }}
            >
                <TouchableOpacity
                    style={commonStyle.flex_1}
                    onPress={() => {
                        setShowTimePicker((v) => !v)
                    }}
                >
                    <View style={styles.datePickerCont}>
                        <View style={styles.calendarModalView}>
                            <DateTimePicker
                                style={styles.datePicker}
                                themeVariant={'light'}
                                testID={'dateTimePicker'}
                                value={selectedDate}
                                maximumDate={new Date()}
                                minimumDate={
                                    selectedUser.relationship_end_date__c &&
                                    moment(selectedUser.relationship_end_date__c).toDate()
                                }
                                mode={'date'}
                                display={'inline'}
                                onChange={(event, date) => {
                                    setSelectedDate(date)
                                    setShowTimePicker(false)
                                }}
                                locale={DatePickerLocale[CommonParam.locale]}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal
                animationType="fade"
                transparent
                visible={showLoading}
                onRequestClose={() => {
                    setShowLoading((v) => !v)
                }}
            >
                <TouchableOpacity
                    style={commonStyle.flex_1}
                    onPress={() => {
                        setShowLoading((v) => !v)
                    }}
                >
                    <View style={styles.lottieCont}>
                        {!showSuccess && (
                            <View style={styles.unsuccessV}>
                                <LottieView
                                    source={require('../../../../../assets/animation/loading.json')}
                                    autoPlay
                                    loop
                                    style={styles.lottieV}
                                />
                            </View>
                        )}
                        {showSuccess && (
                            <View style={styles.successCont}>
                                <ProcessDoneModal type="success">
                                    <PopMessage textStyle={{ fontWeight: '900' }}>
                                        {`${selectedUser.Name} ${t.labels.PBNA_MOBILE_SUCCESSFULLY_ADDED_TO_MY_TEAM}`}
                                    </PopMessage>
                                </ProcessDoneModal>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </Modal>
    )
}

export default SalesAddEmployee
