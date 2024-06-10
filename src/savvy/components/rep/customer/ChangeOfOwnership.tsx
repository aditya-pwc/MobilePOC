/**
 * @description Component for the user to log a call.
 * @author Shangmin Dou
 * @date 2021-04-21
 */
import _ from 'lodash'
import moment from 'moment'
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Alert, Modal, SafeAreaView, StyleSheet, View } from 'react-native'
import { CommonParam } from '../../../../common/CommonParam'
import { Persona } from '../../../../common/enums/Persona'
import { t } from '../../../../common/i18n/t'
import { syncUpObjCreateFromMem, syncUpObjUpdateFromMem } from '../../../api/SyncUtils'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import {
    deleteContactOnLeadAndUpdateAsPrimaryContact,
    deleteLead,
    useInitLeadForm,
    leadSyncUpFields,
    useCopyDistributionPointsFromCustomer,
    OverviewLeadProps,
    fetchLeadAndContact
} from '../../../utils/ChangeOfOwnershipUtils'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import GlobalModal from '../../../../common/components/GlobalModal'
import HeaderOfModal from '../lead/common/HeaderOfModal'
import StepView from '../lead/common/StepView'
import ContactInfo from './change-ownership/ContactInfo'
import { useDropDown } from '../../../../common/contexts/DropdownContext'
import { filterExistFields } from '../../../utils/SyncUtils'
import Distribution from './change-ownership/Distribution'
import NewLeadOnChangeOfOwnership from './change-ownership/NewLeadOnChangeOfOwnership'
import { useBusinessSegmentPicklist } from '../../../hooks/LeadHooks'
import CText from '../../../../common/components/CText'
import { TIME_FORMAT } from '../../../../common/enums/TimeFormat'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface ChangeOfOwnershipProps {
    cRef: any
    customer: any
    onSave: any
    readOnly?: boolean
}
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white,
        marginBottom: 100
    },
    generalView: {
        marginTop: 30,
        marginBottom: 44,
        paddingHorizontal: '2.25%'
    },
    halfLayout: {
        width: '50%'
    },
    readonlyContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: '2.25%',
        marginTop: -20
    },
    subTitleStyle: {
        fontSize: 18,
        fontWeight: '900'
    }
})

export const subTitle = (title) => {
    return (
        <View style={[styles.generalView]}>
            <CText style={styles.subTitleStyle}>{title} </CText>
        </View>
    )
}

