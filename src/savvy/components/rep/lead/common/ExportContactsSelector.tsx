import React, { FC, useEffect, useImperativeHandle, useState } from 'react'
import { Modal, StyleSheet, View, TouchableOpacity, Image, FlatList } from 'react-native'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { SearchBar } from 'react-native-elements'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import UserAvatar from '../../../common/UserAvatar'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import _ from 'lodash'

/**
 * @description Selector to Export Contact.
 * @author Kiren Cao
 * @date 2022-09-21
 */
const styles = StyleSheet.create({
    whiteContainer: {
        backgroundColor: baseStyle.color.white
    },
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
        fontWeight: '700',
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
    selectIconStyle: {
        height: 24,
        width: 24
    },
    clearIconStyle: {
        width: 18,
        height: 18
    },
    height25: {
        height: 25
    },
    height95: {
        height: 95
    }
})
interface ExportContactsSelectorProps {
    cRef: any
    setSelectedContacts: any
    selectedContacts: any
    type: any
    internalContacts: any
    customerContacts: any
    userList: any
    contactList: any
    setSearchContactValue: any
}

const ExportContactsSelector: FC<ExportContactsSelectorProps> = (props: ExportContactsSelectorProps) => {
    const {
        cRef,
        setSelectedContacts,
        selectedContacts,
        type,
        internalContacts,
        customerContacts,
        userList,
        contactList,
        setSearchContactValue
    } = props
    const [showContactsSelector, setShowContactsSelector] = useState(false)
    const [contactTempList, setContactTempList] = useState([])
    const [searchTempValue, setSearchTempValue] = useState('')
    const [originSelectedContact, setOriginSelectedContact] = useState({})
    const [saveStatus, setSaveStatus] = useState(false)
    const [currentSelectedCount, setCurrentSelectedCount] = useState(0)
    const [allSelectedCount, setAllSelectedCount] = useState(0)
    const [selectCount, setSelectCount] = useState(0)

    useImperativeHandle(cRef, () => ({
        open: () => {
            setShowContactsSelector(true)
        }
    }))

    const getContactMap = () => {
        const data = {}
        let tempList = []
        if (type === 'Lead') {
            if (!_.isEmpty(contactList)) {
                tempList = contactList
                tempList.forEach((e) => {
                    data[e.Id] = e
                })
            }
        } else {
            if (internalContacts === true && customerContacts === true) {
                tempList = _.concat(contactList, userList)
                tempList.forEach((e) => {
                    data[e.Id] = e
                })
            } else if (internalContacts) {
                tempList = userList
                tempList.forEach((e) => {
                    data[e.Id] = e
                })
            } else if (customerContacts) {
                tempList = contactList

                tempList.forEach((e) => {
                    data[e.Id] = e
                })
            }
        }
        return data
    }
    const checkSelectedData = () => {
        const data = getContactMap()
        let count = 0
        for (const key in selectedContacts) {
            if (data[selectedContacts[key].Id]) {
                data[selectedContacts[key].Id].isSelected = true
                count++
            }
        }
        setCurrentSelectedCount(count)
        return Object.values(data)
    }
    useEffect(() => {
        setCurrentSelectedCount(0)
        if (showContactsSelector) {
            setContactTempList(checkSelectedData())
        }
    }, [showContactsSelector, contactList, selectCount, userList])
    useEffect(() => {
        setOriginSelectedContact(_.cloneDeep(selectedContacts))
    }, [showContactsSelector])
    useEffect(() => {
        setAllSelectedCount(Object.keys(selectedContacts).length)
    }, [selectedContacts])

    useEffect(() => {
        setSaveStatus(allSelectedCount > 0)
    }, [allSelectedCount])

    const clickItem = (item) => {
        const data = getContactMap()
        data[item.Id].isSelected = !data[item.Id].isSelected
        setContactTempList(Object.values(data))
        setSelectCount((v) => v + 1)
        if (data[item.Id].isSelected) {
            setCurrentSelectedCount(currentSelectedCount + 1)
            selectedContacts[item.Id] = item
            setSelectedContacts(JSON.parse(JSON.stringify(selectedContacts)))
        } else {
            setCurrentSelectedCount(currentSelectedCount - 1)
            delete selectedContacts[item.Id]
            setSelectedContacts(JSON.parse(JSON.stringify(selectedContacts)))
        }
    }
    const onClickAdd = () => {
        setSelectedContacts(selectedContacts)
        setSearchContactValue('')
        setSearchTempValue('')
        setShowContactsSelector(false)
    }
    const renderItemContent = (item) => {
        return (
            <View style={[styles.itemContentContainer]}>
                <CText style={[styles.fontColor_black, styles.fontWeight_700, styles.fontSize_16]} numberOfLines={1}>
                    {item.item?.Name || item.item?.name || ''}
                </CText>
                <View style={[styles.rowCenter, styles.marginTop_6, styles.marginRight_20]}>
                    <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]} numberOfLines={1}>
                        {item.item?.Title || item.item?.title || ''}
                    </CText>
                </View>
            </View>
        )
    }
    const renderItem = (item) => {
        return _.isEmpty(item?.item) ? (
            <View />
        ) : (
            <View style={styles.teamItem}>
                <View style={styles.teamItem_without_border}>
                    <View style={styles.userAvatar}>
                        <UserAvatar
                            userStatsId={item.item?.userStatsId}
                            firstName={item.item.firstName}
                            lastName={item.item.lastName}
                            avatarStyle={styles.imgUserImage}
                            userNameText={{ fontSize: 24 }}
                        />
                    </View>
                    {renderItemContent(item)}
                    <TouchableOpacity
                        onPress={() => clickItem(item.item)}
                        hitSlop={commonStyle.hitSlop}
                        disabled={_.isEmpty(item?.item?.Name) && _.isEmpty(item?.item?.name)}
                    >
                        {item.item.isSelected ? (
                            <Image source={ImageSrc.ICON_CHECKMARK_CIRCLE} style={styles.selectIconStyle} />
                        ) : (
                            <CText style={[styles.fontWeight_700, styles.fontColor_blue, styles.fontSize_12]}>
                                {t.labels.PBNA_MOBILE_SELECT.toLocaleUpperCase()}
                            </CText>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <Modal visible={showContactsSelector}>
            <View style={styles.container}>
                <View style={styles.mainContainer}>
                    <View style={styles.topTitle}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowContactsSelector(false)
                                setSearchContactValue('')
                                setSearchTempValue('')
                                setSelectedContacts(originSelectedContact)
                            }}
                            style={styles.backButton}
                            hitSlop={commonStyle.hitSlop}
                        >
                            <Image
                                source={require('../../../../../../assets/image/icon-back.png')}
                                style={styles.backButtonImage}
                            />
                        </TouchableOpacity>
                        <CText style={styles.topTitleText}>{t.labels.PBNA_MOBILE_EXPORT_AND_SHARE.toUpperCase()}</CText>
                    </View>
                    <View style={styles.metrics}>
                        <SearchBar
                            platform={'ios'}
                            placeholder={t.labels.PBNA_MOBILE_SEARCH_CONTACTS}
                            allowFontScaling={false}
                            clearIcon={
                                !_.isEmpty(searchTempValue) && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSearchContactValue('')
                                            setSearchTempValue('')
                                        }}
                                    >
                                        <Image
                                            style={styles.clearIconStyle}
                                            source={require('../../../../../../assets/image/ios-clear.png')}
                                        />
                                    </TouchableOpacity>
                                )
                            }
                            cancelButtonTitle={''}
                            containerStyle={styles.searchBarInnerContainer}
                            inputContainerStyle={styles.searchBarInputContainer}
                            inputStyle={styles.searchInputContainer}
                            value={searchTempValue}
                            // @ts-ignore
                            onChangeText={(v) => {
                                setSearchTempValue(v)
                            }}
                            onBlur={() => {
                                setSearchContactValue(searchTempValue)
                            }}
                        />
                    </View>
                </View>
                <View style={styles.height25} />
                <FlatList data={contactTempList} renderItem={renderItem} keyExtractor={(item) => item.Id} />
                <View style={styles.height95} />
                <FormBottomButton
                    onPressCancel={() => {
                        setShowContactsSelector(false)
                        setSearchContactValue('')
                        setSearchTempValue('')
                        setSelectedContacts(originSelectedContact)
                    }}
                    onPressSave={() => {
                        onClickAdd()
                    }}
                    disableSave={!saveStatus}
                    rightButtonLabel={
                        allSelectedCount === 0
                            ? t.labels.PBNA_MOBILE_SELECT_CONTACTS
                            : `${t.labels.PBNA_MOBILE_SELECT} ${allSelectedCount} ${t.labels.PBNA_MOBILE_CONTACT_S}`
                    }
                />
            </View>
        </Modal>
    )
}
export default ExportContactsSelector
