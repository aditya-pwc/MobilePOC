/**
 * @description A modal to reassign visit.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-04-07
 */

import React, { useRef, useImperativeHandle, useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Keyboard } from 'react-native'
import CText from '../../../../common/components/CText'
import { Divider } from 'react-native-elements'
import { Modalize } from 'react-native-modalize'
import SearchBarFilter from './SearchBarFilter'
import EmployeeCell from './EmployeeCell'
import IMG_STORE_PLACEHOLDER from '../../../../../assets/image/Icon-store-placeholder.svg'
import UserAvatar from '../../common/UserAvatar'
import MyTeamStyle from '../../../styles/manager/MyTeamStyle'
import { formatUTCToLocalTime, ReassignModalType, getFTPT } from '../../../utils/MerchManagerUtils'
import { t } from '../../../../common/i18n/t'
import { sortArrByParamsASC } from '../helper/MerchManagerHelper'

const styles = StyleSheet.create({
    handleStyle: {
        height: 4,
        width: 41,
        backgroundColor: '#D3D3D3',
        marginTop: 25
    },
    alignCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 22,
        paddingRight: 22
    },
    titleView: { marginTop: 40, marginBottom: 15 },
    titleText: { fontWeight: '700', fontSize: 12 },
    dividerView: { width: '100%' },
    divider: { backgroundColor: '#D3D3D3', width: '100%', height: 1 },
    infoRow: { marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' },
    imgIcon: { width: 50, height: 50, marginRight: 15, borderRadius: 8 },
    userInfo: { paddingRight: 22, marginRight: 22 },
    userName: { fontSize: 16, fontWeight: '700', color: '#000', marginRight: 22 },
    mertics: { flexDirection: 'row', marginTop: 9 },
    merticText: { fontSize: 12, fontWeight: '400', color: '#000' },
    reassignTo: { fontSize: 12, fontWeight: '400', color: '#565656', marginTop: 30, marginBottom: 22 },
    itemSubTile: {
        fontSize: 12,
        color: '#565656',
        flexWrap: 'wrap',
        marginTop: 5,
        alignSelf: 'flex-start'
    },
    contentContainerStyle: {
        paddingTop: 22,
        paddingBottom: 22
    },
    fontWeight700: {
        fontWeight: '700'
    },
    colorGrey: {
        color: '#D3D3D3'
    },
    reassignView: {
        paddingLeft: 22,
        paddingRight: 22
    }
})

const SINGLE_LENGTH = 1

const myTeamStyle = MyTeamStyle

interface ReassignModalProps {
    cRef?: any
    navigation?: any
    isEmployee?: boolean
    data?: any
    userData?: any
    selectDataLength?: number
    type?: string
    selectedTime?: string
    selectedCase?: number
    reassignCallBack?: any
    itemClick?: Function
    setIsLoading?: any
    visitListId?: string
    setIsErrorShow?: Function
    setErrorMsgType?: Function
    isOptimized?: boolean
    selectDayInOptimized?: string
}

