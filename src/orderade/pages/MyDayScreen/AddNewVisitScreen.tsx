import React, { useState, useRef } from 'react'
import { StatusBar, Modal, FlatList, StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import CText from '../../../common/components/CText'
import { SearchBar } from 'react-native-elements'
import { visitStyle } from '../../styles/VisitStyle'
import AddVisitBtn from '../../component/visits/AddVisitButton'
import BrandingLoading from '../../../common/components/BrandingLoading'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import VisitCard from '../../component/visits/VisitCard'
import { useRetailStoreBySearch } from '../../hooks/AddVisitHooks'
import { getShowText, syncAddVisits } from './AddNewVisitScreenViewModel'
import { useDropDown } from '../../../common/contexts/DropdownContext'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { NavigationProp } from '@react-navigation/native'
import { useNetInfo } from '@react-native-community/netinfo'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'
import EmptyListPlaceholder from '../../../common/components/EmptyListPlaceholder'
import { AddVisitModel } from '../../interface/AddVisitModel'

const styles = StyleSheet.create({
    ...commonStyle,
    ...visitStyle,
    containerHeader: {
        minHeight: 180,
        backgroundColor: '#FFFFFF'
    },
    searchBarContainer: {
        height: 36,
        marginTop: 0,
        borderRadius: 10,
        padding: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        flexShrink: 1
    },
    inputContainerStyle: {
        height: 36,
        backgroundColor: '#F2F4F7',
        padding: 0,
        borderRadius: 10
    },
    storeList: {
        flex: 1,
        paddingTop: StatusBar.currentHeight
    },
    successImgSize: {
        width: 56,
        height: 53
    },
    filterIconSize: {
        width: 32,
        height: 19
    },
    searchFont: {
        fontSize: baseStyle.fontSize.fs_14
    }
})

interface AddVisitProps {
    navigation: NavigationProp<any>
}

const AddNewVisitScreen = (props: AddVisitProps) => {
    const { navigation } = props
    const [addVisitList, setAddVisitList] = useState<Array<AddVisitModel>>([])
    const [searchText, setSearchText] = useState('')
    const [showModal, setShowModal] = useState(false)
    const brandingLoading: any = useRef()
    const { dropDownRef } = useDropDown()
    const [isCreate, setIsCreate] = useState(false)
    const { rsData, addVisits } = useRetailStoreBySearch(searchText, addVisitList, setAddVisitList)
    const netInfo = useNetInfo()

    const onClose = () => {
        navigation.goBack()
    }

    const syncVisits = () => {
        setIsCreate(true)
        syncAddVisits(addVisitList, setShowModal, navigation, dropDownRef, setIsCreate)
    }

    const renderItem = ({ item }) => {
        return <VisitCard addVisits={addVisits} item={item} key={item.Id} isOnline={netInfo.isInternetReachable} />
    }

    const renderSearchBarClear = () => {
        if (searchText) {
            return (
                <TouchableOpacity
                    onPress={() => {
                        setSearchText('')
                    }}
                >
                    <Image style={styles.iconSmall} source={ImageSrc.ICON_CLEAR} />
                </TouchableOpacity>
            )
        }
    }

    return (
        <View style={styles.greyBox}>
            <View style={[styles.containerHeader, styles.paddingX]}>
                <View style={[styles.marginTop51, styles.rowWithCenter]}>
                    <CText style={styles.fontBolder}>{t.labels.PBNA_MOBILE_ADD_NEW_VISIT}</CText>
                </View>
                <View style={[styles.marginTop37, styles.rowWithCenter]}>
                    <SearchBar
                        platform="ios"
                        containerStyle={[styles.searchBarContainer, styles.greyBox]}
                        inputContainerStyle={styles.inputContainerStyle}
                        inputStyle={[styles.colorBlack, styles.marginX0, styles.searchFont]}
                        leftIconContainerStyle={styles.marginLeft5}
                        clearIcon={renderSearchBarClear}
                        cancelButtonTitle={''}
                        cancelButtonProps={{ style: { width: 0 } }}
                        placeholder={t.labels.PBNA_MOBILE_SEARCH}
                        onChangeText={(text: string) => setSearchText(text)}
                        value={searchText}
                        allowFontScaling={false}
                    />
                </View>
            </View>

            <View style={[styles.storeList]}>
                <FlatList
                    data={rsData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.Id}
                    style={[styles.paddingTop_22, styles.flex_1]}
                    contentContainerStyle={styles.paddingBottom_22}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={5}
                    ListEmptyComponent={<EmptyListPlaceholder transparentBackground />}
                />
            </View>

            <AddVisitBtn onClose={onClose} syncAddVisits={syncVisits} addVisitList={addVisitList} isCreate={isCreate} />

            <BrandingLoading cRef={brandingLoading} />

            <Modal animationType="fade" transparent visible={showModal}>
                <TouchableOpacity style={styles.modalBg} onPress={() => {}}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Image style={styles.successImgSize} source={ImageSrc.IMG_SUCCESS_ICON} />
                            {
                                <CText style={styles.modalText}>
                                    {addVisitList.length} {t.labels.PBNA_MOBILE_NEW.toLowerCase()}{' '}
                                    {getShowText(addVisitList)} {t.labels.PBNA_MOBILE_ADD_SUCCESS.toLowerCase()}!
                                </CText>
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default AddNewVisitScreen
