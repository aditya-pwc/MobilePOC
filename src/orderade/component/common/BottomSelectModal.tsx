import { View, StyleSheet, ScrollView, TouchableWithoutFeedback, Image } from 'react-native'
import CText from '../../../common/components/CText'
import React, { useImperativeHandle, useRef } from 'react'
import FormBottomButton from '../../../common/components/FormBottomButton'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { Modalize } from 'react-native-modalize'
import { t } from '../../../common/i18n/t'
import { CheckBox } from 'react-native-elements'
import { ImageSrc } from '../../../common/enums/ImageSrc'
const styles = StyleSheet.create({
    selectMissionModalBody: {
        backgroundColor: baseStyle.color.white
    },
    childrenTitleView: {
        paddingBottom: 20,
        alignItems: 'center'
    },
    childrenTitle: {
        fontSize: 18,
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_900,
        fontFamily: 'Gotham'
    },
    scrollView: {
        maxHeight: 350
    },
    childrenBodyView: {
        paddingHorizontal: 22,
        paddingBottom: 33
    },
    radioLabel: {
        fontFamily: 'Gotham',
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: baseStyle.fontSize.fs_14,
        color: baseStyle.color.black
    },
    checkedIcon: {
        width: 22,
        height: 22
    },
    uncheckCircleView: {
        width: 22,
        height: 22,
        backgroundColor: baseStyle.color.white,
        borderColor: baseStyle.color.liteGrey,
        borderRadius: 11,
        borderWidth: 1
    },
    radioContainer: {
        paddingVertical: 19,
        backgroundColor: baseStyle.color.white,
        borderWidth: 0,
        padding: 0,
        borderBottomColor: baseStyle.color.liteGrey,
        borderBottomWidth: 1
    },
    containerStyle: {
        height: 400,
        flexDirection: 'column'
    },
    headerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30,
        borderBottomWidth: 1,
        paddingBottom: 20,
        marginLeft: 25,
        marginRight: 25,
        borderColor: '#D3D3D3',
        paddingTop: 5
    },
    headerTextStyle: {
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'uppercase'
    },
    buttonLocation: {
        bottom: 0,
        position: 'absolute',
        width: '100%',
        height: 60
    },
    handleStyle: {
        height: 4,
        width: 41,
        backgroundColor: '#D3D3D3',
        marginTop: 25
    }
})
interface BottomSelectModalParams {
    title: string
    types: any
    selected: any
    setSelected: any
    handlePressConfirm: Function
    rightButtonLabel: any
    leftButtonLabel: any
    cRef: any
}
const unCheckCircle = () => {
    return <View style={styles.uncheckCircleView} />
}

export const returnModalProps = (
    selected: string,
    setSelected: Function,
    navigation: any,
    store: any,
    returnRef: any
) => {
    return {
        title: t.labels.PBNA_MOBILE_SELECT_THE_RETURN_TYPE,
        types: [
            {
                Id: t.labels.PBNA_MOBILE_RETURN_ONLY_ORDER,
                Name: t.labels.PBNA_MOBILE_RETURN_ONLY_ORDER
            },
            {
                Id: t.labels.PBNA_MOBILE_ADD_RETURN_TO_ONGOING_ORDER,
                Name: t.labels.PBNA_MOBILE_ADD_RETURN_TO_ONGOING_ORDER
            }
        ],
        selected: selected,
        setSelected: setSelected,
        handlePressConfirm: () => {
            navigation.navigate('RequestReturnScreen', {
                visit: store || '',
                selected
            })
        },
        rightButtonLabel: t.labels.PBNA_MOBILE_CONFIRM.toLocaleUpperCase(),
        leftButtonLabel: t.labels.PBNA_MOBILE_CANCEL.toLocaleUpperCase(),
        cRef: returnRef
    }
}
const BottomSelectModal = (props: BottomSelectModalParams) => {
    const { title, types, selected, setSelected, handlePressConfirm, rightButtonLabel, leftButtonLabel, cRef } = props
    const modalizeRef = useRef<Modalize>(null)
    const handlePressCancel = () => {
        modalizeRef.current?.close()
    }
    useImperativeHandle(cRef, () => ({
        openModal: () => {
            modalizeRef.current?.open()
        },
        closeModal: () => {
            modalizeRef.current?.close()
        }
    }))
    return (
        <Modalize
            ref={modalizeRef}
            adjustToContentHeight
            handleStyle={styles.handleStyle}
            onClose={() => {
                setSelected('')
            }}
        >
            <View style={styles.containerStyle}>
                <View style={styles.headerStyle}>
                    <CText style={styles.headerTextStyle}>{t.labels.PBNA_MOBILE_RETURNS.toLocaleUpperCase()}</CText>
                </View>
                <View style={styles.childrenTitleView}>
                    <CText style={[styles.childrenTitle]}>{title}</CText>
                </View>
                <ScrollView directionalLockEnabled style={styles.scrollView}>
                    <TouchableWithoutFeedback>
                        <View style={styles.childrenBodyView}>
                            <View>
                                {types.map((item) => (
                                    <>
                                        <CheckBox
                                            title={item.Name || ''}
                                            onPress={() => {
                                                setSelected(item.Id)
                                            }}
                                            checked={item.Id === selected}
                                            checkedIcon={
                                                <Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />
                                            }
                                            uncheckedIcon={unCheckCircle()}
                                            containerStyle={[styles.radioContainer]}
                                            textStyle={styles.radioLabel}
                                        />
                                    </>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
                <View>
                    <FormBottomButton
                        onPressCancel={handlePressCancel}
                        onPressSave={() => {
                            handlePressCancel()
                            handlePressConfirm()
                        }}
                        disableSave={!selected}
                        rightButtonLabel={rightButtonLabel}
                        leftButtonLabel={leftButtonLabel}
                    />
                </View>
            </View>
        </Modalize>
    )
}
export default BottomSelectModal
