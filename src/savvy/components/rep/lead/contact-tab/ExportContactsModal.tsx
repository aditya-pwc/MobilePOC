/**
 * @description Modal to Export Contact.
 * @author Kiren Cao
 * @date 2022-09-19
 */
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ActivityIndicator, Image, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'

import FormBottomButton from '../../../../../common/components/FormBottomButton'
import CText from '../../../../../common/components/CText'
import LeadCheckBox from '../common/LeadCheckBox'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import ExportContactsSelector from '../common/ExportContactsSelector'
import _ from 'lodash'
import { CommonLabel } from '../../../../enums/CommonLabel'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import { ContactPdfPage } from './ContactPdfHelper'
import { useDisableExportContact } from '../../../../hooks/LeadHooks'
import ProcessDoneModal from '../../../common/ProcessDoneModal'
import PopMessage from '../../../common/PopMessage'
import { t } from '../../../../../common/i18n/t'
import { Log } from '../../../../../common/enums/Log'
import CCheckBox from '../../../../../common/components/CCheckBox'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { storeClassLog } from '../../../../../common/utils/LogUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'

interface ExportContactsModalProps {
    type: 'Lead' | 'RetailStore'
    cRef: any
    l?: any
    userList?: any
    contactList?: any
    setSearchContactValue?: any
    showInitLoadingIndicator?: any
}
const styles = StyleSheet.create({
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    selectedContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        paddingBottom: 8,
        paddingTop: 10
    },
    subTypeCell: {
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        marginRight: 10,
        paddingVertical: 7,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 15,
        marginVertical: 4,
        alignItems: 'center'
    },
    employeesText: {
        flexShrink: 1
    },
    clearSubTypeContainer: {
        marginLeft: 10
    },
    imgClear: {
        width: 18,
        height: 19
    },
    halfWidth: {
        width: '50%'
    },
    checkLabel: {
        fontSize: 14,
        marginLeft: 8
    },
    popContentWrap: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        marginTop: 15,
        paddingHorizontal: '5%'
    },
    popNavBarLabel: {
        fontWeight: '700'
    },
    popNavBarDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#D3D3D3',
        marginTop: 26
    },
    exportLabelWrap: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        marginBottom: 10
    },
    exportLabel: {
        fontWeight: '900',
        fontSize: 24
    },
    contactType: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 50
    },
    contactCheckWrap: {
        flexDirection: 'row',
        marginTop: 26,
        left: -10
    },
    contactCheckText: {
        fontWeight: '400',
        color: '#000000',
        left: -5,
        fontFamily: 'Gotham'
    },
    bgTransparent: {
        backgroundColor: 'transparent'
    },
    exportType: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 30,
        marginBottom: 20
    },
    selectContactLabel: {
        fontSize: 12,
        color: '#565656',
        fontWeight: '400',
        marginBottom: 10
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#d3d3d3'
    },
    iconSearch: {
        height: 23,
        width: 22,
        marginRight: 5,
        marginLeft: 1,
        marginTop: 1
    },
    searchText: {
        fontSize: 14,
        color: '#778899',
        minHeight: 17,
        width: '90%'
    },
    marginTop20: {
        marginTop: 20
    },
    right20: {
        right: 20
    },
    selectContactWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    selectedCount: {
        color: '#565656'
    },
    submitButton: {
        fontSize: 14,
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    activityIndicator: {
        marginLeft: 15,
        width: 14,
        height: 14
    }
})

