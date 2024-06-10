import React, { useState } from 'react'
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { LeadStatus } from '../../../../enums/Lead'
import CText from '../../../../../common/components/CText'
import HeaderCircle from '../HeaderCircle'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { t } from '../../../../../common/i18n/t'
import {
    Persona,
    isPersonaCRMBusinessAdmin,
    isPersonaFSManager,
    isPersonaKAM,
    judgePersona
} from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { CommonParam } from '../../../../../common/CommonParam'

const styles = StyleSheet.create({
    overlayStyle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0
    },
    addTile: {
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        height: 40,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 15,
        shadowColor: '#87939E',
        marginTop: 5,
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        justifyContent: 'flex-end'
    },
    safeAreaStyle: {
        justifyContent: 'flex-end',
        flexDirection: 'column',
        position: 'absolute',
        right: '5%'
    },
    rowFlexEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    rowTop_6: {
        flexDirection: 'row',
        marginTop: 6
    },
    flexEnd_95: {
        width: '95%',
        justifyContent: 'flex-end'
    },
    addIconStyle: {
        width: 18,
        height: 18
    },
    fontWeight700: {
        fontWeight: '700'
    },
    left10: {
        left: 10
    },
    width5Percent: {
        width: '5%'
    },
    width10Percent: {
        width: '10%'
    }
})

interface LeadFloatButtonProps {
    headerCircleColor: any
    onPressContact?: any
    onPressCall?: any
    onNewTask?: any
    onPressChangeOfOwnership?: any
    showChangeOfOwnership?: boolean
    onAddVisits?: any
    showAddContact?: boolean
    customer?: boolean
    l: any
}

const LeadFloatButton = (props: LeadFloatButtonProps) => {
    const {
        headerCircleColor,
        onPressContact,
        onPressCall,
        onNewTask,
        onAddVisits,
        onPressChangeOfOwnership,
        showChangeOfOwnership = false,
        showAddContact = true,
        l
    } = props
    const [showMoreButtons, setShowMoreButtons] = useState(false)
    const renderHeaderCircle = () => {
        if (showMoreButtons) {
            return (
                <HeaderCircle
                    onPress={() => setShowMoreButtons(false)}
                    transform={[{ scale: 1 }, { rotate: '45deg' }]}
                    color={headerCircleColor}
                />
            )
        }
        return (
            <HeaderCircle
                transform={[{ scale: 1 }]}
                color={headerCircleColor}
                onPress={() => {
                    setShowMoreButtons(true)
                }}
            />
        )
    }

    const showLogCall = () => {
        return (
            (!isPersonaCRMBusinessAdmin() && !isPersonaKAM() && l.Status__c !== LeadStatus.OPEN) ||
            (l.Status__c === LeadStatus.OPEN &&
                (judgePersona([Persona.FSR, Persona.PSR, Persona.FS_MANAGER]) || CommonParam.leadFuncBundle))
        )
    }

    return (
        <View style={styles.overlayStyle} pointerEvents="box-none">
            {showMoreButtons && (
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.overlayStyle}
                    onPress={() => {
                        setShowMoreButtons(false)
                    }}
                />
            )}

            <SafeAreaView style={styles.safeAreaStyle}>
                <View style={styles.rowFlexEnd}>
                    <View style={styles.rowTop_6}>{renderHeaderCircle()}</View>

                    {showMoreButtons && (
                        <View style={commonStyle.alignItemsEnd}>
                            {onAddVisits && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowMoreButtons(false)
                                        onAddVisits()
                                    }}
                                >
                                    <View style={[styles.addTile, { width: 240, marginTop: 8 }]}>
                                        <View style={styles.flexEnd_95}>
                                            <CText style={styles.fontWeight700}>
                                                {t.labels.PBNA_MOBILE_ADD_RECURRING_VISITS.toUpperCase()}
                                            </CText>
                                        </View>
                                        <View style={styles.width5Percent}>
                                            <Image style={styles.addIconStyle} source={ImageSrc.ICON_ADD} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            {showLogCall() && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowMoreButtons(false)
                                        if (onPressCall) {
                                            onPressCall()
                                        }
                                    }}
                                >
                                    <View style={styles.addTile}>
                                        <CText style={styles.fontWeight700}>
                                            {t.labels.PBNA_MOBILE_LOG_SCHEDULE_CALL.toUpperCase()}
                                        </CText>
                                        <View style={styles.left10}>
                                            <Image style={styles.addIconStyle} source={ImageSrc.ICON_ADD} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            {((showAddContact && !isPersonaFSManager()) ||
                                (isPersonaFSManager() && l?.Status__c === LeadStatus.OPEN)) && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowMoreButtons(false)
                                        onPressContact()
                                    }}
                                >
                                    <View style={[styles.addTile, { width: 190, marginTop: 8 }]}>
                                        <View style={styles.flexEnd_95}>
                                            <CText style={styles.fontWeight700}>
                                                {t.labels.PBNA_MOBILE_ADD_NEW_CONTACT.toUpperCase()}
                                            </CText>
                                        </View>
                                        <View style={styles.width5Percent}>
                                            <Image style={styles.addIconStyle} source={ImageSrc.ICON_ADD} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {!isPersonaFSManager() &&
                                !isPersonaCRMBusinessAdmin() &&
                                l.Status__c !== LeadStatus.NO_SALE &&
                                l.Status__c !== LeadStatus.OPEN &&
                                onNewTask && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowMoreButtons(false)
                                            onNewTask && onNewTask()
                                        }}
                                    >
                                        <View style={[styles.addTile, { width: 115, marginTop: 8 }]}>
                                            <View style={styles.flexEnd_95}>
                                                <CText style={styles.fontWeight700}>
                                                    {t.labels.PBNA_MOBILE_NEW_TASK.toUpperCase()}
                                                </CText>
                                            </View>
                                            <View style={styles.width10Percent}>
                                                <Image style={styles.addIconStyle} source={ImageSrc.ICON_ADD} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            {showChangeOfOwnership && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowMoreButtons(false)
                                        onPressChangeOfOwnership && onPressChangeOfOwnership()
                                    }}
                                >
                                    <View style={[styles.addTile, { width: 230, marginTop: 8 }]}>
                                        <View style={styles.flexEnd_95}>
                                            <CText style={styles.fontWeight700}>
                                                {t.labels.PBNA_MOBILE_CHANGE_OF_OWNERSHIP.toUpperCase()}
                                            </CText>
                                        </View>
                                        <View style={styles.width5Percent}>
                                            <Image style={styles.addIconStyle} source={ImageSrc.ICON_ADD} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    )
}

export default LeadFloatButton
