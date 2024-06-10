/**
 * @description This component is the tile of the contact list.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React from 'react'
import { Animated, I18nManager, StyleSheet, TouchableOpacity, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { RectButton } from 'react-native-gesture-handler'
import { renderBadge, renderCall, renderEmail, renderMessage } from '../../../../helper/rep/ContactTileHelper'
import { t } from '../../../../../common/i18n/t'
import { isPersonaCRMBusinessAdmin } from '../../../../../common/enums/Persona'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import { useAppDispatch } from '../../../../redux/ReduxHooks'
const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'white',
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5%'
    },
    bottomBorderStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    containerStyle: {
        flex: 1,
        width: '100%'
    },
    leftAction: {
        flex: 1,
        backgroundColor: '#497AFC',
        justifyContent: 'center'
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'transparent',
        padding: 10
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    width180: {
        width: 180
    },
    swipeRow: {
        width: '66%',
        height: 100,
        marginTop: 20
    },
    contactName: {
        fontWeight: '900',
        fontSize: 18
    },
    contactTitle: {
        marginTop: 5,
        color: 'gray'
    },
    width33: {
        width: '33%'
    }
})

interface ContactProps {
    contact: any
    onEdit?: any
    onDelete?: any
    onClick?: any
    swipeableRows?: any
    closeOtherRows?: any
    enable: boolean
    disabledBottomLine?: any
}

const ContactTile = (props: ContactProps) => {
    const { contact, onEdit, onDelete, onClick, enable, disabledBottomLine } = props
    const dispatch = useAppDispatch()
    let swipeableRow: Swipeable
    const close = () => {
        swipeableRow?.close()
    }
    const HIT_SLOP = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
    }
    const renderRightAction = (
        text: string,
        color: string,
        x: number,
        progress: Animated.AnimatedInterpolation,
        type: string
    ) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [x, 0]
        })
        const pressHandler = () => {
            close()
            if (type === 'delete' && onDelete) {
                onDelete(contact.Id, contact._soupEntryId)
            } else if (type === 'edit' && onEdit) {
                onEdit(contact)
            }
        }

        return (
            <Animated.View style={[commonStyle.flex_1, { transform: [{ translateX: trans }] }]}>
                <View style={[styles.rightAction, { backgroundColor: color }]}>
                    <RectButton activeOpacity={0} style={[styles.rightAction]} onPress={pressHandler}>
                        <CText style={styles.actionText}>{text}</CText>
                    </RectButton>
                </View>
            </Animated.View>
        )
    }

    const renderRightActions = (progress: Animated.AnimatedInterpolation) => (
        <View
            style={[
                styles.width180,
                {
                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'
                }
            ]}
        >
            {renderRightAction(t.labels.PBNA_MOBILE_EDIT, '#2DD36F', 90, progress, 'edit')}
            {renderRightAction(t.labels.PBNA_MOBILE_DELETE, '#EB445A', 90, progress, 'delete')}
        </View>
    )

    return (
        <Swipeable
            ref={(ref) => {
                if (ref !== undefined) {
                    swipeableRow = ref
                }
            }}
            friction={1}
            containerStyle={[styles.containerStyle, !disabledBottomLine && styles.bottomBorderStyle]}
            enableTrackpadTwoFingerGesture
            rightThreshold={10}
            renderRightActions={!isPersonaCRMBusinessAdmin() && renderRightActions}
            enabled={enable}
        >
            <TouchableOpacity
                style={styles.container}
                onPress={() => {
                    onClick(contact)
                }}
            >
                <View style={styles.swipeRow}>
                    <CText style={styles.contactName} numberOfLines={1}>
                        {contact.FirstName} {contact.LastName}
                    </CText>
                    <CText style={styles.contactTitle} numberOfLines={1}>
                        {contact.Title}
                    </CText>
                    {renderBadge(contact)}
                </View>
                <View style={[commonStyle.flexRowCenter, styles.width33]}>
                    {renderEmail(contact, HIT_SLOP)}
                    {renderMessage(contact, HIT_SLOP, dispatch)}
                    {renderCall(contact, HIT_SLOP, dispatch)}
                </View>
            </TouchableOpacity>
        </Swipeable>
    )
}

export default ContactTile
