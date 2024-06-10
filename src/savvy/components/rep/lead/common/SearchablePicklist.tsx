/**
 * @description SearchablePicklist
 * @author Sheng Huang
 * @date 2021/10/18
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Modal, View, StyleSheet, TouchableOpacity, FlatList, Dimensions, Image, ColorValue } from 'react-native'
import { Input } from 'react-native-elements'
import CText from '../../../../../common/components/CText'
import { t } from '../../../../../common/i18n/t'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import _ from 'lodash'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface SearchablePickListProps {
    label: string
    data: any
    showValue?: any
    labelStyle?: any
    containerStyle?: any
    onApply?: any
    input?: boolean
    defValue?: any
    cRef?: any
    search?: boolean
    onSearchChange?: any
    renderItem?: Function
    disabled?: boolean
    placeholder?: string
    searchIcon?: boolean
    onClear?: any
    placeholderColor?: ColorValue
    rightTriangle?: boolean
    textColor?: ColorValue
    noMarginRight?: any
    searchBtnStyle?: any
}

const styles = StyleSheet.create({
    title: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400'
    },
    valueText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '400'
    },
    flexRowAlignCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgTriangle: {
        width: 10,
        height: 5
    },
    marginRight_12: {
        marginRight: 12
    },
    selectInputView: {
        paddingBottom: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    searchIconStyle: {
        height: 23,
        width: 22,
        marginRight: 5,
        marginLeft: 1,
        marginTop: 1
    },
    valueTextContainer: {
        fontSize: 14,
        minHeight: 17,
        width: '90%'
    },
    clearIconStyle: {
        width: 18,
        height: 19,
        marginRight: 10
    },
    modalBackgroundStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0)'
    },
    inputComponentContainerStyle: {
        position: 'absolute',
        marginTop: 0,
        marginBottom: 0,
        backgroundColor: '#ffffff'
    },
    inputStyle: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Gotham-Book',
        marginBottom: -2
    },
    inputContainerStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#d3d3d3',
        marginHorizontal: -10,
        marginTop: -1
    },
    inputErrorStyle: {
        height: 0,
        marginVertical: 0
    },
    inputSearchIconStyle: {
        height: 20,
        width: 25,
        marginRight: 5
    },
    flatListContainerStyle: {
        position: 'absolute',
        marginTop: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 2,
            height: 2
        },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    flatListStyle: {
        width: '100%',
        maxHeight: 300
    },
    itemText: {
        margin: 20
    },
    listSeparatorStyle: {
        height: 1,
        backgroundColor: '#d3d3d3'
    },
    listEmptyContainerStyle: {
        margin: 20,
        color: '#86939e'
    }
})

const SearchablePicklist: FC<SearchablePickListProps> = (props: SearchablePickListProps) => {
    const {
        label,
        data,
        onApply,
        showValue,
        input,
        defValue,
        cRef,
        search,
        noMarginRight = false,
        onSearchChange,
        disabled,
        placeholder,
        searchIcon,
        placeholderColor,
        onClear,
        rightTriangle = true,
        textColor,
        searchBtnStyle
    } = props
    const containerRef = useRef(null)
    const inputRef = useRef(null)
    const [value, setValue] = useState(defValue || '')
    const [tempValue, setTempValue] = useState('')
    const [measure, setMeasure] = useState(null)
    const [doMeasure, setDoMeasure] = useState(true)
    const [showPickList, setShowPickList] = useState(false)
    const [filterData, setFilterData] = useState([])
    const [picklistLayout, setPicklistLayout] = useState(null)

    const getCurrentPosition = () => {
        containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setMeasure({ x, y, width, height, pageX, pageY })
        })
    }

    useEffect(() => {
        setTempValue(defValue)
        return () => {
            setDoMeasure(false)
        }
    }, [])

    useEffect(() => {
        setFilterData(data)
    }, [data])

    useEffect(() => {
        if (doMeasure) {
            getCurrentPosition()
        }
    }, [measure, doMeasure])

    useEffect(() => {
        if (search) {
            const temp = []
            const searchText = tempValue?.replace(/[\\$()*+.[?^{|]/g, '.')
            const regExp = new RegExp(`(.*)${searchText}(.*)`, 'i')
            data.forEach((v) => {
                if (regExp.test(showValue(v))) {
                    temp.push(v)
                }
            })
            setFilterData(temp)
        }
        if (input) {
            setValue(tempValue)
            onApply(tempValue)
        }
        if (onSearchChange) {
            onSearchChange(tempValue)
        }
    }, [tempValue])

    useImperativeHandle(cRef, () => ({
        reset: () => {
            setValue(defValue)
        },
        resetNull: () => {
            setValue('')
        },
        setValue: (v) => {
            setValue(v)
        },
        showPickList: (v: boolean) => {
            setShowPickList(v)
        }
    }))

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={commonStyle.fullWidth}
                onPress={() => {
                    setValue(showValue(item))
                    if (onApply) {
                        onApply(item)
                    }
                    setShowPickList(false)
                }}
            >
                <CText style={styles.itemText}>{showValue(item)}</CText>
            </TouchableOpacity>
        )
    }

    const calculateUpOrDown = () => {
        return measure?.pageY + measure?.height + picklistLayout?.height > Dimensions.get('window').height
            ? measure?.pageY - picklistLayout?.height
            : measure?.pageY + measure?.height
    }

    const separatorComponent = () => {
        return <View style={styles.listSeparatorStyle} />
    }

    const emptyComponent = () => {
        return <CText style={styles.listEmptyContainerStyle}>{tempValue ? t.labels.PBNA_MOBILE_NO_RESULTS : ' '}</CText>
    }

    return (
        <View style={props.containerStyle || { marginBottom: 20 }}>
            {!_.isEmpty(label) && <CText style={props.labelStyle || styles.title}>{label}</CText>}
            <TouchableOpacity
                onPress={() => {
                    setShowPickList(true)
                    setTempValue(value)
                }}
                style={[
                    styles.selectInputView,
                    { borderBottomWidth: disabled ? 0 : 1, borderBottomColor: '#d3d3d3' },
                    searchBtnStyle
                ]}
                ref={containerRef}
                disabled={disabled}
            >
                <View style={styles.flexRowAlignCenter}>
                    {searchIcon && (
                        <Image
                            source={require('../../../../../../assets/image/icon-search.png')}
                            style={styles.searchIconStyle}
                        />
                    )}
                    <CText
                        style={[
                            styles.valueTextContainer,
                            {
                                color: _.isEmpty(value) ? placeholderColor ?? '#778899' : textColor ?? '#000000'
                            }
                        ]}
                        numberOfLines={1}
                    >
                        {_.isEmpty(value) ? placeholder : value}
                    </CText>
                </View>

                <View style={[styles.flexRowAlignCenter]}>
                    {onClear && !_.isEmpty(value) && (
                        <TouchableOpacity
                            onPress={() => {
                                setTempValue('')
                                setValue('')
                                onClear()
                            }}
                        >
                            <Image style={styles.clearIconStyle} source={ImageSrc.IMG_CLEAR} />
                        </TouchableOpacity>
                    )}
                    {rightTriangle && (
                        <Image
                            source={ImageSrc.IMG_TRIANGLE}
                            style={[styles.imgTriangle, noMarginRight && { marginRight: 0 }]}
                        />
                    )}
                </View>
            </TouchableOpacity>
            <Modal
                animationType="fade"
                onRequestClose={() => {
                    setShowPickList(!showPickList)
                }}
                transparent
                visible={showPickList}
                onShow={() => {
                    inputRef.current?.focus()
                }}
            >
                <TouchableOpacity
                    style={styles.modalBackgroundStyle}
                    onPress={() => {
                        setShowPickList(!showPickList)
                    }}
                >
                    <Input
                        containerStyle={[
                            styles.inputComponentContainerStyle,
                            {
                                top: measure?.pageY,
                                left: measure?.pageX,
                                width: measure?.width
                            }
                        ]}
                        inputStyle={styles.inputStyle}
                        allowFontScaling={false}
                        inputContainerStyle={styles.inputContainerStyle}
                        errorStyle={styles.inputErrorStyle}
                        value={tempValue}
                        onChangeText={(v) => {
                            setTempValue(v)
                        }}
                        ref={inputRef}
                        autoCapitalize={'none'}
                        leftIcon={
                            searchIcon && (
                                <Image
                                    source={require('../../../../../../assets/image/icon-search.png')}
                                    style={styles.inputSearchIconStyle}
                                />
                            )
                        }
                    />
                    <View
                        style={[
                            styles.flatListContainerStyle,
                            {
                                top: calculateUpOrDown(),
                                left: measure?.pageX,
                                width: measure?.width
                            }
                        ]}
                        onLayout={(event) => {
                            setPicklistLayout(event.nativeEvent.layout)
                        }}
                    >
                        <FlatList
                            data={filterData}
                            keyExtractor={(item, index) => String(index)}
                            renderItem={({ item, index, separators }) =>
                                props.renderItem ? props.renderItem({ item, index, separators }) : renderItem({ item })
                            }
                            style={styles.flatListStyle}
                            ItemSeparatorComponent={separatorComponent}
                            ListEmptyComponent={emptyComponent}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default SearchablePicklist
