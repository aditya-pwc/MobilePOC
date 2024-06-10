/**
 * @description Component to show lead offer elements.
 * @author Shangmin Dou
 * @date 2021-05-010
 */
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Alert, TouchableOpacity, View, StyleSheet } from 'react-native'
import CollapseContainer from '../../../common/CollapseContainer'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import OfferDetails from './OfferDetails'
import EquipmentNeeds from './EquipmentNeeds'
import DeliveryExecution from './DeliveryExecution'
import { LeadDetailSection } from '../../../../enums/Lead'
import { useSelector } from 'react-redux'
import CText from '../../../../../common/components/CText'
import ChevronBlue from '../../../../../../assets/image/ios-chevron-blue.svg'
import { t } from '../../../../../common/i18n/t'
import _ from 'lodash'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    accordionContainer: {
        flexDirection: 'row-reverse',
        paddingHorizontal: '5%',
        paddingVertical: 10
    },
    opeTextStyle: {
        color: '#0098D4',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 10
    },
    rotate_0: {
        transform: [{ rotate: '0deg' }]
    },
    rotate_180: {
        transform: [{ rotate: '180deg' }]
    },
    blankView: {
        height: 110,
        width: '100%'
    }
})

interface LeadOfferElementsTabProps extends LeadDetailBaseProps {
    onSaveDistributionPoint: any
}

const negotiateLeadEditReducer = (store) => store.leadReducer.negotiateLeadEditReducer

const LeadOfferElementsTab = (props: LeadOfferElementsTabProps) => {
    const negotiateLead = useSelector(negotiateLeadEditReducer)
    const [showEquipmentNeeds, setShowEquipmentNeeds] = useState(false)
    const [showOfferDetails, setShowOfferDetails] = useState(false)
    const [showDeliveryAndExecution, setShowDeliveryAndExecution] = useState(false)
    const [showAll, setShowAll] = useState(false)
    const { l, cRef, onSaveDistributionPoint, saveTimes } = props

    const offerDetailsSectionRef = useRef(null)
    const equipmentNeedsSectionRef = useRef(null)
    const deliveryExecutionSectionRef = useRef(null)

    const resetAllData = () => {
        deliveryExecutionSectionRef?.current?.resetData()
    }

    useImperativeHandle(cRef, () => ({
        resetAllData
    }))

    const setAllTab = () => {
        setShowEquipmentNeeds(!showAll)
        setShowOfferDetails(!showAll)
        setShowDeliveryAndExecution(!showAll)
        setShowAll(!showAll)
    }

    useEffect(() => {
        setShowAll(showEquipmentNeeds || showOfferDetails || showDeliveryAndExecution)
    }, [showEquipmentNeeds, showOfferDetails, showDeliveryAndExecution])

    const resetData = (section) => {
        Alert.alert(t.labels.PBNA_MOBILE_RESET, t.labels.PBNA_MOBILE_RESET_FORM_BACK_TO_DEFAULT_MSG, [
            {
                text: _.capitalize(t.labels.PBNA_MOBILE_CANCEL),
                style: 'default'
            },
            {
                text: _.capitalize(t.labels.PBNA_MOBILE_RESET),
                style: 'default',
                onPress: () => {
                    switch (section) {
                        case LeadDetailSection.OFFER_DETAILS:
                            offerDetailsSectionRef.current?.resetData()
                            break
                        case LeadDetailSection.EQUIPMENT_NEEDS:
                            equipmentNeedsSectionRef.current?.resetData()
                            break
                        case LeadDetailSection.DELIVERY_EXECUTION:
                            deliveryExecutionSectionRef.current?.resetData()
                            break
                        default:
                            break
                    }
                }
            }
        ])
    }
    return (
        <View>
            <View style={styles.accordionContainer}>
                <TouchableOpacity
                    style={commonStyle.flexRowCenter}
                    onPress={() => {
                        setAllTab()
                    }}
                >
                    <CText style={styles.opeTextStyle}>
                        {showAll ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
                    </CText>
                    <ChevronBlue width={19} height={20} style={showAll ? styles.rotate_0 : styles.rotate_180} />
                </TouchableOpacity>
            </View>
            <CollapseContainer
                showContent={showOfferDetails}
                setShowContent={setShowOfferDetails}
                title={t.labels.PBNA_MOBILE_OFFER_DETAILS}
                reset={() => {
                    resetData(LeadDetailSection.OFFER_DETAILS)
                }}
                showReset={negotiateLead.offerDetailsEditCount > 0}
            >
                <OfferDetails l={l} cRef={offerDetailsSectionRef} />
            </CollapseContainer>
            <CollapseContainer
                showContent={showEquipmentNeeds}
                setShowContent={setShowEquipmentNeeds}
                title={t.labels.PBNA_MOBILE_EQUIPMENT_NEEDS}
                reset={() => {
                    resetData(LeadDetailSection.EQUIPMENT_NEEDS)
                }}
                showReset={negotiateLead.equipmentNeedsEditCount > 0}
            >
                <EquipmentNeeds l={l} cRef={equipmentNeedsSectionRef} />
            </CollapseContainer>
            <CollapseContainer
                showContent={showDeliveryAndExecution}
                setShowContent={setShowDeliveryAndExecution}
                title={t.labels.PBNA_MOBILE_DELIVERY_EXECUTION}
                reset={() => {
                    resetData(LeadDetailSection.DELIVERY_EXECUTION)
                }}
                showReset={negotiateLead.deliveryExecutionEditCount > 0}
            >
                <DeliveryExecution
                    l={l}
                    cRef={deliveryExecutionSectionRef}
                    onSaveDistributionPoint={() => {
                        onSaveDistributionPoint()
                    }}
                    saveTimes={saveTimes}
                />
            </CollapseContainer>
            <View style={styles.blankView} />
        </View>
    )
}

export default LeadOfferElementsTab