const ReassignModal = (props: ReassignModalProps) => {
    const {
        cRef,
        navigation,
        isEmployee,
        data,
        userData,
        selectDataLength,
        selectedTime,
        reassignCallBack,
        type,
        itemClick,
        setIsLoading,
        visitListId,
        setIsErrorShow,
        setErrorMsgType,
        isOptimized,
        selectDayInOptimized
    } = props
    const [userDataUnassignVisit, setUserDataUnassignVisit] = useState({
        canShow: true,
        name: '',
        address: '',
        cityStateZip: ''
    })
    const [selectDataForAssign, setSelectDataForAssign] = useState({})
    const [renderData, setRenderData] = useState([])
    const [originData, setOriginData] = useState([])
    const modalizeRef = useRef<Modalize>(null)
    const searchBarFilter: any = useRef()
    const SPLIT_SIGNATURE = ' '
    const CLEAR_TEXT = 'clearText'
    const DEFAULT = 'default'
    const DEFAULT_MODAL_HEIGHT = 510
    const ANOTHER_MODAL_HEIGHT = 542
    const MODAL_HEIGHT_WITH_KEYBOARD = 750
    const [keyboardIsShow, setKeyboardIsShow] = useState(false)

    // sort data by employee daily hours for optimized visits screen
    const sortData = (employeeList) => {
        // get current select day hours from `dailyVisitList` field
        // And Sort by Planned Daily Hours (least --> greatest) with least showing first --AC
        employeeList = employeeList.filter((ee) => {
            const selectedDayStatusObj = ee.workingStatus.find((day) => day.name === selectDayInOptimized)
            return selectedDayStatusObj.attend
        })
        const updateEmployeeList = employeeList.map((el) => {
            let tmpSelectDayHours = 0
            if (Object.keys(el.visits).find((key) => key === selectDayInOptimized)) {
                const selDayVisits = el.visits[selectDayInOptimized]
                if (selDayVisits) {
                    for (const vl of selDayVisits) {
                        tmpSelectDayHours += vl.totalDuration
                    }
                }
            }
            el.dailyHours = tmpSelectDayHours
            return el
        })
        return sortArrByParamsASC(sortArrByParamsASC(updateEmployeeList, 'totalHours'), 'dailyHours')
    }

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardIsShow(true)
        })
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardIsShow(false)
        })
        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }
    }, [])

    const openModal = () => {
        navigation.setOptions({ tabBarVisible: false })
        if (isEmployee) {
            const filterData = data.filter((item) => item?.id !== userData.id)
            setOriginData(filterData)
            setRenderData(filterData)
        } else {
            setOriginData(data)
            setRenderData(data)
        }
        modalizeRef.current?.open()
    }

    useImperativeHandle(cRef, () => ({
        openModal: (selectData: object, userDataTemp) => {
            setSelectDataForAssign(selectData)
            if (userDataTemp) {
                setUserDataUnassignVisit(userDataTemp)
            }
            openModal()
        },
        closeModal: () => {
            modalizeRef.current?.close()
        }
    }))

    const getRenderData = (searchText) => {
        if (
            type === ReassignModalType.ReassignModalType_CustomerDetail ||
            type === ReassignModalType.ReassignModalType_EmployeeDetail
        ) {
            if (originData) {
                const filteredEmployees = []
                searchText = searchText.toUpperCase()
                originData.forEach((employee) => {
                    const fullName = (employee.firstName + SPLIT_SIGNATURE + employee.lastName)?.toUpperCase()
                    const gpid = employee.gpid?.toUpperCase()
                    if (fullName?.indexOf(searchText) >= 0 || gpid?.indexOf(searchText) >= 0) {
                        filteredEmployees.push(employee)
                    }
                })
                searchBarFilter.current.onApplyClick(
                    filteredEmployees,
                    searchText,
                    searchText.length === 0 ? CLEAR_TEXT : DEFAULT
                )
            }
        } else {
            if (renderData) {
                const filteredEmployees = []
                searchText = searchText.toUpperCase()
                renderData.forEach((employee) => {
                    const fullName = (employee.firstName + SPLIT_SIGNATURE + employee.lastName)?.toUpperCase()
                    const gpid = employee.gpid?.toUpperCase()
                    if (fullName?.indexOf(searchText) >= 0 || gpid?.indexOf(searchText) >= 0) {
                        filteredEmployees.push(employee)
                    }
                })
                searchBarFilter.current.onApplyClick(
                    filteredEmployees,
                    searchText,
                    searchText.length === 0 ? CLEAR_TEXT : DEFAULT
                )
            }
        }
    }

    const renderWStautsText = (wStatus: any, index: any) => {
        return (
            <CText
                key={index}
                style={
                    wStatus.attend
                        ? [
                              myTeamStyle.fontSize_12,
                              myTeamStyle.fontWeight_700,
                              myTeamStyle.fontColor_black,
                              myTeamStyle.marginRight_8
                          ]
                        : [
                              myTeamStyle.fontSize_12,
                              myTeamStyle.fontWeight_700,
                              myTeamStyle.fontColor_lightGary,
                              myTeamStyle.marginRight_8
                          ]
                }
            >
                {wStatus.label}
            </CText>
        )
    }

    const renderUserItem = (item) => {
        return (
            <TouchableOpacity style={myTeamStyle.teamItem}>
                <View style={myTeamStyle.teamItem_without_border}>
                    <UserAvatar
                        userStatsId={item.item.userStatsId}
                        firstName={item.item.firstName}
                        lastName={item.item.lastName}
                        avatarStyle={myTeamStyle.imgUserImage}
                        userNameText={{ fontSize: 24 }}
                    />
                    <View style={[myTeamStyle.itemContentContainer]}>
                        <CText
                            style={[myTeamStyle.fontColor_black, myTeamStyle.fontWeight_700, myTeamStyle.fontSize_16]}
                            numberOfLines={1}
                        >
                            {item.item.name}
                        </CText>
                        <View style={[myTeamStyle.rowCenter, myTeamStyle.marginTop_6, myTeamStyle.marginRight_20]}>
                            <CText
                                style={[
                                    myTeamStyle.fontColor_gary,
                                    myTeamStyle.fontWeight_400,
                                    myTeamStyle.fontSize_12
                                ]}
                            >
                                {getFTPT(item)}
                            </CText>
                            <CText
                                style={[
                                    myTeamStyle.fontColor_gary,
                                    myTeamStyle.fontWeight_400,
                                    myTeamStyle.fontSize_12
                                ]}
                                numberOfLines={1}
                            >
                                {item.item.title}
                            </CText>
                        </View>
                        <View style={[myTeamStyle.rowCenter, myTeamStyle.marginTop_6]}>
                            <CText
                                style={[
                                    myTeamStyle.fontColor_gary,
                                    myTeamStyle.fontWeight_400,
                                    myTeamStyle.fontSize_12
                                ]}
                            >
                                {formatUTCToLocalTime(item.item.startTime)}
                            </CText>
                            {item.item.startTime && <View style={myTeamStyle.itemLine} />}
                            {item.item.workingStatus.map((wStatus, index) => {
                                return renderWStautsText(wStatus, index)
                            })}
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            itemClick && itemClick(item.item)
                        }}
                    >
                        <CText style={[MyTeamStyle.fontWeight_700, MyTeamStyle.fontSize_12, { color: '#00A2D9' }]}>
                            {t.labels.PBNA_MOBILE_ASSIGN}
                        </CText>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    const renderEItem = (item) => {
        let itemView = (
            <EmployeeCell
                type={type}
                isReassign
                disabled
                item={item.item}
                selectForAssign={selectDataForAssign}
                navigation={navigation}
                index={item.index}
                reassignCallBack={(event) => reassignCallBack(event)}
                setIsLoading={setIsLoading}
                closeModal={() => {
                    modalizeRef.current?.close()
                }}
                visitListId={visitListId}
                setIsErrorShow={setIsErrorShow}
                setErrorMsgType={setErrorMsgType}
                reassignModalRef={modalizeRef}
                isOptimized={isOptimized}
            />
        )
        if (
            type === ReassignModalType.ReassignModalType_CustomerDetail ||
            type === ReassignModalType.ReassignModalType_EmployeeDetail
        ) {
            itemView = renderUserItem(item)
        }
        return itemView
    }

    const renderEmployeeAvatar = () => {
        return (
            <UserAvatar
                userStatsId={userData?.userStatsId}
                firstName={userData?.firstName}
                lastName={userData?.lastName}
                avatarStyle={styles.imgIcon}
                userNameText={{ fontSize: 20 }}
            />
        )
    }

    const renderHeaderView = () => {
        if (
            type === ReassignModalType.ReassignModalType_CustomerDetail ||
            type === ReassignModalType.ReassignModalType_EmployeeDetail ||
            !userDataUnassignVisit.canShow
        ) {
            return null
        }

        return (
            <View style={styles.infoRow}>
                {isEmployee ? renderEmployeeAvatar() : <IMG_STORE_PLACEHOLDER style={styles.imgIcon} />}
                <View style={styles.userInfo}>
                    {type === ReassignModalType.ReassignModalType_UnassignVisit ||
                    type === ReassignModalType.ReassignModalType_UnassignVisit_From_MyDay ? (
                        <>
                            <CText numberOfLines={2} ellipsizeMode="tail" style={styles.userName}>
                                {userDataUnassignVisit?.name}
                            </CText>
                            {!isEmployee && (
                                <View>
                                    <CText
                                        numberOfLines={SINGLE_LENGTH}
                                        ellipsizeMode="tail"
                                        style={styles.itemSubTile}
                                    >
                                        {userDataUnassignVisit?.address}
                                    </CText>
                                    <CText style={styles.itemSubTile}>{userDataUnassignVisit?.cityStateZip}</CText>
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            <CText numberOfLines={2} ellipsizeMode="tail" style={styles.userName}>
                                {userData?.name}
                            </CText>
                            {!isEmployee && (
                                <View>
                                    <CText
                                        numberOfLines={SINGLE_LENGTH}
                                        ellipsizeMode="tail"
                                        style={styles.itemSubTile}
                                    >
                                        {userData?.address}
                                    </CText>
                                    <CText style={styles.itemSubTile}>{userData?.cityStateZip}</CText>
                                </View>
                            )}
                        </>
                    )}
                    {isEmployee && (
                        <View style={styles.mertics}>
                            <CText style={styles.merticText}>
                                {selectDataLength === SINGLE_LENGTH
                                    ? selectDataLength + SPLIT_SIGNATURE + t.labels.PBNA_MOBILE_VISIT + SPLIT_SIGNATURE
                                    : selectDataLength +
                                      SPLIT_SIGNATURE +
                                      t.labels.PBNA_MOBILE_VISITS +
                                      SPLIT_SIGNATURE}
                            </CText>
                            <CText style={[styles.merticText]}>{selectedTime}</CText>
                        </View>
                    )}
                </View>
            </View>
        )
    }
    const renderTitleView = () => {
        if (
            type === ReassignModalType.ReassignModalType_CustomerDetail ||
            type === ReassignModalType.ReassignModalType_EmployeeDetail
        ) {
            return (
                <CText style={styles.reassignTo}>
                    {t.labels.PBNA_MOBILE_REASSIGN +
                        ' ' +
                        selectDataLength +
                        ' ' +
                        t.labels.PBNA_MOBILE_RECURRING_VISIT_TO}
                </CText>
            )
        }
        if (
            ReassignModalType.ReassignModalType_UnassignVisit ||
            ReassignModalType.ReassignModalType_UnassignVisit_From_MyDay
        ) {
            return (
                <CText style={styles.reassignTo}>
                    {t.labels.PBNA_MOBILE_REASSIGN + ' ' + selectDataLength + ' ' + t.labels.PBNA_MOBILE_VISIT_TO}
                </CText>
            )
        }
        return <CText style={styles.reassignTo}>{t.labels.PBNA_MOBILE_REASSIGN_TO}</CText>
    }

    const getModalHeight = () => {
        if (keyboardIsShow) {
            return MODAL_HEIGHT_WITH_KEYBOARD
        }
        return !isEmployee ? ANOTHER_MODAL_HEIGHT : DEFAULT_MODAL_HEIGHT
    }

    return (
        <Modalize
            ref={modalizeRef}
            handleStyle={styles.handleStyle}
            onClose={() => {
                navigation.setOptions({ tabBarVisible: true })
            }}
            HeaderComponent={
                <View>
                    <View style={styles.alignCenter}>
                        <View style={styles.titleView}>
                            <CText style={styles.titleText}>
                                {type === ReassignModalType.ReassignModalType_CustomerDetail ||
                                type === ReassignModalType.ReassignModalType_EmployeeDetail
                                    ? t.labels.PBNA_MOBILE_REASSIGN_RECURRING_VISITS
                                    : t.labels.PBNA_MOBILE_REASSIGN_VISITS}
                            </CText>
                        </View>
                        <View style={styles.dividerView}>
                            <Divider style={styles.divider} />
                        </View>
                        {!userData?.unassignedRoute && renderHeaderView()}
                    </View>
                    <View style={styles.reassignView}>
                        {renderTitleView()}
                        <SearchBarFilter
                            cRef={searchBarFilter}
                            isReview
                            isEmployee
                            isAddVisit={
                                type === ReassignModalType.ReassignModalType_CustomerDetail ||
                                type === ReassignModalType.ReassignModalType_EmployeeDetail
                            }
                            setListData={setRenderData}
                            originListData={originData}
                            originData={originData}
                            notShowFilterBtn={isOptimized}
                            placeholder={
                                type === ReassignModalType.ReassignModalType_EmployeeDetail
                                    ? t.labels.PBNA_MOBILE_SEARCH_EMPLOYEE
                                    : t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES
                            }
                            searchTextChange={(text) => getRenderData(text)}
                        />
                    </View>
                </View>
            }
            flatListProps={{
                data: isOptimized ? sortData(renderData) : renderData,
                extraData: isOptimized ? sortData(renderData) : renderData,
                renderItem: renderEItem,
                keyExtractor: (item) => item.id,
                showsVerticalScrollIndicator: false,
                contentContainerStyle: isOptimized && { paddingHorizontal: 22, paddingVertical: 28 }
            }}
            modalHeight={getModalHeight()}
        />
    )
}

export default ReassignModal
