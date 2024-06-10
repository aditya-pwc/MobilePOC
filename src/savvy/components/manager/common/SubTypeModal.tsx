import React from 'react'
import { View, Modal, TouchableOpacity } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { t } from '../../../../common/i18n/t'
import AddRecurringVisitStyle from '../../../styles/manager/AddRecurringVisitStyle'
import CCheckBox from '../../../../common/components/CCheckBox'
import CText from '../../../../common/components/CText'
import InfoSvg from '../../../../../assets/image/tips-black.svg'

const styles = AddRecurringVisitStyle

interface SubTypeInterface {
    typeModalVisible?: boolean
    setTypeModalVisible?: any
    subTypeArray?: Array<any>
    onCheckClick?: (index?: any) => void
    onCancelSubType?: () => void
    updateVisitSubType?: () => void
    customTitle?: string
    customSubTitle?: string
    doneTitle?: string
    cancelTitle?: string
    customSubTitleStyle?: object
    showInfoSvg?: boolean
}

const SubTypeModal = (props: SubTypeInterface) => {
    const {
        typeModalVisible,
        setTypeModalVisible,
        subTypeArray,
        onCheckClick,
        onCancelSubType,
        updateVisitSubType,
        customTitle,
        customSubTitle,
        doneTitle,
        cancelTitle,
        customSubTitleStyle,
        showInfoSvg
    } = props
    return (
        <Modal
            animationType="fade"
            transparent
            visible={typeModalVisible}
            onRequestClose={() => {
                setTypeModalVisible(!typeModalVisible)
            }}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, styles.modalViewSubType]}>
                    <View style={[styles.modalHeader, styles.modalHeaderSubType]}>
                        <CText style={styles.textBold}>{customTitle || t.labels.PBNA_MOBILE_VISIT_SUBTYPE}</CText>
                    </View>

                    {customSubTitle && (
                        <View style={styles.customSubTitleBox}>
                            <View style={{ marginRight: 10 }}>
                                {showInfoSvg && <InfoSvg style={styles.InfoSvgStyle} />}
                            </View>
                            <CText style={[styles.customSubTitle, customSubTitleStyle]}>{customSubTitle}</CText>
                        </View>
                    )}
                    <ScrollView style={styles.territoryModal}>
                        {subTypeArray?.map((item, index) => {
                            return (
                                // used so at so many places, not sure items all have id
                                // so use entire item as key
                                <View key={JSON.stringify(item)}>
                                    <View style={styles.subTypeItem}>
                                        <CCheckBox
                                            onPress={() => {
                                                onCheckClick && onCheckClick(index)
                                            }}
                                            checked={subTypeArray[index].select}
                                        />
                                        <TouchableOpacity
                                            style={styles.content}
                                            onPress={() => {
                                                onCheckClick && onCheckClick(index)
                                            }}
                                        >
                                            <CText style={styles.nameText}>{item.name}</CText>
                                        </TouchableOpacity>
                                    </View>
                                    {item.desc && (
                                        <View style={[styles.subtypeDesc]}>
                                            <CText style={styles.descText}>{item.desc}</CText>
                                        </View>
                                    )}
                                </View>
                            )
                        })}
                    </ScrollView>
                    <View style={styles.modalBtn}>
                        <TouchableOpacity style={styles.buttonReset} onPress={() => onCancelSubType()}>
                            <View>
                                <CText style={styles.resetText}>
                                    {cancelTitle || t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}
                                </CText>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonApply}
                            onPress={() => {
                                updateVisitSubType()
                            }}
                        >
                            <View>
                                <CText style={styles.applyText}>{doneTitle || t.labels.PBNA_MOBILE_SAVE}</CText>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default SubTypeModal
