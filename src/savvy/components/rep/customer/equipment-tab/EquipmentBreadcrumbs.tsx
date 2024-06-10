/**
 * @description Equipment breadcrumbs for Step 2.
 * @author  Jack Niu
 * @date 2021-12-31
 */
import React, { FC } from 'react'
import { StyleSheet, View, Image, TouchableOpacity, Alert } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { t } from '../../../../../common/i18n/t'
import { isNullSpace } from '../../../manager/helper/MerchManagerHelper'
import _ from 'lodash'

interface EquipmentBreadcrumbsProps {
    activePart: number
    selectedType: string
    selectedSubType: string
    selectedBranding: string
    setActivePart: (activePart: number) => void
    handleReselectEquipment: Function
    exchangeMode: boolean
    readonly?: boolean
    equipment?: any
    handleBackToEquipmentDetails?: () => void
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 22,
        marginRight: 22
    },
    equipmentHeader: {
        marginTop: 40,
        marginBottom: 30
    },
    equipmentHeaderText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000'
    },
    breadcrumbsView: {
        minHeight: 30
    },
    breadcrumbsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    breadcrumbView: {
        marginRight: 6,
        flexDirection: 'row',
        alignItems: 'center'
    },
    breadcrumbText: {
        color: '#00A2D9',
        fontWeight: '700',
        lineHeight: 20,
        fontSize: 12,
        fontFamily: 'Gotham-Bold'
    },
    imgChevron: {
        width: 16,
        height: 16,
        marginLeft: 6
    },
    backContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgBack: {
        width: 12,
        height: 20,
        marginRight: 20
    }
})
const EquipmentBreadcrumbs: FC<EquipmentBreadcrumbsProps> = (props: EquipmentBreadcrumbsProps) => {
    const {
        activePart,
        selectedType,
        selectedSubType,
        selectedBranding,
        setActivePart,
        handleReselectEquipment,
        exchangeMode,
        readonly = false,
        equipment,
        handleBackToEquipmentDetails
    } = props
    const IMG_CHEVRON = ImageSrc.IMG_CHEVRON
    const IMG_BACK = ImageSrc.IMG_BACK
    const goToType = () => {
        if (!exchangeMode) {
            Alert.alert(isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING), t.labels.PBNA_MOBILE_RESTART_EQUIPMENT_MSG, [
                {
                    text: t.labels.PBNA_MOBILE_CANCEL,
                    style: 'cancel'
                },
                {
                    text: t.labels.PBNA_MOBILE_YES,
                    onPress: async () => {
                        setActivePart(1)
                        handleReselectEquipment()
                    }
                }
            ])
        }
    }
    const goToSubType = () => {
        Alert.alert(isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING), t.labels.PBNA_MOBILE_RESTART_EQUIPMENT_MSG, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                style: 'cancel'
            },
            {
                text: t.labels.PBNA_MOBILE_YES,
                onPress: async () => {
                    setActivePart(2)
                    handleReselectEquipment()
                }
            }
        ])
    }
    const goToBranding = () => {
        Alert.alert(isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING), t.labels.PBNA_MOBILE_RESTART_EQUIPMENT_MSG, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                style: 'cancel'
            },
            {
                text: t.labels.PBNA_MOBILE_YES,
                onPress: async () => {
                    setActivePart(3)
                    handleReselectEquipment()
                }
            }
        ])
    }
    return (
        <View style={styles.container}>
            <View style={styles.equipmentHeader}>
                {activePart === 1 && (
                    <CText style={styles.equipmentHeaderText}>{t.labels.PBNA_MOBILE_SELECT_EQUIPMENT_TYPE}</CText>
                )}
                {activePart === 2 && (
                    <CText style={styles.equipmentHeaderText}>{t.labels.PBNA_MOBILE_SELECT_EQUIPMENT_SUB_TYPE}</CText>
                )}
                {activePart === 3 && (
                    <CText style={styles.equipmentHeaderText}>{t.labels.PBNA_MOBILE_SELECT_EQUIPMENT_BRANDING}</CText>
                )}
                {activePart === 4 && (
                    <TouchableOpacity
                        style={styles.backContainer}
                        hitSlop={commonStyle.hitSlop}
                        onPress={() => {
                            if (readonly) {
                                setActivePart(3)
                            } else {
                                Alert.alert(
                                    isNullSpace(t.labels.PBNA_MOBILE_EMPTY_STRING),
                                    t.labels.PBNA_MOBILE_RESTART_EQUIPMENT_MSG,
                                    [
                                        {
                                            text: t.labels.PBNA_MOBILE_CANCEL,
                                            style: 'cancel'
                                        },
                                        {
                                            text: t.labels.PBNA_MOBILE_YES,
                                            onPress: async () => {
                                                setActivePart(3)
                                                handleReselectEquipment()
                                            }
                                        }
                                    ]
                                )
                            }
                        }}
                        disabled={exchangeMode && readonly}
                    >
                        {!(exchangeMode && readonly) && <Image source={IMG_BACK} style={styles.imgBack} />}
                        <CText style={styles.equipmentHeaderText}>{t.labels.PBNA_MOBILE_SELECT_ADD_ONS}</CText>
                    </TouchableOpacity>
                )}
                {activePart === 5 && (
                    <TouchableOpacity
                        style={styles.backContainer}
                        hitSlop={commonStyle.hitSlop}
                        onPress={() => {
                            setActivePart(equipment?.FSV_Line_Item__c ? 6 : 4)
                        }}
                    >
                        <Image source={IMG_BACK} style={styles.imgBack} />
                        <CText style={styles.equipmentHeaderText}>
                            {t.labels.PBNA_MOBILE_SELECT_EQUIPMENT_DETAILS}
                        </CText>
                    </TouchableOpacity>
                )}
                {activePart === 6 && (
                    <TouchableOpacity
                        style={styles.backContainer}
                        hitSlop={commonStyle.hitSlop}
                        onPress={() => {
                            setActivePart(4)
                            if (handleBackToEquipmentDetails) {
                                handleBackToEquipmentDetails()
                            }
                        }}
                        disabled={exchangeMode && readonly}
                    >
                        {!(exchangeMode && readonly) && <Image source={IMG_BACK} style={styles.imgBack} />}
                        <CText style={styles.equipmentHeaderText}>{t.labels.PBNA_MOBILE_SET_UP_COMMISSION}</CText>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.breadcrumbsContainer}>
                {activePart > 1 && (
                    <View style={styles.breadcrumbView}>
                        <TouchableOpacity
                            disabled={readonly}
                            onPress={() => {
                                goToType()
                            }}
                        >
                            <CText style={styles.breadcrumbText}>{_.upperCase(selectedType)}</CText>
                        </TouchableOpacity>
                        <View>
                            <Image source={IMG_CHEVRON} style={styles.imgChevron} />
                        </View>
                    </View>
                )}
                {activePart > 2 && (
                    <View style={styles.breadcrumbView}>
                        <TouchableOpacity
                            disabled={readonly}
                            onPress={() => {
                                goToSubType()
                            }}
                        >
                            <CText style={styles.breadcrumbText}>{_.upperCase(selectedSubType)}</CText>
                        </TouchableOpacity>
                        <View>
                            <Image source={IMG_CHEVRON} style={styles.imgChevron} />
                        </View>
                    </View>
                )}
                {activePart > 3 && (
                    <View style={styles.breadcrumbView}>
                        <TouchableOpacity
                            disabled={readonly}
                            onPress={() => {
                                goToBranding()
                            }}
                        >
                            <CText style={styles.breadcrumbText}>{_.upperCase(selectedBranding)}</CText>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    )
}
export default EquipmentBreadcrumbs
