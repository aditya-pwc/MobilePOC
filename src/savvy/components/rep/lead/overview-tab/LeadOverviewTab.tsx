/**
 * @description Component to show lead overview.
 * @author Shangmin Dou
 * @date 2021-05-010
 */
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Alert, TouchableOpacity, View, StyleSheet } from 'react-native'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import HighlightPanel from './HighlightPanel'
import CollapseContainer from '../../../common/CollapseContainer'
import LeadDetails from './LeadDetails'
import WebSocialMedia from './WebSocialMedia'
import CustomerAttributes from './CustomerAttributes'
import PepsiCoData from './PepsiCoData'
import { LeadDetailSection } from '../../../../enums/Lead'
import { useSelector } from 'react-redux'
import CText from '../../../../../common/components/CText'
import ChevronBlue from '../../../../../../assets/image/ios-chevron-blue.svg'
import { t } from '../../../../../common/i18n/t'
import store from '../../../../redux/store/Store'
import { changeWebSocialMediaEditModalAction } from '../../../../redux/action/LeadActionType'
import _ from 'lodash'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import ProspectNotes from '../offer-tab/ProspectNotes'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface LeadOverviewTabProps extends LeadDetailBaseProps {
    onClickCofRejectedViewMore: () => void
}
const styles = StyleSheet.create({
    selectAllCont: {
        flexDirection: 'row-reverse',
        paddingHorizontal: '5%',
        marginVertical: 10
    },
    showAllText: {
        color: '#0098D4',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 10,
        fontFamily: 'Gotham-Bold'
    },
    emptyView: {
        height: 110,
        width: '100%'
    }
})
const negotiateLeadEditReducer = (store) => store.leadReducer.negotiateLeadEditReducer

