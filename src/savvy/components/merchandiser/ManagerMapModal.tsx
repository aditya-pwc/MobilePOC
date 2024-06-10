/**
 * @description A modal to ask if the user want to take a lunch or have a break.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-03-21
 * @LastModifiedDate 2021-03-21 First Commit
 */
import React, { useImperativeHandle, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import TitleModal from '../../../common/components/TitleModal'
import PhoneIcon from '../common/PhoneIcon'
import VisitCard from './VisitCard'
import IconChat from '../../../../assets/image/icon-chat-svg.svg'
import UserAvatar from '../common/UserAvatar'
import { VisitStatus } from '../../enums/Visit'
import { t } from '../../../common/i18n/t'
import { TabID } from '../../redux/types/H01_Manager/data-tabIndex'
import { commonStyle } from '../../../common/styles/CommonStyle'

export const styles = StyleSheet.create({
    employeeContainer: {
        paddingLeft: 22,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    imgAvatar: {
        width: 40,
        height: 40,
        borderRadius: 8
    },
    content: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 22
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000'
    },
    status: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 7
    },
    salesRouteLabel: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400',
        color: '#565656'
    },
    salesRouteSplitLine: {
        marginHorizontal: 4
    },
    salesRouteVal: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400',
        color: '#000000'
    },

    totalVisits: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    statusIcon: {
        marginRight: 8,
        marginLeft: 15,
        width: 8,
        height: 8,
        backgroundColor: '#FFF',
        borderRadius: 4
    },
    statusText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    marginRight15: {
        marginRight: 15
    },

    tabItemView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabButton: {
        flex: 1
    },
    tabLocationIcon: {
        width: 24,
        height: 24,
        resizeMode: 'stretch'
    },
    callIcon: {
        width: 18,
        height: 19,
        resizeMode: 'stretch'
    },
    tabTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 10
    },
    tabLine: {
        width: 1,
        height: 20,
        backgroundColor: '#D3D3D3'
    },
    buttonGroup: {
        width: '100%',
        height: 80,
        backgroundColor: '#F2F4F7',
        flexDirection: 'row',
        bottom: 0,
        paddingBottom: 20
    },

    visitCardBox: {
        width: '100%',
        // visit has style marginBottom: 17 current marginBottom=30-17
        marginBottom: 13,
        marginTop: 30
    },

    visitCardBoxForSales: {
        width: '90%',
        marginBottom: 13
    },
    marginTop30: {
        marginTop: 30
    },
    landScapeMap: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FFF'
    }
})

interface ManagerMapModalProps {
    cRef
    navigation
    visible
    onHideMapModal
    onPressTabIcons?: any
    hideButtonGroup?: any
    modalStyle?: any
    showNationIdAndSalesRoute?: boolean
    isShowRouteTab?: boolean
    onlyShowOrder?: boolean
    hideFooter?: boolean
    showSubTypeBlock?: boolean
    showSalesSubTypeBlock?: any
    currentTab?: number
    isIndividual?: boolean
}

export const tabView = (props: any) => {
    const {
        tabItemView,
        imageStyle,
        titleStyle,
        imageIcon,
        titleStr,
        index,
        modalData,
        phoneNumber,
        onHideMapModal,
        onPressTabIcons
    } = props
    const validPhone = phoneNumber?.length > 0
    const disabledColor = '#D3D3D3'
    const imageColor = validPhone ? '#00A2D9' : disabledColor
    const textColor = index === 2 || validPhone ? '#000000' : disabledColor

    return (
        <View key={titleStr} style={[{ flex: index === 2 ? 1.5 : 1 }, commonStyle.flexRowAlignCenter]}>
            <View style={tabItemView}>
                <TouchableOpacity
                    style={[tabItemView, styles.tabButton]}
                    onPress={() => {
                        if (validPhone || index === 2) {
                            onHideMapModal()
                            onPressTabIcons && onPressTabIcons(modalData, index)
                        }
                    }}
                >
                    {index === 0 && <IconChat style={[imageStyle, { color: imageColor }]} />}
                    {index === 1 && <PhoneIcon isDisabled={!validPhone} />}
                    {index === 2 && <Image style={imageStyle} source={imageIcon} />}
                    <CText style={[titleStyle, { color: textColor }]}>{titleStr}</CText>
                </TouchableOpacity>
            </View>
            <View style={styles.tabLine} />
        </View>
    )
}

