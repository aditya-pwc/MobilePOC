import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { FlatList, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CText from '../../../../common/components/CText'
import { t } from '../../../../common/i18n/t'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import UserAvatar from '../../common/UserAvatar'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { useMyTeamList } from '../../../hooks/UserHooks'
import _ from 'lodash'
import { employeesFilterObj, setFilterListSelected } from '../../../utils/LeadCustomerFilterUtils'
import { getFullTime } from '../my-team/SalesMyTeamTile'
import { SearchBar } from 'react-native-elements'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../../common/CommonParam'

interface FilterSelectEmployeeModalProps {
    selectedEmployees: any
    setSelectedEmployees: any
    cRef: any
    employeesFilterList: any
    setEmployeesFilterList: any
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F2F4F7',
        flex: 1
    },
    mainContainer: {
        paddingTop: 60,
        paddingLeft: 22,
        paddingRight: 22,
        backgroundColor: '#FFFFFF'
    },
    imgUserImage: {
        width: 60,
        height: 60,
        borderRadius: 8
    },
    metrics: {
        marginTop: 22,
        marginBottom: 20
    },
    fontWeight_700: {
        fontWeight: '700'
    },
    fontWeight_400: {
        fontWeight: '400'
    },
    fontSize_12: {
        fontSize: 12
    },
    fontSize_16: {
        fontSize: 16
    },
    fontColor_black: {
        color: '#000000'
    },
    fontColor_gary: {
        color: '#565656'
    },
    fontColor_blue: {
        color: '#00A2D9'
    },
    marginTop_6: {
        marginTop: 6
    },
    marginRight_20: {
        marginRight: 20
    },
    teamItem: {
        flex: 1,
        backgroundColor: 'white',
        marginBottom: 20,
        marginHorizontal: 22,
        borderRadius: 6,
        alignItems: 'center',
        shadowOpacity: 0.4,
        shadowColor: '#004C97',
        shadowOffset: { width: 0, height: 2 }
    },
    teamItem_without_border: {
        flex: 1,
        height: 110,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center'
    },
    itemContentContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 20
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemLine: {
        width: 1,
        height: 14,
        backgroundColor: '#D3D3D3',
        marginLeft: 7,
        marginRight: 5
    },
    userAvatar: {
        position: 'relative'
    },
    topTitle: {
        paddingBottom: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    topTitleText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 3
    },
    backButton: {
        width: 30,
        height: 30,
        position: 'absolute',
        left: 0,
        top: 0
    },
    backButtonImage: {
        width: 12,
        height: 21
    },
    searchBarInnerContainer: {
        width: '100%',
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F3F6'
    },
    searchBarInputContainer: {
        backgroundColor: '#F0F3F6'
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    checkCircleStyle: {
        height: 24,
        width: 24
    }
})

