/*
 * @Description: SearchBar Distinguish between UI and business
 * @Author: Yi Li
 * @Date: 2021-11-28 22:05:12
 * @LastEditTime: 2023-05-23 15:56:32
 * @LastEditors: Tom tong.jiang@pwc.com
 */
import React, { useState } from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { SearchBar } from 'react-native-elements'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'

interface SearchBarProps {
    cRef?: any
    onFocus?: any
    onChangeSearchBarText?: any
    onClickClearIcon?: any
    searchBarValue?: string
    placeholder?: string
    onClickFilter?: any
    hideFilterBtn?: boolean
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

const SearchBarWithFilter = (props: SearchBarProps) => {
    const { onFocus, onChangeSearchBarText, onClickClearIcon, placeholder, onClickFilter, hideFilterBtn } = props
    const [searchBarValue, setSearchBarFilterText] = useState('')
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
        onClickClearIcon()
    }

    const renderDefaultClearIcon = () => {
        if (isCleared) {
            return null
        }
        return (
            <TouchableOpacity onPress={onClearIconClick}>
                <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR_ICON} />
            </TouchableOpacity>
        )
    }

    const renderSortIcon = (onClickFilterFunc?: Function) => {
        if (hideFilterBtn) {
            return null
        }
        return (
            <TouchableOpacity
                style={styles.imgSortNormalContainer}
                onPress={() => {
                    onClickFilterFunc && onClickFilterFunc()
                }}
            >
                <Image style={styles.imgSortNormal} source={ImageSrc.IMG_ICON_SORT_FILTER} />
            </TouchableOpacity>
        )
    }

    const renderSearchIcon = () => {
        return <Image style={styles.imgSearch} source={ImageSrc.ICON_SEARCH} />
    }

    return (
        <View style={styles.searchContainer}>
            <SearchBar
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={styles.inputStyle}
                leftIconContainerStyle={styles.leftIconContainerStyle}
                searchIcon={() => {
                    return renderSearchIcon()
                }}
                clearIcon={() => {
                    return renderDefaultClearIcon()
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
            {renderSortIcon(onClickFilter)}
        </View>
    )
}
export default SearchBarWithFilter