const ManagerMapModal = (props: ManagerMapModalProps) => {
    const {
        cRef,
        navigation,
        visible,
        onHideMapModal,
        onPressTabIcons,
        onlyShowOrder,
        modalStyle,
        hideButtonGroup,
        isShowRouteTab,
        showNationIdAndSalesRoute,
        hideFooter,
        showSubTypeBlock,
        showSalesSubTypeBlock,
        currentTab,
        isIndividual
    } = props
    const [modalData, setModalData] = useState({
        name: '',
        completeVisit: 0,
        allVisit: 0,
        isUnassigned: false,
        orderNumerator: 0,
        orderDenominator: 0,
        visitListStatus: '',
        userName: '',
        phoneNumber: '',
        userStatsId: '',
        firstName: '',
        lastName: '',
        status: ''
    })
    const openModal = (item) => {
        item.isUnassigned = !item.VisitorId
        // align with visitCard name
        item.name = item.retailStoreName
        setModalData(item)
    }
    const statusText = {
        Completed: t.labels.PBNA_MOBILE_COMPLETED,
        'In Progress': t.labels.PBNA_MOBILE_IN_PROGRESS,
        'Not Started': t.labels.PBNA_MOBILE_YET_TO_START
    }
    const statusColor = {
        Completed: '#2DD36F',
        'In Progress': '#FFC409',
        'Not Started': '#EB445A'
    }
    const isSales = currentTab === TabID.TabID_Sales
    useImperativeHandle(cRef, () => ({
        openModal: (item) => {
            openModal(item)
        }
    }))

    const messageAndCallTabBarData = [
        {
            icon: require('../../../../assets/image/icon-chat.png'),
            title: t.labels.PBNA_MOBILE_MESSAGE.toLocaleUpperCase(),
            onClick: () => {}
        },
        {
            icon: require('../../../../assets/image/icon_call.png'),
            title: t.labels.PBNA_MOBILE_CALL.toLocaleUpperCase(),
            onClick: () => {}
        }
    ]

    const showRouteTabBarData = [
        {
            icon: require('../../../../assets/image/icon-chat.png'),
            title: t.labels.PBNA_MOBILE_MESSAGE.toLocaleUpperCase(),
            onClick: () => {}
        },
        {
            icon: require('../../../../assets/image/icon_call.png'),
            title: t.labels.PBNA_MOBILE_CALL.toLocaleUpperCase(),
            onClick: () => {}
        },
        {
            icon: require('../../../../assets/image/icon-todays-route.png'),
            title: t.labels.PBNA_MOBILE_TODAYS_ROUTE.toLocaleUpperCase(),
            onClick: () => {}
        }
    ]

    const nationIdAndSalesRouteView = (item) => {
        return (
            <View style={styles.status}>
                <CText style={styles.salesRouteLabel}>{`${t.labels.PBNA_MOBILE_SALES_ROUTE} `}</CText>
                <CText style={styles.salesRouteVal}>{item.salesRoute}</CText>
                {<CText style={[styles.salesRouteLabel, styles.salesRouteSplitLine]}>{'|'}</CText>}
                <CText style={styles.salesRouteLabel}>{`${t.labels.PBNA_MOBILE_NATIONAL_ID} `}</CText>
                <CText style={styles.salesRouteVal}>{item.nationalId} </CText>
            </View>
        )
    }
    const tabBarData = isShowRouteTab ? showRouteTabBarData : messageAndCallTabBarData

    // to show visit status in the modal rather than visit list status
    const handleVisitStatus = () => {
        if (modalData.status === VisitStatus.COMPLETE) {
            return VisitStatus.COMPLETED
        } else if (modalData.status === VisitStatus.IN_PROGRESS) {
            return VisitStatus.IN_PROGRESS
        }
        return VisitStatus.NOT_STARTED
    }

    return (
        <TitleModal
            title={t.labels.PBNA_MOBILE_VISIT_INFO}
            modalStyle={modalStyle}
            visible={visible}
            onClose={onHideMapModal}
        >
            <View style={[styles.landScapeMap]}>
                <View style={[commonStyle.alignCenter, styles.marginTop30]}>
                    <View style={[styles.employeeContainer]}>
                        <View style={[styles.marginRight15]}>
                            <UserAvatar
                                isUnassigned={modalData.isUnassigned}
                                userStatsId={modalData.userStatsId || ''}
                                firstName={modalData.firstName || ''}
                                lastName={modalData.lastName || ''}
                                avatarStyle={styles.imgAvatar}
                                userNameText={{ fontSize: 16 }}
                            />
                        </View>
                        {!modalData.isUnassigned && (
                            <View style={[styles.content]}>
                                <View>
                                    <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                                        {modalData.userName}
                                    </CText>
                                    {showNationIdAndSalesRoute && nationIdAndSalesRouteView(modalData)}
                                    <View style={styles.status}>
                                        {Boolean(modalData.allVisit) && (
                                            <CText style={styles.totalVisits}>
                                                {modalData.completeVisit || 0}/{modalData.allVisit}{' '}
                                                {t.labels.PBNA_MOBILE_VISITS}
                                            </CText>
                                        )}

                                        {Boolean(modalData.allVisit && modalData.orderDenominator) && !isIndividual && (
                                            <CText style={styles.totalVisits}>{' | '}</CText>
                                        )}
                                        {Boolean(modalData.orderDenominator) && !isIndividual && (
                                            <CText style={styles.totalVisits}>
                                                {modalData.orderNumerator}/{modalData.orderDenominator}{' '}
                                                {t.labels.PBNA_MOBILE_METRICS_ORDERS}
                                            </CText>
                                        )}
                                        <View
                                            style={[
                                                styles.statusIcon,
                                                { backgroundColor: statusColor[handleVisitStatus()] }
                                            ]}
                                        />
                                        <CText style={styles.statusText}>{statusText[handleVisitStatus()]}</CText>
                                    </View>
                                </View>
                            </View>
                        )}
                        {modalData.isUnassigned && (
                            <View style={[styles.content]}>
                                <CText numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
                                    {VisitStatus.UNASSIGN.toUpperCase()}
                                </CText>
                            </View>
                        )}
                    </View>
                </View>

                <View style={isSales ? styles.visitCardBoxForSales : styles.visitCardBox}>
                    <VisitCard
                        navigation={navigation}
                        item={modalData}
                        isVisitList
                        addVisits={false}
                        fromSMap
                        notShowStatus
                        showSalesSubTypeBlock={showSalesSubTypeBlock}
                        onlyShowOrder={onlyShowOrder}
                        showSubTypeBlock={showSubTypeBlock}
                        notShowTimeCard
                        hideFooter={hideFooter}
                        isSales={isSales}
                    />
                </View>

                {!hideButtonGroup && (
                    <View style={styles.buttonGroup}>
                        {tabBarData.map((itemTab, index) => {
                            return tabView({
                                tabItemView: styles.tabItemView,
                                imageStyle: index === 1 ? styles.callIcon : styles.tabLocationIcon,
                                titleStyle: styles.tabTitle,
                                imageIcon: itemTab.icon,
                                titleStr: itemTab.title,
                                index,
                                modalData,
                                phoneNumber: modalData.phoneNumber,
                                onHideMapModal,
                                onPressTabIcons
                            })
                        })}
                    </View>
                )}
            </View>
        </TitleModal>
    )
}

export default ManagerMapModal
