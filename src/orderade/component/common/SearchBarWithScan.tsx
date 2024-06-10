import React, { FC, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { SearchBar } from 'react-native-elements'
import { useDebounce } from '../../hooks/CommonHooks'
import { ImageSrc } from '../../../common/enums/ImageSrc'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { t } from '../../../common/i18n/t'

const styles = StyleSheet.create({
    ...commonStyle,
    searchInputContainer: {
        height: 36,
        marginTop: 0,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        padding: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        flexShrink: 1,
        backgroundColor: '#ff0000'
    },
    inputContainerStyle: {
        height: 36,
        backgroundColor: '#F2F4F7',
        padding: 0,
        borderRadius: 10
    },
    searchFont: {
        fontSize: baseStyle.fontSize.fs_14
    },
    micIconContainer: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: baseStyle.color.liteGrey
    },
    bgActive: {
        backgroundColor: baseStyle.color.LightBlue
    },
    barCodeContainer: {
        height: 36,
        width: 36,
        borderRadius: 4,
        backgroundColor: baseStyle.color.liteGrey
    }
})
interface SearchBarWithScanPropsType {
    search: string
    setSearch: Function
    onTapVoice?: Function
    onTapScan?: Function
    debounce?: number
    hideScan?: boolean
    placeholder?: string
}
const SearchBarWithScan: FC<SearchBarWithScanPropsType> = (props) => {
    const { search, setSearch, onTapVoice, onTapScan, debounce = 300, hideScan, placeholder } = props
    const [_search, _setSearch] = useState<string>(search)

    useDebounce(
        () => {
            setSearch(_search)
        },
        debounce,
        [_search]
    )

    const renderSearchBarClear = () => {
        if (search) {
            return (
                <TouchableOpacity
                    onPress={() => {
                        setSearch('')
                        _setSearch('')
                    }}
                >
                    <Image style={styles.iconSmall} source={ImageSrc.ICON_CLEAR} />
                </TouchableOpacity>
            )
        }
    }
    return (
        <View style={[styles.flexRowSpaceBet]}>
            <View style={[styles.flexDirectionRow, styles.flexGrow_1]}>
                <SearchBar
                    platform="ios"
                    containerStyle={[styles.searchInputContainer, styles.greyBox]}
                    inputContainerStyle={styles.inputContainerStyle}
                    inputStyle={[styles.colorBlack, styles.marginX0, styles.searchFont]}
                    leftIconContainerStyle={styles.marginLeft5}
                    clearIcon={renderSearchBarClear}
                    cancelButtonTitle={''}
                    cancelButtonProps={{ style: { width: 0 } }}
                    placeholder={placeholder || t.labels.PBNA_MOBILE_SEARCH}
                    onChangeText={(text: string) => {
                        _setSearch(text)
                    }}
                    value={_search}
                    allowFontScaling={false}
                />
                <View
                    style={[
                        styles.micIconContainer,
                        styles.alignCenter,
                        styles.iconLarge,
                        onTapVoice && styles.bgActive
                    ]}
                >
                    <TouchableOpacity
                        hitSlop={styles.hitSlop12}
                        onPress={() => {
                            onTapVoice && onTapVoice()
                        }}
                    >
                        <Image source={ImageSrc.IMG_MICROPHONE} style={styles.size_20} />
                    </TouchableOpacity>
                </View>
            </View>
            {!hideScan && (
                <View
                    style={[
                        styles.barCodeContainer,
                        styles.alignCenter,
                        styles.marginLeft20,
                        onTapScan && styles.bgActive
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => {
                            onTapScan && onTapScan()
                        }}
                        hitSlop={styles.hitSlop12}
                    >
                        <Image source={ImageSrc.IMG_BAR_CODE} style={styles.iconMedium} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

export default SearchBarWithScan