const ChangeOfOwnership: FC<ChangeOfOwnershipProps> = (props: ChangeOfOwnershipProps) => {
    const { cRef, onSave, customer, readOnly } = props
    const [showChangeOfOwnership, setShowChangeOfOwnership] = useState(false)
    const [activeStep, setActiveStep] = useState(0)
    const [disableNextBtn, setDisableNextBtn] = useState(true)
    const [contactList, setContactList] = useState([])
    const [allInformationHasBeenFilled, setAllInformationHasBeenFilled] = useState(false)
    const [externalId, setExternalId] = useState(null)
    const [contact, setContact] = useState(null)
    const { dropDownRef } = useDropDown()
    const [objLead, setObjLead] = useState<OverviewLeadProps>({} as OverviewLeadProps)
    const globalModalRef = useRef(null)
    const leadCreationRef = useRef(null)
    const distributionRef = useRef(null)
    const [copyDPList, setCopyDPList] = useState([])

    const [showDistributionPointModal, setShowDistributionPointModal] = useState(false)
    const { segmentOption } = useBusinessSegmentPicklist()
    const stepMap = {
        0: t.labels.PBNA_MOBILE_OVERVIEW,
        1: t.labels.PBNA_MOBILE_CHANGE_CONTACT_INFO,
        2: t.labels.PBNA_MOBILE_DISTRIBUTION
    }
    const initLead = useInitLeadForm(customer, segmentOption)
    useImperativeHandle(cRef, () => ({
        open: () => {
            setObjLead(initLead)
            setAllInformationHasBeenFilled(false)
            setShowChangeOfOwnership(true)
        },
        openReadOnly: (leadId) => {
            fetchLeadAndContact(leadId, setObjLead, setContact)

            setShowChangeOfOwnership(true)
        }
    }))

    useEffect(() => {
        setObjLead(initLead)
    }, [initLead])

    useCopyDistributionPointsFromCustomer(customer.AccountId, objLead, readOnly, setCopyDPList)

    const renderFormBottomButtonLabel = () => {
        if (activeStep === 2) {
            return t.labels.PBNA_MOBILE_SUBMIT.toUpperCase()
        }
        return t.labels.PBNA_MOBILE_NEXT.toUpperCase()
    }

    const findCDV = (segmentOption, optName) => {
        return (
            _.findKey(segmentOption, (v) => {
                return v === optName
            }) || ''
        )
    }

    /**
     * @description sync new lead to org
     */

    const syncNewLead = async (goStep?) => {
        globalModalRef?.current?.closeModal()
        globalModalRef?.current?.openModal()

        const leadObj = _.cloneDeep(objLead)
        if (CommonParam.PERSONA__c === Persona.PSR || CommonParam.PERSONA__c === Persona.FSR) {
            leadObj.Source_ID_c__c = '002'
        } else {
            leadObj.Source_ID_c__c = '003'
        }
        leadObj.BUSN_SGMNTTN_LVL_1_CDV_c__c = findCDV(
            segmentOption?.SUB_SEGMENT_CODE,
            objLead?.BUSN_SGMNTTN_LVL_1_NM_c__c
        )
        leadObj.BUSN_SGMNTTN_LVL_2_CDV_c__c = findCDV(segmentOption?.SEGMENT_CODE, leadObj?.BUSN_SGMNTTN_LVL_2_NM_c__c)
        leadObj.BUSN_SGMNTTN_LVL_3_CDV_c__c = findCDV(segmentOption?.CHANNEL_CODE, leadObj?.BUSN_SGMNTTN_LVL_3_NM_c__c)
        leadObj.Phone__c = leadObj?.Phone__c?.replace(/[^\d.]/g, '')
        leadObj.Moved_to_Negotiate_Time_c__c = new Date().toISOString()
        leadObj.Last_Task_Modified_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
        leadObj.Owner_GPID_c__c = CommonParam.GPID__c
        leadObj.CreatedBy_GPID_c__c = CommonParam.GPID__c
        leadObj.LastModifiedBy_GPID_c__c = CommonParam.GPID__c
        leadObj.Device_Source_c__c = 'Mobile'
        leadObj.Rep_Last_Modified_Date_c__c = new Date().toISOString()
        leadObj.Assigned_Date_c__c = moment().format(TIME_FORMAT.Y_MM_DD)
        delete leadObj.Proposed_Key_Account_Name
        delete leadObj.Proposed_Key_Account_Division_Name
        try {
            if (objLead.Id) {
                await syncUpObjUpdateFromMem('Lead__x', filterExistFields('Lead__x', [objLead], leadSyncUpFields()))
            } else {
                const [data] = await syncUpObjCreateFromMem('Lead__x', [leadObj])
                setExternalId(data.data[0].ExternalId)
                // add  Proposed_Key_Account_Name and  Proposed_Key_Account_Division_Name
                setObjLead({ ...objLead, ...data.data[0] })
            }
            globalModalRef?.current?.closeModal()

            setActiveStep(goStep || 1)
        } catch (e) {
            globalModalRef?.current?.closeModal()
            dropDownRef.current.alertWithType('error', 'Create lead failed', ErrorUtils.error2String(e))
        }
    }

    const updateContact = async () => {
        globalModalRef?.current?.openModal()
        const syncUpUpdateFields = ['Id', 'Title', 'Email', 'Phone', 'Notes__c', 'Primary_Contact__c']
        const contactToUpdate = {
            Id: contact?.Id,
            Title: contact?.Title,
            Email: contact?.Email,
            Phone: contact?.Phone,
            Notes__c: contact?.Notes__c
        }
        try {
            const [data] = await syncUpObjUpdateFromMem(
                'Contact',
                filterExistFields('Contact', [contactToUpdate], syncUpUpdateFields)
            )
            setContact(data.data[0])
            globalModalRef?.current?.closeModal()
            setAllInformationHasBeenFilled(true)

            setActiveStep(2)
        } catch (e) {
            globalModalRef?.current?.closeModal()
            dropDownRef.current.alertWithType('error', 'Update Contact failed', ErrorUtils.error2String(e))
        }
    }

    const handlePressClose = (isSubmit = false) => {
        if (!readOnly) {
            if (objLead?.Id && !isSubmit) {
                deleteLead(objLead)
                deleteContactOnLeadAndUpdateAsPrimaryContact(contactList, false)
                distributionRef?.current?.deleteDPOnLead()
            }
            setContact(null)
            setActiveStep(0)
            setExternalId(null)
            distributionRef?.current?.resetNull()
            setShowChangeOfOwnership(false)
        }
        if (readOnly) {
            setContact(null)
            setActiveStep(0)
            setExternalId(null)
            distributionRef?.current?.resetNull()
            setShowChangeOfOwnership(false)
        }
    }

    const handlePressCancel = () => {
        switch (activeStep) {
            case 0: {
                handlePressClose()
                break
            }
            case 1:
                setActiveStep(0)
                break
            case 2:
                setActiveStep(1)
                break
            default:
                break
        }
    }

    const handlePressSave = async () => {
        if (readOnly) {
            switch (activeStep) {
                case 0:
                    setActiveStep(1)
                    break
                case 1:
                    setActiveStep(2)
                    break
                case 2:
                    break
                default:
                    break
            }
        }
        if (!readOnly) {
            switch (activeStep) {
                case 0:
                    syncNewLead()
                    break

                case 1:
                    updateContact()

                    break
                case 2:
                    distributionRef?.current?.submitForm()
                    break
                default:
                    break
            }
        }
    }

    const onPressStepOne = () => {
        if (readOnly) {
            setActiveStep(0)
        }
        if (!readOnly) {
            if (activeStep === 1 || activeStep === 2) {
                Alert.alert('', t.labels.PBNA_MOBILE_CHANGES_HAVE_NOT_BEEN_SAVED_WOULD_YOU_LIKE_TO_PROCEED, [
                    {
                        text: t.labels.PBNA_MOBILE_CANCEL,
                        style: 'cancel'
                    },
                    {
                        text: t.labels.PBNA_MOBILE_YES,
                        onPress: async () => {
                            setActiveStep(0)
                        }
                    }
                ])
            }
        }
    }

    const onPressStepTwo = () => {
        if (readOnly) {
            setActiveStep(1)
        }
        if (!readOnly) {
            if (activeStep === 0 && !disableNextBtn) {
                handlePressSave()
            }
            if (activeStep === 2) {
                setActiveStep(1)
            }
        }
    }

    const onPressStepThree = () => {
        if (readOnly) {
            setActiveStep(2)
        }
        if (!readOnly) {
            if (activeStep === 0 && !disableNextBtn && allInformationHasBeenFilled) {
                syncNewLead(2)
            }
            if (activeStep === 1 && !disableNextBtn) {
                handlePressSave()
            }
        }
    }

    const onLeadCreated = (lead) => {
        setObjLead(lead)
        setActiveStep(1)
    }

    const renderStepBody = () => {
        switch (activeStep) {
            case 0:
                return (
                    <NewLeadOnChangeOfOwnership
                        readOnly={readOnly}
                        setDisableNextBtn={setDisableNextBtn}
                        onLeadCreated={onLeadCreated}
                        cRef={leadCreationRef}
                        isChangeOwnership
                        objLead={objLead}
                        setObjLead={setObjLead}
                        setActiveStep={setActiveStep}
                    />
                )
            case 1:
                return (
                    <ContactInfo
                        readOnly={readOnly}
                        handleSetContactList={(list) => {
                            setContactList(list)
                        }}
                        setDisableNextBtn={setDisableNextBtn}
                        globalModalRef={globalModalRef}
                        setContact={setContact}
                        contact={contact}
                        l={objLead}
                        externalId={externalId}
                        activeStep={activeStep}
                    />
                )
            case 2:
                return (
                    <Distribution
                        copyDPList={copyDPList}
                        readOnly={readOnly}
                        contact={contact}
                        contactList={contactList}
                        onSave={onSave}
                        handlePressClose={handlePressClose}
                        cRef={distributionRef}
                        setDisableNextBtn={setDisableNextBtn}
                        customer={customer}
                        setShowDistributionPointModal={setShowDistributionPointModal}
                        showDistributionPointModal={showDistributionPointModal}
                        l={objLead}
                        globalModalRef={globalModalRef}
                    />
                )

            default:
                return null
        }
    }

    return (
        <Modal visible={showChangeOfOwnership}>
            <SafeAreaView style={styles.container}>
                <HeaderOfModal handleOnPress={handlePressClose} title={t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP} />

                <StepView
                    readOnly={readOnly}
                    activeStep={activeStep}
                    stepTextMap={stepMap}
                    onPressStepOne={onPressStepOne}
                    onPressStepTwo={onPressStepTwo}
                    onPressStepThree={onPressStepThree}
                />

                {renderStepBody()}
            </SafeAreaView>

            <FormBottomButton
                onPressCancel={handlePressCancel}
                relative
                disableSave={disableNextBtn}
                onPressSave={handlePressSave}
                leftButtonLabel={t.labels.PBNA_MOBILE_BACK.toUpperCase()}
                rightButtonLabel={renderFormBottomButtonLabel()}
            />

            <GlobalModal ref={globalModalRef} />
        </Modal>
    )
}
export default ChangeOfOwnership
