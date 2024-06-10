/**
 * @description Component to edit web and social media data.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React, { useEffect, useState } from 'react'
import { Modal, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import CText from '../../../../../common/components/CText'
import { changeWebSocialMediaEditModalAction, updateTempLeadAction } from '../../../../redux/action/LeadActionType'
import store from '../../../../redux/store/Store'
import { LeadDetailBaseProps } from '../../../../interface/LeadInterface'
import LeadInput from '../common/LeadInput'
import { LeadDetailSection } from '../../../../enums/Lead'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
const styles = StyleSheet.create({
    additionalCont: {
        flexDirection: 'row',
        paddingBottom: '5%'
    },
    additionalLink: {
        fontWeight: '700',
        flex: 1
    },
    removeText: {
        fontWeight: '700',
        color: '#da5763'
    },
    modalCont: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    containView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 8
    },
    socialMedia: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 75
    },
    socialMediaText: {
        fontWeight: '700'
    },
    emptyCont: {
        width: '100%',
        paddingHorizontal: '5%',
        marginBottom: 20
    },
    emptyView: {
        backgroundColor: '#CDCDCD',
        width: '100%',
        height: 1
    },
    keyBoardView: {
        paddingHorizontal: '5%',
        height: '65%'
    },
    addLinkBtn: {
        paddingBottom: '5%'
    },
    addNewCont: {
        height: 36,
        width: 30
    },
    disableView: {
        width: 20,
        height: 3,
        left: 0,
        top: 16.5,
        position: 'absolute'
    },
    disableAddView: {
        width: 3,
        height: 20,
        left: 8.5,
        top: 8,
        position: 'absolute'
    },
    cancelBtn: {
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
    saveBtn: {
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
    }
})
export const WebSocialMediaEditModal = (props: LeadDetailBaseProps) => {
    const { l } = props
    const [tempSocialMedia, setTempSocialMedia] = useState({
        Website__c: null,
        ff_FACEBOOK_c__c: null,
        ff_FOURSQUARE_c__c: null,
        ff_YELP_c__c: null,
        FF_LINK_c__c: null,
        YELP_HOT_AND_NEW_c__c: null,
        ff_UBEREATS_c__c: null,
        ff_POSTMATES_c__c: null,
        ff_GRUBHUB_c__c: null,
        ff_DOORDASH_c__c: null,
        User_Link_Label_1_c__c: null,
        User_Link_1_c__c: null,
        User_Link_Label_2_c__c: null,
        User_Link_2_c__c: null,
        User_Link_Label_3_c__c: null,
        User_Link_3_c__c: null
    })

    const [validWebsite, setValidWebsite] = useState(true)
    const [validFacebook, setValidFacebook] = useState(true)
    const [validFoursquare, setValidFoursquare] = useState(true)
    const [validYelp, setValidYelp] = useState(true)
    const [validDoordash, setValidDoordash] = useState(true)
    const [validUbereats, setValidUbereats] = useState(true)
    const [validPostmates, setValidPostmates] = useState(true)
    const [validGrubhub, setValidGrubhub] = useState(true)
    const initValidAdditional = () => {
        return [
            [true, true],
            [true, true],
            [true, true]
        ]
    }
    const [validAdditional, setValidAdditional] = useState(initValidAdditional)
    const [additionalList, setAdditionalList] = useState<{ Link: string; Label: string; count: number }[]>([])
    const [disableAdd, setDisableAdd] = useState(false)
    const [validAll, setValidAll] = useState(true)
    const dispatch = useDispatch()
    const saveData = () => {
        dispatch(
            updateTempLeadAction(
                {
                    ...tempSocialMedia
                },
                LeadDetailSection.WEB_SOCIAL_MEDIA
            )
        )
        dispatch(changeWebSocialMediaEditModalAction())
    }
    useEffect(() => {
        return store.subscribe(() => {
            const tempLead = store.getState().leadReducer.negotiateLeadEditReducer
            setTempSocialMedia({
                Website__c: tempLead.Website__c,
                ff_FACEBOOK_c__c: tempLead.ff_FACEBOOK_c__c,
                ff_FOURSQUARE_c__c: tempLead.ff_FOURSQUARE_c__c,
                ff_YELP_c__c: tempLead.ff_YELP_c__c,
                FF_LINK_c__c: tempLead.FF_LINK_c__c,
                YELP_HOT_AND_NEW_c__c: tempLead.YELP_HOT_AND_NEW_c__c,
                ff_UBEREATS_c__c: tempLead.ff_UBEREATS_c__c,
                ff_POSTMATES_c__c: tempLead.ff_POSTMATES_c__c,
                ff_GRUBHUB_c__c: tempLead.ff_GRUBHUB_c__c,
                ff_DOORDASH_c__c: tempLead.ff_DOORDASH_c__c,
                User_Link_Label_1_c__c: tempLead.User_Link_Label_1_c__c,
                User_Link_1_c__c: tempLead.User_Link_1_c__c,
                User_Link_Label_2_c__c: tempLead.User_Link_Label_2_c__c,
                User_Link_2_c__c: tempLead.User_Link_2_c__c,
                User_Link_Label_3_c__c: tempLead.User_Link_Label_3_c__c,
                User_Link_3_c__c: tempLead.User_Link_3_c__c
            })
            setValidAdditional(initValidAdditional)
            const lstAdd = []
            if (tempLead.User_Link_Label_1_c__c) {
                lstAdd[0] = { Label: tempLead.User_Link_Label_1_c__c, Link: tempLead.User_Link_1_c__c, count: 1 }
            }
            if (tempLead.User_Link_Label_2_c__c) {
                lstAdd[1] = { Label: tempLead.User_Link_Label_2_c__c, Link: tempLead.User_Link_2_c__c, count: 2 }
            }
            if (tempLead.User_Link_Label_3_c__c) {
                lstAdd[2] = { Label: tempLead.User_Link_Label_3_c__c, Link: tempLead.User_Link_3_c__c, count: 3 }
            }
            setAdditionalList(lstAdd)
        })
    }, [])

    useEffect(() => {
        if (additionalList.length >= 3) {
            setDisableAdd(true)
        } else {
            setDisableAdd(false)
        }
        const temp = _.cloneDeep(tempSocialMedia)
        if (additionalList[0]) {
            temp.User_Link_1_c__c = additionalList[0].Link
            temp.User_Link_Label_1_c__c = additionalList[0].Label
        } else {
            temp.User_Link_1_c__c = null
            temp.User_Link_Label_1_c__c = null
        }
        if (additionalList[1]) {
            temp.User_Link_2_c__c = additionalList[1].Link
            temp.User_Link_Label_2_c__c = additionalList[1].Label
        } else {
            temp.User_Link_2_c__c = null
            temp.User_Link_Label_2_c__c = null
        }
        if (additionalList[2]) {
            temp.User_Link_3_c__c = additionalList[2].Link
            temp.User_Link_Label_3_c__c = additionalList[2].Label
        } else {
            temp.User_Link_3_c__c = null
            temp.User_Link_Label_3_c__c = null
        }
        setTempSocialMedia(temp)
    }, [additionalList])

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

    const addLink = () => {
        setAdditionalList((prevState) => {
            return prevState.concat({ Label: '', Link: '', count: additionalList.length + 1 })
        })
        setValidAdditional((prevState) => {
            const temp = _.cloneDeep(prevState)
            temp[additionalList.length][0] = false
            temp[additionalList.length][1] = false
            return temp
        })
    }

    const deleteLink = (index) => {
        const tempList = _.cloneDeep(additionalList)
        tempList.splice(index, 1)
        setAdditionalList(tempList)
        const temp = _.cloneDeep(validAdditional)
        temp.splice(index, 1)
        for (let i = temp.length; i < 3; i++) {
            temp.push([true, true])
        }
        setValidAdditional(temp)
    }

    const renderAdditional = () => {
        return additionalList.map((value: any, index) => {
            return (
                <View key={value.count}>
                    <View style={styles.additionalCont}>
                        <CText style={styles.additionalLink}>{t.labels.PBNA_MOBILE_ADDITIONAL_LINK}</CText>
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
                            const temp = _.cloneDeep(validAdditional)
                            temp[index][0] = v
                            setValidAdditional(temp)
                        }}
                        required
                        requiredText={t.labels.PBNA_MOBILE_URL_INVALID}
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
                            const temp = _.cloneDeep(validAdditional)
                            temp[index][1] = v
                            setValidAdditional(temp)
                        }}
                        required
                        requiredText={t.labels.PBNA_MOBILE_URL_INVALID}
                    />
                </View>
            )
        })
    }

    return (
        <Modal visible={store.getState().leadReducer.editWebSocialMediaModalReducer.showModal} transparent>
            <View style={styles.modalCont}>
                <View style={styles.containView}>
                    <View style={styles.socialMedia}>
                        <CText style={styles.socialMediaText}>{t.labels.PBNA_MOBILE_WEB_SOCIAL_MEDIA}</CText>
                    </View>
                    <View style={styles.emptyCont}>
                        <View style={styles.emptyView} />
                    </View>
                    <KeyboardAwareScrollView style={styles.keyBoardView}>
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_WEB}
                            fieldApiName={'Website__c'}
                            disabled={l.Website__c}
                            url
                            onChangeText={(v) => {
                                setTempSocialMedia({ ...tempSocialMedia, Website__c: v })
                            }}
                            onValidate={(v) => {
                                setValidWebsite(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_FACEBOOK}
                            fieldApiName={'ff_FACEBOOK_c__c'}
                            disabled={l.ff_FACEBOOK_c__c}
                            url
                            onChangeText={(v) => {
                                setTempSocialMedia({ ...tempSocialMedia, ff_FACEBOOK_c__c: v })
                            }}
                            onValidate={(v) => {
                                setValidFacebook(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_FOURSQUARE}
                            fieldApiName={'ff_FOURSQUARE_c__c'}
                            disabled={l.ff_FOURSQUARE_c__c}
                            url
                            onChangeText={(v) => {
                                setTempSocialMedia({ ...tempSocialMedia, ff_FOURSQUARE_c__c: v })
                            }}
                            onValidate={(v) => {
                                setValidFoursquare(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_YELP}
                            fieldApiName={'ff_YELP_c__c'}
                            disabled={l.ff_YELP_c__c}
                            url
                            onChangeText={(v) => {
                                setTempSocialMedia({ ...tempSocialMedia, ff_YELP_c__c: v })
                            }}
                            onValidate={(v) => {
                                setValidYelp(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_FIREFLY}
                            fieldApiName={'FF_LINK_c__c'}
                            disabled
                            url
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                            onChangeText={(v) => {
                                setTempSocialMedia({ ...tempSocialMedia, FF_LINK_c__c: v })
                            }}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_DOORDASH}
                            fieldApiName={'ff_DOORDASH_c__c'}
                            disabled={l.ff_DOORDASH_c__c}
                            url
                            onChangeText={(v) => {
                                setTempSocialMedia({ ...tempSocialMedia, ff_DOORDASH_c__c: v })
                            }}
                            onValidate={(v) => {
                                setValidDoordash(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_UBEREATS}
                            fieldApiName={'ff_UBEREATS_c__c'}
                            disabled={l.ff_UBEREATS_c__c}
                            url
                            onChangeText={(v) => {
                                setTempSocialMedia({ ...tempSocialMedia, ff_UBEREATS_c__c: v })
                            }}
                            onValidate={(v) => {
                                setValidUbereats(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_POSTMATES}
                            fieldApiName={'ff_POSTMATES_c__c'}
                            disabled={l.ff_POSTMATES_c__c}
                            url
                            onChangeText={(v) => {
                                setTempSocialMedia({ ...tempSocialMedia, ff_POSTMATES_c__c: v })
                            }}
                            onValidate={(v) => {
                                setValidPostmates(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        <LeadInput
                            fieldName={t.labels.PBNA_MOBILE_GRUBHUB}
                            fieldApiName={'ff_GRUBHUB_c__c'}
                            disabled={l.ff_GRUBHUB_c__c}
                            url
                            onChangeText={(v) => {
                                setTempSocialMedia({ ...tempSocialMedia, ff_GRUBHUB_c__c: v })
                            }}
                            onValidate={(v) => {
                                setValidGrubhub(v)
                            }}
                            placeholder={t.labels.PBNA_MOBILE_ENTER_WEB_LINK}
                        />
                        {renderAdditional()}
                        <TouchableOpacity
                            style={styles.addLinkBtn}
                            onPress={() => {
                                addLink()
                            }}
                            disabled={disableAdd}
                        >
                            <View style={commonStyle.flexRowAlignCenter}>
                                <View style={styles.addNewCont}>
                                    <View
                                        style={[
                                            styles.disableView,
                                            { backgroundColor: disableAdd ? '#d8d8d8' : '#00A2D9' }
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.disableAddView,
                                            { backgroundColor: disableAdd ? '#d8d8d8' : '#00A2D9' }
                                        ]}
                                    />
                                </View>
                                <CText
                                    style={{
                                        color: disableAdd ? '#d8d8d8' : '#00A2D9',
                                        fontWeight: '700'
                                    }}
                                >
                                    {t.labels.PBNA_MOBILE_ADD_NEW}
                                </CText>
                            </View>
                        </TouchableOpacity>
                    </KeyboardAwareScrollView>
                    <View style={commonStyle.flexDirectionRow}>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(changeWebSocialMediaEditModalAction())
                            }}
                            style={styles.cancelBtn}
                        >
                            <CText style={styles.cancelText}>{t.labels.PBNA_MOBILE_CANCEL.toUpperCase()}</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.saveBtn,
                                {
                                    backgroundColor: validAll ? '#6105BD' : '#FFFFFF'
                                }
                            ]}
                            onPress={() => {
                                saveData()
                            }}
                            disabled={!validAll}
                        >
                            <CText style={{ color: !validAll ? '#D3D3D3' : '#FFFFFF', fontWeight: '700' }}>
                                {t.labels.PBNA_MOBILE_SAVE}
                            </CText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default WebSocialMediaEditModal
