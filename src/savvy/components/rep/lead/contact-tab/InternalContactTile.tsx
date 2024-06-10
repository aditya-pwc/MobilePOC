import React from 'react'
import { View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { formatUTCToLocalTime } from '../../../../utils/MerchManagerUtils'
import MyTeamStyle from '../../../../styles/manager/MyTeamStyle'
import UserAvatar from '../../../common/UserAvatar'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'
import SVGPhoneMsgView from '../../../manager/common/SVGPhoneMsgView'
const styles = MyTeamStyle
const renderPhoneView = (item) => {
    return (
        <View>
            <SVGPhoneMsgView phone={item.phone} noteStyle={styles.rowWithCenter} phoneStyle={[styles.rowWithCenter]} />
        </View>
    )
}
const getFTPT = (item) => {
    let str = ''
    item.ftFlag && item.ftFlag.toString().toLowerCase() === 'false' && (str = 'PT')
    item.ftFlag && item.ftFlag.toString().toLowerCase() === 'true' && (str = 'FT')
    return str
}

const renderWStautsText = (wStatus: any, index: any) => {
    return (
        <CText
            key={index}
            style={
                wStatus.attend
                    ? [styles.fontSize_12, styles.fontWeight_700, styles.fontColor_black, styles.marginRight_8]
                    : [styles.fontSize_12, styles.fontWeight_700, styles.fontColor_lightGary, styles.marginRight_8]
            }
        >
            {wStatus.label}
        </CText>
    )
}

const renderItemContent = (props) => {
    const { item, isRoute } = props
    return (
        <View style={[styles.itemContentContainer, { marginRight: 10 }]}>
            <CText style={[styles.fontColor_black, styles.fontWeight_700, styles.fontSize_16]} numberOfLines={1}>
                {item.Name}
            </CText>
            <View style={[styles.rowCenter, styles.marginTop_6]}>
                <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                    {getFTPT(item)}
                </CText>
                {!_.isEmpty(item.title) && !_.isEmpty(getFTPT(item)) && <CText style={styles.itemLine} />}
                <CText
                    style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12, { marginRight: 20 }]}
                    numberOfLines={1}
                >
                    {item.title || ''}
                </CText>
            </View>
            {item.PERSONA_DESC !== 'Merchandiser' && (
                <View style={[styles.rowCenter, styles.marginTop_6]}>
                    <CText numberOfLines={1} ellipsizeMode={'tail'}>
                        {!_.isEmpty(item.LOCL_RTE_ID__c) && (
                            <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                                {`${isRoute ? t.labels.PBNA_MOBILE_LOCAL_ROUTE : t.labels.PBNA_MOBILE_SALES_ROUTE} ${
                                    item.LOCL_RTE_ID__c || ''
                                }`}
                            </CText>
                        )}
                        {!_.isEmpty(item.LOCL_RTE_ID__c) && !_.isEmpty(item.GTMU_RTE_ID__c) && (
                            <CText style={styles.fontColor_lightGary}>{' | '}</CText>
                        )}
                        {!_.isEmpty(item.GTMU_RTE_ID__c) && (
                            <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                                {`${t.labels.PBNA_MOBILE_NATIONAL_ID} ${item.GTMU_RTE_ID__c || ''}`}
                            </CText>
                        )}
                    </CText>
                </View>
            )}
            {item.PERSONA_DESC === 'Merchandiser' && (
                <View style={[styles.rowCenter, styles.marginTop_6]}>
                    <CText style={[styles.fontColor_gary, styles.fontWeight_400, styles.fontSize_12]}>
                        {formatUTCToLocalTime(item.startTime)}
                    </CText>
                    {!_.isEmpty(formatUTCToLocalTime(item.startTime)) && <View style={styles.itemLine} />}
                    {item.workingStatus.map((wStatus, index) => {
                        return renderWStautsText(wStatus, index)
                    })}
                </View>
            )}
        </View>
    )
}
const InternalContactTile = (params) => {
    const { item, bottomMargin, isRoute = false } = params
    return (
        <View style={[styles.teamItem, bottomMargin && { marginBottom: 50 }]}>
            <View style={[styles.teamItem_without_border, { display: 'flex', width: '100%' }]}>
                <View style={styles.userAvatar}>
                    <UserAvatar
                        userStatsId={item.userStatsId}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        avatarStyle={styles.imgUserImage}
                        userNameText={{ fontSize: 24 }}
                    />
                </View>
                {renderItemContent({ item, isRoute })}
                {renderPhoneView(item)}
            </View>
        </View>
    )
}

export default InternalContactTile
