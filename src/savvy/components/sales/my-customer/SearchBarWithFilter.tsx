/*
 * @Description: SearchBar Distinguish between UI and business
 * @Author: Yi Li
 * @Date: 2021-11-28 22:05:12
 * @LastEditTime: 2023-12-11 12:22:13
 * @LastEditors: Yi Li
 */
import React, { useImperativeHandle, useState } from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { SearchBar } from 'react-native-elements'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { baseStyle } from '../../../../common/styles/BaseStyle'

interface SearchBarProps {
    cRef?: any
    onFocus?: any
    onChangeSearchBarText?: any
    onClickClearIcon?: any
    searchBarValue?: string
    initSearchValue?: string
    placeholder?: string
    onClickFilter?: any
    hideFilterBtn?: boolean
    filterSelected?: boolean
}

const DEFAULT = 'default'

const styles = StyleSheet.create({
    searchContainer: {
        ...commonStyle.flexRowSpaceCenter
    },
    searchBarContainer: {
        height: 36,
        marginTop: 0,
        backgroundColor: baseStyle.color.bgGray,
        borderRadius: 10,
        padding: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        flexShrink: 1,
        flex: 1
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
    imgSortActiveContainer: {
        backgroundColor: baseStyle.color.tabBlue,
        marginLeft: 22,
        paddingHorizontal: 4,
        paddingVertical: 7,
        borderRadius: 8
    },
    imgSortActive: {
        tintColor: baseStyle.color.white
    },
    imgSortNormalContainer: {
        marginLeft: 22,
        paddingHorizontal: 4,
        paddingVertical: 7,
        borderRadius: 8
    },
    imgSortNormal: {
        width: 32,
        height: 19
    }
})

const renderSortIcon = (hideFilterBtn?: boolean, onClickFilterFunc?: Function, filterSelected?: boolean) => {
    if (hideFilterBtn) {
        return null
    }
    return (
        <TouchableOpacity
            style={[filterSelected ? styles.imgSortActiveContainer : styles.imgSortNormalContainer]}
            onPress={() => {
                onClickFilterFunc && onClickFilterFunc()
            }}
        >
            <Image style={[filterSelected && styles.imgSortActive, styles.imgSortNormal]} source={ImageSrc.IMG_SORT} />
        </TouchableOpacity>
    )
}

const renderDefaultClearIcon = (isCleared: boolean, onPressClear: Function) => {
    if (isCleared) {
        return null
    }
    return (
        <TouchableOpacity
            onPress={() => {
                onPressClear && onPressClear()
            }}
        >
            <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
        </TouchableOpacity>
    )
}

const renderSearchIcon = () => {
    return <Image style={styles.imgSearch} source={ImageSrc.IMG_SEARCH} />
}
const SearchBarWithFilter = (props: SearchBarProps) => {
    const {
        onFocus,
        onChangeSearchBarText,
        onClickClearIcon,
        placeholder,
        onClickFilter,
        hideFilterBtn,
        filterSelected,
        initSearchValue,
        cRef
    } = props
    const [searchBarValue, setSearchBarFilterText] = useState(initSearchValue || '')
    const [isCleared, setIsCleared] = useState(false)

    const onSearchTextChange = (text: string) => {
        const searchText = text.replace(/[‘’`]/g, "'")
        setSearchBarFilterText(searchText)
        onChangeSearchBarText(searchText)
        setIsCleared(searchText.length === 0)
    }

    const onClearIconClick = () => {
        setIsCleared(true)
        setSearchBarFilterText('')
        onChangeSearchBarText && onChangeSearchBarText('')
        onClickClearIcon && onClickClearIcon()
    }

    useImperativeHandle(cRef, () => ({
        onResetClick: () => {
            onClearIconClick()
        }
    }))

    return (
        <View style={styles.searchContainer}>
            <SearchBar
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={styles.inputStyle}
                leftIconContainerStyle={styles.leftIconContainerStyle}
                searchIcon={renderSearchIcon}
                clearIcon={() => {
                    return renderDefaultClearIcon(isCleared, onClearIconClick)
                }}
                placeholder={placeholder}
                onChangeText={(text) => {
                    onSearchTextChange(text)
                }}
                value={searchBarValue}
                allowFontScaling={false}
                platform={DEFAULT}
                onFocus={onFocus}
            />
            {renderSortIcon(hideFilterBtn, onClickFilter, filterSelected)}
        </View>
    )
}
export default SearchBarWithFilter