const ExportContactsModal: FC<ExportContactsModalProps> = (props: ExportContactsModalProps) => {
    const { type, cRef, l, userList, contactList, setSearchContactValue, showInitLoadingIndicator } = props
    const [showExportContacts, setShowExportContacts] = useState(false)
    const [customerContacts, setCustomerContacts] = useState(false)
    const [internalContacts, setInternalContacts] = useState(false)
    const [selectedContacts, setSelectedContacts] = useState({})
    const [selectedTempArr, setSelectedTempArr] = useState([])
    const contactSearchRef = useRef(null)
    const [exportType, setExportType] = useState('-1')
    const handlePressSearchContact = () => {
        contactSearchRef.current.open()
    }
    useImperativeHandle(cRef, () => ({
        open: () => {
            setShowExportContacts(true)
        }
    }))
    useEffect(() => {}, [setShowExportContacts])
    const showContacts = () => {
        if (!_.isEmpty(selectedContacts)) {
            const selectedArr = Object.values(selectedContacts).sort(function (a: any, b: any) {
                const nameA = a?.Name?.toUpperCase() || a?.name?.toUpperCase()
                const nameB = b?.Name?.toUpperCase() || b?.name?.toUpperCase()
                if (nameA < nameB) {
                    return CommonLabel.NUMBER_MINUS_ONE
                }
                if (nameA > nameB) {
                    return CommonLabel.NUMBER_ONE
                }
                return CommonLabel.NUMBER_ZERO
            })
            setSelectedTempArr(selectedArr)
        } else {
            setSelectedTempArr([])
        }
    }
    useEffect(() => {
        showContacts()
    }, [selectedContacts])
    const onRemoveContacts = (item: any) => {
        const tempContacts = _.cloneDeep(selectedContacts)
        delete tempContacts[item]
        setSelectedContacts(tempContacts)
    }
    const onExportContact = () => {
        global.$globalModal.openModal(
            <ProcessDoneModal type="success">
                <PopMessage>{t.labels.PBNA_MOBILE_CONTACT_EXPORT_SUCCESS_MSG}</PopMessage>
            </ProcessDoneModal>
        )
        setTimeout(() => {
            global.$globalModal.closeModal()
        }, 3000)
        setShowExportContacts(false)
        setCustomerContacts(false)
        setExportType('-1')
        setInternalContacts(false)
        setSelectedContacts({})
    }
    const disableSave = useDisableExportContact(
        selectedTempArr,
        customerContacts,
        internalContacts,
        exportType,
        type,
        showInitLoadingIndicator
    )
    const exportShare = async () => {
        let mailResponse = { mailRes: '', usedImg: [] }
        if (exportType === '1') {
            try {
                mailResponse = await ContactPdfPage(selectedTempArr, l, type)
            } catch (e) {
                storeClassLog(Log.MOBILE_ERROR, 'ExportContactsModal', ErrorUtils.error2String(e))
            } finally {
                if (mailResponse?.mailRes === 'sent') {
                    onExportContact()
                } else {
                    global.$globalModal.openModal(
                        <ProcessDoneModal type={'failed'}>
                            <PopMessage>{t.labels.PBNA_MOBILE_SEND_EMAIL_FAILED}</PopMessage>
                        </ProcessDoneModal>,
                        t.labels.PBNA_MOBILE_OK
                    )
                    setTimeout(() => {
                        global.$globalModal.closeModal()
                    }, 3000)
                }
            }
        } else {
            let tempList = []
            if (type === 'Lead') {
                tempList = contactList
            } else {
                if (customerContacts && internalContacts) {
                    tempList = _.concat(contactList, userList)
                } else if (customerContacts && !internalContacts) {
                    tempList = contactList
                } else if (!customerContacts && internalContacts) {
                    tempList = userList
                }
            }
            try {
                mailResponse = await ContactPdfPage(tempList, l, type)
            } catch (e) {
                storeClassLog(Log.MOBILE_ERROR, 'ExportContactsModal', ErrorUtils.error2String(e))
            } finally {
                if (mailResponse?.mailRes === 'sent') {
                    onExportContact()
                } else {
                    global.$globalModal.openModal(
                        <ProcessDoneModal type={'failed'}>
                            <PopMessage>{t.labels.PBNA_MOBILE_SEND_EMAIL_FAILED}</PopMessage>
                        </ProcessDoneModal>,
                        t.labels.PBNA_MOBILE_OK
                    )
                    setTimeout(() => {
                        global.$globalModal.closeModal()
                    }, 3000)
                }
            }
        }
    }

    const renderRadioButton = () => {
        return (
            <View style={commonStyle.flexDirectionRow}>
                <View style={styles.halfWidth}>
                    <LeadCheckBox
                        title={<CText style={styles.checkLabel}>{t.labels.PBNA_MOBILE_ALL_CONTACTS}</CText>}
                        checked={exportType === '0'}
                        editable
                        checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                        uncheckedIcon={<Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />}
                        customFalseValue={'0'}
                        customTrueValue={'1'}
                        outerForm
                        onChange={() => {
                            setExportType('0')
                            setSelectedContacts({})
                        }}
                    />
                </View>
                <LeadCheckBox
                    title={<CText style={styles.checkLabel}>{t.labels.PBNA_MOBILE_SELECT_CONTACTS}</CText>}
                    checked={exportType === '1'}
                    editable
                    checkedIcon={<Image source={ImageSrc.IMG_CHECK_CIRCLE} style={styles.checkedIcon} />}
                    uncheckedIcon={<Image source={ImageSrc.IMG_UNCHECK_CIRCLE} style={styles.checkedIcon} />}
                    customFalseValue={'0'}
                    customTrueValue={'1'}
                    outerForm
                    onChange={() => {
                        setExportType('1')
                    }}
                />
            </View>
        )
    }

    return (
        <Modal visible={showExportContacts}>
            <SafeAreaView style={[commonStyle.fullHeight, commonStyle.fullWidth]}>
                <View style={styles.popContentWrap}>
                    <View style={commonStyle.alignCenter}>
                        <CText style={styles.popNavBarLabel}>{t.labels.PBNA_MOBILE_EXPORT_SHARE.toUpperCase()}</CText>
                        <View style={styles.popNavBarDivider} />
                    </View>
                    <View style={styles.exportLabelWrap}>
                        <CText style={styles.exportLabel}>{t.labels.PBNA_MOBILE_EXPORT_CONTACTS}</CText>
                    </View>
                    {type === 'RetailStore' && (
                        <View>
                            <CText style={styles.contactType}>{t.labels.PBNA_MOBILE_CONTACT_TYPE}</CText>
                            <View style={styles.contactCheckWrap}>
                                <View style={styles.halfWidth}>
                                    <CCheckBox
                                        title={t.labels.PBNA_MOBILE_CUSTOMER_CONTACTS}
                                        textStyle={styles.contactCheckText}
                                        onPress={() => {
                                            setCustomerContacts(!customerContacts)
                                        }}
                                        containerStyle={commonStyle.transparentBG}
                                        checked={customerContacts}
                                    />
                                </View>
                                <CCheckBox
                                    title={t.labels.PBNA_MOBILE_INTERNAL_CONTACTS}
                                    textStyle={styles.contactCheckText}
                                    onPress={() => {
                                        setInternalContacts(!internalContacts)
                                    }}
                                    containerStyle={commonStyle.transparentBG}
                                    checked={internalContacts}
                                />
                            </View>
                        </View>
                    )}
                    <CText style={styles.exportType}>{t.labels.PBNA_MOBILE_EXPORT_TYPE}</CText>
                    {renderRadioButton()}
                    {exportType === '1' && (
                        <View style={styles.marginTop20}>
                            <CText style={styles.selectContactLabel}>{t.labels.PBNA_MOBILE_SELECT_CONTACTS}</CText>
                            <TouchableOpacity
                                onPress={() => {
                                    handlePressSearchContact()
                                }}
                                style={styles.borderBottom}
                                disabled={
                                    type === 'Lead'
                                        ? showInitLoadingIndicator
                                        : showInitLoadingIndicator || (!customerContacts && !internalContacts)
                                }
                            >
                                <View style={styles.selectContactWrap}>
                                    <Image
                                        source={require('../../../../../../assets/image/icon-search.png')}
                                        style={styles.iconSearch}
                                    />
                                    <CText style={styles.searchText}>{t.labels.PBNA_MOBILE_SEARCH_CONTACTS}</CText>
                                    {showInitLoadingIndicator && <ActivityIndicator style={styles.right20} />}
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                    {Object.keys(selectedContacts).length > 0 && (
                        <View style={[commonStyle.flex_1, styles.marginTop20]}>
                            <CText style={styles.selectedCount}>
                                {t.labels.PBNA_MOBILE_CONTACTS_SELECTED} ({Object.keys(selectedContacts).length})
                            </CText>
                            <View style={styles.selectedContainer}>
                                {selectedTempArr.map((item: any) => {
                                    return (
                                        <View style={styles.subTypeCell} key={`select${item.Id}`}>
                                            <CText style={styles.employeesText}>{item.Name || item.name}</CText>
                                            <TouchableOpacity
                                                onPress={() => onRemoveContacts(item.Id)}
                                                style={styles.clearSubTypeContainer}
                                            >
                                                <Image style={styles.imgClear} source={ImageSrc.IMG_CLEAR} />
                                            </TouchableOpacity>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    )}
                    <ExportContactsSelector
                        cRef={contactSearchRef}
                        setSelectedContacts={setSelectedContacts}
                        selectedContacts={_.cloneDeep(selectedContacts)}
                        type={type}
                        internalContacts={internalContacts}
                        customerContacts={customerContacts}
                        userList={_.cloneDeep(userList)}
                        contactList={_.cloneDeep(contactList)}
                        setSearchContactValue={setSearchContactValue}
                    />
                </View>
            </SafeAreaView>
            <FormBottomButton
                onPressCancel={() => {
                    setShowExportContacts(false)
                    setCustomerContacts(false)
                    setExportType('-1')
                    setInternalContacts(false)
                    setSelectedContacts({})
                }}
                disableSave={disableSave}
                onPressSave={exportShare}
                rightButtonLabel={
                    <CText
                        style={[
                            styles.submitButton,
                            {
                                color: disableSave ? '#D3D3D3' : '#FFFFFF'
                            }
                        ]}
                    >
                        {t.labels.PBNA_MOBILE_EXPORT_SHARE}
                        {showInitLoadingIndicator && <ActivityIndicator style={styles.activityIndicator} />}
                    </CText>
                }
            />
        </Modal>
    )
}
export default ExportContactsModal