const FilterSelectEmployeeModal: FC<FilterSelectEmployeeModalProps> = (props: FilterSelectEmployeeModalProps) => {
    const { setSelectedEmployees, selectedEmployees, cRef, employeesFilterList, setEmployeesFilterList } = props
    const [searchValue, setSearchValue] = useState('')
    const [originSelectedEmployees, setOriginSelectedEmployees] = useState({})
    const [searchTempValue, setSearchTempValue] = useState('')
    const [employeeTempList, setEmployeeTempList] = useState([])
    const [allSelectedCount, setAllSelectedCount] = useState(0)
    const [currentSelectedCount, setCurrentSelectedCount] = useState(0)
    const [saveStatus, setSaveStatus] = useState(false)
    const [visible, setVisible] = useState(false)
    const teamList = useMyTeamList(visible, 0, searchValue)
    useImperativeHandle(cRef, () => ({
        open: () => {
            setVisible(true)
        }
    }))
    const getEmployeeMap = () => {
        const data = {}
        teamList.forEach((e) => {
            data[e.Id] = e
        })
        return data
    }

    const checkSelectedData = () => {
        const data = getEmployeeMap()
        let count = 0
        for (const key in selectedEmployees) {
            if (data[selectedEmployees[key].Id]) {
                data[selectedEmployees[key].Id].isSelected = true
                count++
            }
        }
        setCurrentSelectedCount(count)
        return Object.values(data)
    }

    useEffect(() => {
        setCurrentSelectedCount(0)
        setEmployeeTempList(checkSelectedData())
        setOriginSelectedEmployees(_.cloneDeep(selectedEmployees))
    }, [visible, teamList])

    useEffect(() => {
        setSaveStatus(allSelectedCount > 0 && allSelectedCount <= 10)
    }, [allSelectedCount])

    useEffect(() => {
        setAllSelectedCount(Object.keys(selectedEmployees).length)
    }, [selectedEmployees])

    const clickItem = (item) => {
        const data = getEmployeeMap()
        data[item.Id].isSelected = !data[item.Id].isSelected
        setEmployeeTempList(Object.values(data))
        if (data[item.Id].isSelected) {
            setCurrentSelectedCount(currentSelectedCount + 1)
            selectedEmployees[item.Id] = item
            setSelectedEmployees(JSON.parse(JSON.stringify(selectedEmployees)))
            Instrumentation.reportMetric(`${CommonParam.PERSONA__c} clicks employee filter`, 1)
        } else {
            setCurrentSelectedCount(currentSelectedCount - 1)
            delete selectedEmployees[item.Id]
            setSelectedEmployees(JSON.parse(JSON.stringify(selectedEmployees)))
        }
    }
    const onClickAdd = () => {
        setSelectedEmployees(selectedEmployees)
        const selectedArr = Object.values(selectedEmployees)
        const tempEmployeesList = []
        _.forEach(selectedArr, (v: any) => {
            tempEmployeesList.push({
                fieldName: 'Owner_GPID_c__c',
                value: v.Id,
                GPID: v.GPID__c
            })
        })
        setFilterListSelected(
            'employees',
            tempEmployeesList,
            employeesFilterList,
            setEmployeesFilterList,
            employeesFilterObj
        )
        setSearchValue('')
        setSearchTempValue('')
        setVisible(false)
    }
    const renderItemContent = (item) => {
        return (
            <View style={[styles.itemContentContainer]}>
                <CText style={[styles.fontColor_black, styles.fontWeight_700, styles.fontSize_16]} numberOfLines={1}>
                    {item.item.Name}
                </CText>
                <View style={[styles.rowCenter, styles.marginTop_6, styles.marginRight_20]}>
                    <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                        {getFullTime(item.item.FT_EMPLYE_FLG_VAL__c)}
                    </CText>
                    {!_.isEmpty(item.item.Title) && !_.isEmpty(item.item.FT_EMPLYE_FLG_VAL__c) && (
                        <CText style={styles.itemLine}>{' | '}</CText>
                    )}
                    <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]} numberOfLines={1}>
                        {item.item.Title}
                    </CText>
                </View>
            </View>
        )
    }
    const renderItem = (item) => {
        return (
            <View style={styles.teamItem}>
                <View style={styles.teamItem_without_border}>
                    <View style={styles.userAvatar}>
                        <UserAvatar
                            userStatsId={item.item.userStatsId}
                            firstName={item.item.firstName}
                            lastName={item.item.lastName}
                            avatarStyle={styles.imgUserImage}
                            userNameText={{ fontSize: 24 }}
                        />
                    </View>
                    {renderItemContent(item)}
                    <TouchableOpacity onPress={() => clickItem(item.item)} hitSlop={commonStyle.hitSlop}>
                        {item.item.isSelected ? (
                            <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.checkCircleStyle} />
                        ) : (
                            <CText style={[styles.fontWeight_700, styles.fontColor_blue, styles.fontSize_12]}>
                                {t.labels.PBNA_MOBILE_SELECT}
                            </CText>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    return (
        <Modal visible={visible}>
            <View style={styles.container}>
                <View style={styles.mainContainer}>
                    <View style={styles.topTitle}>
                        <TouchableOpacity
                            onPress={() => {
                                setVisible(false)
                                setSelectedEmployees(originSelectedEmployees)
                                setSearchValue('')
                                setSearchTempValue('')
                            }}
                            style={styles.backButton}
                            hitSlop={commonStyle.hitSlop}
                        >
                            <Image
                                source={require('../../../../../assets/image/icon-back.png')}
                                style={styles.backButtonImage}
                            />
                        </TouchableOpacity>
                        <CText style={styles.topTitleText}>{t.labels.PBNA_MOBILE_FILTER_BY_EMPLOYEES}</CText>
                    </View>
                    <View style={styles.metrics}>
                        <SearchBar
                            platform={'ios'}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_EMPLOYEES}
                            allowFontScaling={false}
                            clearIcon={null}
                            showCancel
                            cancelButtonTitle={t.labels.PBNA_MOBILE_CLEAR}
                            containerStyle={styles.searchBarInnerContainer}
                            inputContainerStyle={styles.searchBarInputContainer}
                            inputStyle={styles.searchInputContainer}
                            value={searchTempValue}
                            // @ts-ignore
                            onChangeText={(v) => {
                                setSearchTempValue(v)
                            }}
                            onBlur={() => {
                                setSearchValue(searchTempValue)
                            }}
                            onCancel={() => {
                                setSearchTempValue('')
                                setSearchValue(searchTempValue)
                            }}
                        />
                    </View>
                </View>
                <View style={{ height: 25 }} />
                <FlatList data={employeeTempList} renderItem={renderItem} keyExtractor={(item) => item.Id} />
                <View style={{ height: 95 }} />
                <FormBottomButton
                    onPressCancel={() => {
                        setVisible(false)
                        setSelectedEmployees(originSelectedEmployees)
                        setSearchValue('')
                        setSearchTempValue('')
                    }}
                    onPressSave={() => {
                        onClickAdd()
                    }}
                    disableSave={!saveStatus}
                    rightButtonLabel={
                        allSelectedCount === 0
                            ? t.labels.PBNA_MOBILE_ADD_EMPLOYEES
                            : `${t.labels.PBNA_MOBILE_ADD} ${allSelectedCount} ${t.labels.PBNA_MOBILE_EMPLOYEES}`
                    }
                />
            </View>
        </Modal>
    )
}
export default FilterSelectEmployeeModal
