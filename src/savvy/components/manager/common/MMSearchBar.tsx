/**
 * @description Search bar component.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2022-03-29
 */

import _ from 'lodash'
import React, { FC, useState, useImperativeHandle } from 'react'
import { Image, View } from 'react-native'
import { SearchBar } from 'react-native-elements'
import { ImageSrc } from '../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import SearchBarFilterStyle from '../../../styles/manager/SearchBarFilterStyle'
import { renderClearIcon } from '../helper/MMSearchBarHelper'

interface SearchBarProps {
    cRef?: any
    placeholder?: string
    needAddBtn?: boolean
    onAddClick?: Function
    onSearchTextChange: Function
    onFocus?: any
    originData: Array<any>
    setSearchResult: Function
}

const DEFAULT = 'default'
const styles = SearchBarFilterStyle
const IMG_SEARCH = ImageSrc.IMG_SEARCH

const renderSearchIcon = () => {
    return <Image style={styles.imgSearch} source={IMG_SEARCH} />
}

const MMSearchBar: FC<SearchBarProps> = (props: SearchBarProps) => {
    const { cRef, placeholder, needAddBtn, onAddClick, onSearchTextChange, onFocus, originData, setSearchResult } =
        props
    const [isCleared, setIsCleared] = useState(false)
    const [searchText, setSearchText] = useState('')

    const clearIconMethod = () => {
        setIsCleared(true)
        setSearchText('')
        const result = onSearchTextChange(originData, '')
        setSearchResult(result)
    }

    const onChangeText = _.debounce((text) => {
        setSearchResult(onSearchTextChange(originData, text))
    }, 800)

    const onChangeTextCB = (text) => {
        setSearchText(text)
        if (isCleared) {
            setIsCleared(false)
        }
        onChangeText(text)
    }

    useImperativeHandle(cRef, () => ({
        onChangeText: (data, text) => {
            setSearchResult(onSearchTextChange(data, text))
        },
        reset: () => {
            setSearchText('')
            setIsCleared(true)
        }
    }))

    return (
        <View style={commonStyle.flexRowSpaceCenter}>
            <SearchBar
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={styles.inputStyle}
                leftIconContainerStyle={styles.leftIconContainerStyle}
                searchIcon={() => renderSearchIcon()}
                clearIcon={() => renderClearIcon(needAddBtn, searchText, isCleared, onAddClick, clearIconMethod)}
                placeholder={placeholder}
                placeholderTextColor={'#565656'}
                onChangeText={(text) => onChangeTextCB(text)}
                value={searchText}
                allowFontScaling={false}
                platform={DEFAULT}
                onFocus={onFocus}
            />
        </View>
    )
}

export default MMSearchBar
