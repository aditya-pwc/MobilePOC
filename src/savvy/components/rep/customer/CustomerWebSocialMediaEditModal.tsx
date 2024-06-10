/**
 * @description Component to edit web and social media data.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React, { useEffect, useState } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import _ from 'lodash'
import CText from '../../../../common/components/CText'
import LeadInput from '../lead/common/LeadInput'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'

interface CustomerWebSocialMediaEditModalProps {
    tempAccount: any
    setTempAccount
    showModal: boolean
    setShowModal: (showModal: boolean) => void
    account
    setAccount
    validAdditional
    setValidAdditional
    additionalList
    setAdditionalList
    retailStore
    setEditCount
}

export const styles = StyleSheet.create({
    additionalContainer: {
        flexDirection: 'row',
        paddingBottom: '5%'
    },
    textStyle: {
        fontWeight: '700',
        flex: 1
    },
    removeText: {
        fontWeight: '700',
        color: '#da5763'
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    container2: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 8
    },
    titleStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 75
    },
    fontWeight_700: { fontWeight: '700' },
    lineContainer: {
        width: '100%',
        paddingHorizontal: '5%',
        marginBottom: 20
    },
    lineStyle: {
        backgroundColor: '#CDCDCD',
        width: '100%',
        height: 1
    },
    scrollViewContainer: {
        paddingHorizontal: '5%',
        height: '65%'
    },
    paddingBottom_5: { paddingBottom: '5%' },
    addContainer: {
        height: 36,
        width: 30
    },
    cancelStyle: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: 60,
        borderBottomLeftRadius: 8,
        shadowColor: '#E7E7E7',
        shadowOffset: {
            width: 2,
            height: -1
        },
        shadowOpacity: 6
    },
    cancelText: {
        color: '#6105BD',
        fontWeight: '700'
    },
    enableBackgroundColor: {
        backgroundColor: '#00A2D9'
    },
    disableBackgroundColor: {
        backgroundColor: '#d8d8d8'
    },
    addStyle1: {
        width: 20,
        height: 3,
        left: 0,
        top: 16.5,
        position: 'absolute'
    },
    addStyle2: {
        width: 3,
        height: 20,
        left: 8.5,
        top: 8,
        position: 'absolute'
    },
    disableColor: {
        color: '#d8d8d8'
    },
    enableColor: {
        color: '#00A2D9'
    },
    saveStyle: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderBottomRightRadius: 8,
        shadowColor: '#E7E7E7',
        shadowOffset: {
            width: -3,
            height: -3
        },
        shadowOpacity: 6
    },
    validAllColor: {
        backgroundColor: '#6105BD'
    },
    invalidAllColor: {
        backgroundColor: '#FFFFFF'
    },
    validAll: {
        color: '#FFFFFF'
    },
    invalidAll: {
        color: '#D3D3D3'
    }
})

export const CustomerWebSocialMediaEditModal = (props: CustomerWebSocialMediaEditModalProps) => {
    const {
        tempAccount,
        setTempAccount,
        showModal,
        setShowModal,
        account,
        setAccount,
        validAdditional,
        setValidAdditional,
        additionalList,
        setAdditionalList,
        retailStore,
        setEditCount
    } = props

    const [validWebsite, setValidWebsite] = useState(true)
    const [validFacebook, setValidFacebook] = useState(true)
    const [validFoursquare, setValidFoursquare] = useState(true)
    const [validYelp, setValidYelp] = useState(true)
    const [validDoordash, setValidDoordash] = useState(true)
    const [validUbereats, setValidUbereats] = useState(true)
    const [validPostmates, setValidPostmates] = useState(true)
    const [validGrubhub, setValidGrabhub] = useState(true)
    const [disableAdd, setDisableAdd] = useState(false)
    const [validAll, setValidAll] = useState(true)

    const convertData = () => {
        return {
            User_Link_1__c: additionalList[0] ? additionalList[0].Link : null,
            User_Link_Label_1__c: additionalList[0] ? additionalList[0].Label : null,
            User_Link_2__c: additionalList[1] ? additionalList[1].Link : null,
            User_Link_Label_2__c: additionalList[1] ? additionalList[1].Label : null,
            User_Link_3__c: additionalList[2] ? additionalList[2].Link : null,
            User_Link_Label_3__c: additionalList[2] ? additionalList[2].Label : null
        }
    }

    const saveData = () => {
        setShowModal(false)
        setTempAccount({
            ...tempAccount,
            ...account,
            ...convertData()
        })
        setEditCount((v) => v + 1)
    }

    useEffect(() => {
        setValidAll(
            validWebsite &&
                validFacebook &&
                validFoursquare &&
                validYelp &&
                validUbereats &&
                validPostmates &&
                validGrubhub &&
                validDoordash &&
                validAdditional[0][0] &&
                validAdditional[0][1] &&
                validAdditional[1][0] &&
                validAdditional[1][1] &&
                validAdditional[2][0] &&
                validAdditional[2][1]
        )
    }, [
        validWebsite,
        validFacebook,
        validFoursquare,
        validYelp,
        validUbereats,
        validPostmates,
        validGrubhub,
        validDoordash,
        validAdditional[0][0],
        validAdditional[0][1],
        validAdditional[1][0],
        validAdditional[1][1],
        validAdditional[2][0],
        validAdditional[2][1]
    ])

    useEffect(() => {
        if (additionalList.length >= 3) {
            setDisableAdd(true)
        } else {
            setDisableAdd(false)
        }
    }, [additionalList])

    const addLink = () => {
        const tempAdditionalList = additionalList.concat({
            Label: '',
            Link: ''
        })
        setAdditionalList(tempAdditionalList)
        validAdditional[additionalList.length][0] = false
        validAdditional[additionalList.length][1] = false
        setValidAdditional(validAdditional)
    }

    const deleteLink = (index) => {
        const tempList = _.cloneDeep(additionalList)
        tempList.splice(index, 1)
        setAdditionalList(tempList)
        validAdditional.splice(index, 1)
        for (let i = validAdditional.length; i < 3; i++) {
            validAdditional.push([true, true])
        }
        setValidAdditional(validAdditional)
    }

    const renderAdditional = () => {
        return additionalList.map((value, index) => {
            return (
                <View key={value.count}>
                    <View style={styles.additionalContainer}>
                        <CText style={styles.textStyle}>{t.labels.PBNA_MOBILE_ADDITIONAL_LINK}</CText>
                        <TouchableOpacity
                            onPress={() => {
                                deleteLink(index)
                            }}
                        >
                            <CText style={styles.removeText}>{t.labels.PBNA_MOBILE_REMOVE.toUpperCase()}</CText>
                        </TouchableOpacity>
                    </View>
                    <LeadInput
                        placeholder={t.labels.PBNA_MOBILE_ENTER_SOCIAL_MEDIA_TITLE}
                        fieldName={''}
                        trackedValue={additionalList[index].Label}
                        onChangeText={(v) => {
                            const lstTemp = _.cloneDeep(additionalList)
                            lstTemp[index].Label = v
                            setAdditionalList(lstTemp)
                        }}
                        onValidate={(v) => {
                            validAdditional[index][0] = v
                            setValidAdditional(validAdditional)
                        }}
                        required
                        requiredText={t.labels.PBNA_MOBILE_THIS_FILED_IS_REQUIRED}
                    />
                    <LeadInput
                        placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        fieldName={''}
                        url
                        trackedValue={additionalList[index].Link}
                        onChangeText={(v) => {
                            const lstTemp = _.cloneDeep(additionalList)
                            lstTemp[index].Link = v
                            setAdditionalList(lstTemp)
                        }}
                        onValidate={(v) => {
                            validAdditional[index][1] = v
                            setValidAdditional(validAdditional)
                        }}
                        required
                        requiredText={t.labels.PBNA_MOBILE_URL_INVALID}
                    />
                </View>
            )
        })
    }

    return (
        <Modal visible={showModal} transparent>
            <View style={styles.container}>
                <View style={styles.container2}>
                    <View style={styles.titleStyle}>
                        <CText style={styles.fontWeight_700}>{t.labels.PBNA_MOBILE_WEB_SOCIAL_MEDIA}</CText>
                    </View>
                    <View style={styles.lineContainer}>
                        <View style={styles.lineStyle} />
                    </View>
                    <KeyboardAwareScrollView style={styles.scrollViewContainer}>
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_WEB}
                            trackedValue={account.Website}
                            disabled={retailStore['Account.Website']}
                            url
                            onChangeText={(v) => {
                                setAccount({
                                    ...account,
                                    Website: v
                                })
                            }}
                            onValidate={(v) => {
                                setValidWebsite(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_FACEBOOK}
                            trackedValue={account.ff_FACEBOOK__c}
                            disabled={retailStore['Account.ff_FACEBOOK__c']}
                            url
                            onChangeText={(v) => {
                                setAccount({
                                    ...account,
                                    ff_FACEBOOK__c: v
                                })
                            }}
                            onValidate={(v) => {
                                setValidFacebook(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_FOURSQUARE}
                            trackedValue={account.ff_FOURSQUARE__c}
                            disabled={retailStore['Account.ff_FOURSQUARE__c']}
                            url
                            onChangeText={(v) => {
                                setAccount({
                                    ...account,
                                    ff_FOURSQUARE__c: v
                                })
                            }}
                            onValidate={(v) => {
                                setValidFoursquare(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_YELP}
                            trackedValue={account.ff_YELP__c}
                            disabled={retailStore['Account.ff_YELP__c']}
                            url
                            onChangeText={(v) => {
                                setAccount({
                                    ...account,
                                    ff_YELP__c: v
                                })
                            }}
                            onValidate={(v) => {
                                setValidYelp(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_FIREFLY}
                            trackedValue={account.FF_LINK__c}
                            disabled
                            url
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                            onChangeText={(v) => {
                                setAccount({
                                    ...account,
                                    FF_LINK__c: v
                                })
                            }}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_DOORDASH}
                            trackedValue={account.ff_DOORDASH__c}
                            disabled={retailStore['Account.ff_DOORDASH__c']}
                            url
                            onChangeText={(v) => {
                                setAccount({
                                    ...account,
                                    ff_DOORDASH__c: v
                                })
                            }}
                            onValidate={(v) => {
                                setValidDoordash(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_UBEREATS}
                            trackedValue={account.ff_UBEREATS__c}
                            disabled={retailStore['Account.ff_UBEREATS__c']}
                            url
                            onChangeText={(v) => {
                                setAccount({
                                    ...account,
                                    ff_UBEREATS__c: v
                                })
                            }}
                            onValidate={(v) => {
                                setValidUbereats(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_POSTMATES}
                            trackedValue={account.ff_POSTMATES__c}
                            disabled={retailStore['Account.ff_POSTMATES__c']}
                            url
                            onChangeText={(v) => {
                                setAccount({
                                    ...account,
                                    ff_POSTMATES__c: v
                                })
                            }}
                            onValidate={(v) => {
                                setValidPostmates(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_GRUBHUB}
                            trackedValue={account.ff_GRUBHUB__c}
                            disabled={retailStore['Account.ff_GRUBHUB__c']}
                            url
                            onChangeText={(v) => {
                                setAccount({
                                    ...account,
                                    ff_GRUBHUB__c: v
                                })
                            }}
                            onValidate={(v) => {
                                setValidGrabhub(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        {renderAdditional()}
                        <TouchableOpacity
                            style={styles.paddingBottom_5}
                            onPress={() => {
                                addLink()
                            }}
                            disabled={disableAdd}
                        >
                            <View style={commonStyle.flexRowAlignCenter}>
                                <View style={styles.addContainer}>
                                    <View
                                        style={[
                                            styles.addStyle1,
                                            disableAdd ? styles.disableBackgroundColor : styles.enableBackgroundColor
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.addStyle2,
                                            disableAdd ? styles.disableBackgroundColor : styles.enableBackgroundColor
                                        ]}
                                    />
                                </View>
                                <CText
                                    style={[
                                        disableAdd ? styles.disableColor : styles.enableColor,
                                        styles.fontWeight_700
                                    ]}
                                >
                                    {t.labels.PBNA_MOBILE_ADD_NEW}
                                </CText>
                            </View>
                        </TouchableOpacity>
                    </KeyboardAwareScrollView>
                    <View style={commonStyle.flexDirectionRow}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowModal(false)
                                setAccount({
                                    Website: tempAccount.Website,
                                    ff_FACEBOOK__c: tempAccount.ff_FACEBOOK__c,
                                    ff_FOURSQUARE__c: tempAccount.ff_FOURSQUARE__c,
                                    ff_YELP__c: tempAccount.ff_YELP__c,
                                    FF_LINK__c: tempAccount.FF_LINK__c,
                                    ff_UBEREATS__c: tempAccount.ff_UBEREATS__c,
                                    ff_POSTMATES__c: tempAccount.ff_POSTMATES__c,
                                    ff_GRUBHUB__c: tempAccount.ff_GRUBHUB__c,
                                    ff_DOORDASH__c: tempAccount.ff_DOORDASH__c,
                                    User_Link_Label_1__c: tempAccount.User_Link_Label_1__c,
                                    User_Link_1__c: tempAccount.User_Link_1__c,
                                    User_Link_Label_2__c: tempAccount.User_Link_Label_2__c,
                                    User_Link_2__c: tempAccount.User_Link_2__c,
                                    User_Link_Label_3__c: tempAccount.User_Link_Label_3__c,
                                    User_Link_3__c: tempAccount.User_Link_3__c
                                })
                                const lstAdd = []
                                if (tempAccount.User_Link_Label_1__c) {
                                    lstAdd[0] = {
                                        Label: tempAccount.User_Link_Label_1__c,
                                        Link: tempAccount.User_Link_1__c
                                    }
                                }
                                if (tempAccount.User_Link_Label_2__c) {
                                    lstAdd[1] = {
                                        Label: tempAccount.User_Link_Label_2__c,
                                        Link: tempAccount.User_Link_2__c
                                    }
                                }
                                if (tempAccount.User_Link_Label_3__c) {
                                    lstAdd[2] = {
                                        Label: tempAccount.User_Link_Label_3__c,
                                        Link: tempAccount.User_Link_3__c
                                    }
                                }
                                setAdditionalList(lstAdd)
                                // dispatch(changeWebSocialMediaEditModalAction())
                            }}
                            style={styles.cancelStyle}
                        >
                            <CText style={styles.cancelText}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveStyle, validAll ? styles.validAllColor : styles.invalidAllColor]}
                            onPress={() => {
                                saveData()
                            }}
                            disabled={!validAll}
                        >
                            <CText style={[styles.fontWeight_700, validAll ? styles.validAll : styles.invalidAll]}>
                                {t.labels.PBNA_MOBILE_SAVE.toUpperCase()}
                            </CText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default CustomerWebSocialMediaEditModal