const LeadOverviewTab = (props: LeadOverviewTabProps) => {
    const { l, cRef, saveTimes, onClickCofRejectedViewMore } = props
    const negotiateLead = useSelector(negotiateLeadEditReducer)
    const [showLeadDetails, setShowLeadDetails] = useState(false)
    const [showMedia, setShowMedia] = useState(false)
    const [showProspectNotes, setShowProspectNotes] = useState(false)
    const [showCustomerAttributes, setShowCustomerAttributes] = useState(false)
    const [showPepsiCoData, setShowPepsiCoData] = useState(false)
    const [showAll, setShowAll] = useState(false)
    const leadDetailsSectionRef = useRef(null)
    const webSocialMediaSectionRef = useRef(null)
    const customerAttributesSectionRef = useRef(null)
    const pepsiCoDataSectionRef = useRef(null)
    const prospectNotesSectionRef = useRef(null)

    const resetAllData = () => {
        leadDetailsSectionRef?.current?.resetData()
        // webSocialMediaSectionRef.current.resetData()
        customerAttributesSectionRef?.current?.resetData()
        pepsiCoDataSectionRef?.current?.resetData()
    }
    useImperativeHandle(cRef, () => ({
        resetAllData: () => {
            resetAllData()
        }
    }))

    const setAllTab = () => {
        setShowLeadDetails(!showAll)
        setShowMedia(!showAll)
        setShowCustomerAttributes(!showAll)
        setShowPepsiCoData(!showAll)
        setShowProspectNotes(!showAll)
        setShowAll(!showAll)
    }

    useEffect(() => {
        setShowAll(showLeadDetails || showMedia || showCustomerAttributes || showPepsiCoData || showProspectNotes)
    }, [showLeadDetails, showMedia, showCustomerAttributes, showPepsiCoData, showProspectNotes])

    const resetData = (section) => {
        Alert.alert(_.capitalize(t.labels.PBNA_MOBILE_RESET), t.labels.PBNA_MOBILE_RESET_FORM_MSG, [
            {
                text: t.labels.PBNA_MOBILE_CANCEL,
                style: 'default'
            },
            {
                text: _.capitalize(t.labels.PBNA_MOBILE_RESET),
                style: 'default',
                onPress: () => {
                    switch (section) {
                        case LeadDetailSection.LEAD_DETAILS:
                            leadDetailsSectionRef.current.resetData()
                            break
                        case LeadDetailSection.WEB_SOCIAL_MEDIA:
                            webSocialMediaSectionRef.current.resetData()
                            break
                        case LeadDetailSection.CUSTOMER_ATTRIBUTES:
                            customerAttributesSectionRef.current.resetData()
                            break
                        case LeadDetailSection.PEPSICO_DATA:
                            pepsiCoDataSectionRef.current.resetData()
                            break
                        case LeadDetailSection.PROSPECT_NOTES:
                            prospectNotesSectionRef.current?.resetData()
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
            <HighlightPanel l={l} saveTimes={saveTimes} onClickCofRejectedViewMore={onClickCofRejectedViewMore} />
            <View style={styles.selectAllCont}>
                <TouchableOpacity
                    style={commonStyle.flexRowCenter}
                    onPress={() => {
                        setAllTab()
                    }}
                >
                    <CText style={styles.showAllText}>
                        {showAll ? t.labels.PBNA_MOBILE_COLLAPSE_ALL : t.labels.PBNA_MOBILE_EXPAND_ALL}
                    </CText>
                    <ChevronBlue
                        width={19}
                        height={20}
                        style={{
                            transform: [{ rotate: showAll ? '0deg' : '180deg' }]
                        }}
                    />
                </TouchableOpacity>
            </View>
            <CollapseContainer
                showContent={showLeadDetails}
                setShowContent={setShowLeadDetails}
                title={t.labels.PBNA_MOBILE_LEAD_DETAILS}
                reset={() => {
                    resetData(LeadDetailSection.LEAD_DETAILS)
                }}
                showReset={negotiateLead.leadDetailsEditCount > 0}
            >
                <LeadDetails l={l} cRef={leadDetailsSectionRef} />
            </CollapseContainer>
            <CollapseContainer
                showContent={showProspectNotes}
                setShowContent={setShowProspectNotes}
                title={t.labels.PBNA_MOBILE_PROSPECT_Q_LEAD_NOTES}
                reset={() => {
                    resetData(LeadDetailSection.PROSPECT_NOTES)
                }}
                showReset={negotiateLead.prospectNotesEditCount > 0}
            >
                <ProspectNotes l={l} cRef={prospectNotesSectionRef} />
            </CollapseContainer>
            <CollapseContainer
                showContent={showMedia}
                setShowContent={setShowMedia}
                showEdit={l.Status__c === 'Negotiate' && l.COF_Triggered_c__c !== '1' && !isPersonaCRMBusinessAdmin()}
                title={t.labels.PBNA_MOBILE_WEB_SOCIAL_MEDIA}
                reset={() => {
                    resetData(LeadDetailSection.WEB_SOCIAL_MEDIA)
                }}
                showReset={negotiateLead.webSocialMediaEditCount > 0}
                onPressEdit={() => {
                    store.dispatch(changeWebSocialMediaEditModalAction())
                }}
            >
                <WebSocialMedia l={l} cRef={webSocialMediaSectionRef} />
            </CollapseContainer>
            <CollapseContainer
                showContent={showCustomerAttributes}
                setShowContent={setShowCustomerAttributes}
                title={t.labels.PBNA_MOBILE_LEAD_ATTRIBUTES}
                reset={() => {
                    resetData(LeadDetailSection.CUSTOMER_ATTRIBUTES)
                }}
                showReset={negotiateLead.customerAttributesEditCount > 0}
            >
                <CustomerAttributes l={l} cRef={customerAttributesSectionRef} />
            </CollapseContainer>
            <CollapseContainer
                showContent={showPepsiCoData}
                setShowContent={setShowPepsiCoData}
                title={t.labels.PBNA_MOBILE_PEPSICO_DATA}
                reset={() => {
                    resetData(LeadDetailSection.PEPSICO_DATA)
                }}
                showReset={negotiateLead.pepsiCoDataEditCount > 0}
            >
                <PepsiCoData l={l} cRef={pepsiCoDataSectionRef} />
            </CollapseContainer>

            <View style={styles.emptyView} />
        </View>
    )
}

export default LeadOverviewTab
