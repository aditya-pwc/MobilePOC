/**
 * @description Helper to handle the notification logic.
 * @author Shangmin Dou
 */
import { Instrumentation } from '@appdynamics/react-native-agent'
import { SoupService } from '../../service/SoupService'
import { compositeQueryObjsBySoql } from '../../api/SyncUtils'
import { genSingleLeadCompositeGroup } from '../../api/composite-template/LeadCompositeTemplate'
import {
    genSingleRetailStoreCompositeGroup,
    genSingleRetailStoreRelationshipCompositeGroup
} from '../../api/composite-template/RetailStoreCompositeTemplate'
import { Log } from '../../../common/enums/Log'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { FormNotificationType, RealogramNotificationType, VisitSubtypeEnum } from '../../enums/Contract'
import { t } from '../../../common/i18n/t'
import { goToAuditAndContractTab, goToRealogramScreen } from './AuditHelper'
import { ActiveTabName } from '../../pages/rep/customer/CustomerDetailScreen'
import { storeClassLog } from '../../../common/utils/LogUtils'

const SR_CLICKS_NOTIFICATIONS = 'FSR/PSR clicks notifications'

const checkAndSyncLead = async (target) => {
    const data = await SoupService.retrieveDataFromSoup(
        'Lead__x',
        {},
        ['Id'],
        `SELECT {Lead__x:Id} FROM {Lead__x} WHERE Id='${target}'`
    )
    if (data.length === 0) {
        const res = await compositeQueryObjsBySoql(genSingleLeadCompositeGroup(target))
        if (res.data[0].body.records.length === 0) {
            throw new Error('No Lead')
        }
    }
}

const handleRequestRejected = async (target, navigation) => {
    global.$globalModal.openModal()
    try {
        await checkAndSyncLead(target)
        navigation.navigate('LeadDetailScreen', {
            lead: { Id: target },
            goBackDP: false,
            fromNotification: true,
            tab: 3
        })
        global.$globalModal.closeModal()
    } catch (e) {
        global.$globalModal.closeModal()
    }
}

const handleLeadInactivity = async (target, navigation) => {
    global.$globalModal.openModal()
    try {
        await checkAndSyncLead(target)
        navigation.navigate('LeadDetailScreen', {
            lead: { Id: target },
            goBackDP: false,
            fromNotification: true
        })
        global.$globalModal.closeModal()
    } catch (e) {
        global.$globalModal.closeModal()
    }
}

const handleLeadActionRequired = async (target, navigation) => {
    await handleLeadInactivity(target, navigation)
}

const handleLeadWon = async (target, navigation, isActionRequired, activeTab = 'EQUIPMENT') => {
    try {
        const queryRetailStore =
            'SELECT {RetailStore:Id} FROM {RetailStore} WHERE' + ` {RetailStore:AccountId}='${target}'`
        const retailStores = await SoupService.retrieveDataFromSoup('RetailStore', {}, ['Id'], queryRetailStore)
        if (retailStores.length === 0) {
            const { data } = await compositeQueryObjsBySoql(genSingleRetailStoreCompositeGroup(target))
            if (data[0].body.records.length === 0) {
                const groupRes = await compositeQueryObjsBySoql(genSingleRetailStoreRelationshipCompositeGroup(target))
                if (groupRes.data[0].body.records.length > 0) {
                    navigation.navigate(
                        'CustomerDetailScreen',
                        isActionRequired
                            ? {
                                  customer: { AccountId: target },
                                  tab: activeTab,
                                  needDelete: true
                              }
                            : {
                                  customer: { AccountId: target },
                                  needDelete: true
                              }
                    )
                }
            } else {
                await compositeQueryObjsBySoql(genSingleRetailStoreRelationshipCompositeGroup(target))
                navigation.navigate(
                    'CustomerDetailScreen',
                    isActionRequired
                        ? {
                              customer: { AccountId: target },
                              tab: activeTab
                          }
                        : { customer: { AccountId: target } }
                )
            }
        } else {
            navigation.navigate(
                'CustomerDetailScreen',
                isActionRequired
                    ? {
                          customer: retailStores[0],
                          tab: activeTab
                      }
                    : { customer: retailStores[0] }
            )
        }
    } catch (e) {
        storeClassLog(Log.MOBILE_ERROR, 'handleLeadWon', 'handleLeadWon: ' + ErrorUtils.error2String(e))
    }
}

export const handleGoToDetailScreen = async (item, navigation) => {
    const target = item.target
    const retailStoreId = item?.jsonBody?.RetailStoreId
    const cType = item.jsonBody.CType || JSON.parse(item.jsonBody).CType
    if (cType === 'REJECT') {
        await handleRequestRejected(target, navigation)
        Instrumentation.stopTimer(SR_CLICKS_NOTIFICATIONS)
        return
    }
    if (cType === 'INAC') {
        await handleLeadInactivity(target, navigation)
        Instrumentation.stopTimer(SR_CLICKS_NOTIFICATIONS)
        return
    }
    if (cType === 'ACTIONR') {
        await handleLeadActionRequired(target, navigation)
        Instrumentation.stopTimer(SR_CLICKS_NOTIFICATIONS)
        return
    }
    if (cType === 'DRAFT') {
        await handleLeadWon(target, navigation, true)
        Instrumentation.stopTimer(SR_CLICKS_NOTIFICATIONS)
        return
    }
    if (cType === 'REQAPP') {
        await handleLeadWon(target, navigation, false)
        Instrumentation.stopTimer(SR_CLICKS_NOTIFICATIONS)
        return
    }
    if (cType === 'CREATED') {
        await handleLeadWon(target, navigation, false)
        Instrumentation.stopTimer(SR_CLICKS_NOTIFICATIONS)
        return
    }
    if (cType === 'REQCHA') {
        await handleLeadWon(target, navigation, false)
        Instrumentation.stopTimer(SR_CLICKS_NOTIFICATIONS)
    }
    if (cType === FormNotificationType.FORM_KPI) {
        await goToAuditAndContractTab({ navigation, retailStoreId })
        return
    }
    if (cType === FormNotificationType.NOT_LOAD) {
        await goToAuditAndContractTab({ navigation, retailStoreId })
    }
    if (cType === 'REJECTEDPG') {
        await handleLeadWon(target, navigation, true, ActiveTabName.PROFILE)
    }
    if ([RealogramNotificationType.REALOGRAM, RealogramNotificationType.IRNotLoad].includes(cType)) {
        await goToRealogramScreen({ navigation, retailStoreId })
    }
}

export const getAuditVisitTypeLabel = (visitType: string) => {
    if (visitType === VisitSubtypeEnum.POST_CONTRACT_AUDIT) {
        return t.labels.PBNA_MOBILE_FORM_AUDIT_TYPE_POST
    }
    return t.labels.PBNA_MOBILE_FORM_AUDIT_TYPE_GENERAL
}
