import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { PopupMenu } from '../../../common/PopupMenu'
import { t } from '../../../../../../common/i18n/t'
import { ActiveTabName } from '../../../../../pages/rep/customer/CustomerDetailScreen'
import { setPriorityNoSaleControl, setRedirectAction } from '../../../../../redux/Slice/CustomerDetailSlice'
import { updateStorePriorityStatus } from '../../../../../helper/rep/PriorityArchiveHelper'
import moment from 'moment'

interface PriorityProductMenuProps extends React.PropsWithChildren {
    retailStoreId: string
    /* eslint-disable camelcase */
    priority: {
        [key: string]: unknown
        Id: string
        // Disable the eslint because the field is from DB
        Card_Title__c: string
        Start_Date__c: string
    }
    storePriority: {
        [key: string]: any
        is_executed__c: string
        AddedToCart__c: string
        Status__c: string
        StartDate__c: string
    }
    /* eslint-enable camelcase */
}

export const PriorityProductMenu: React.FC<PriorityProductMenuProps> = ({ retailStoreId, priority, storePriority }) => {
    const navigation = useNavigation()
    const dispatch = useDispatch()

    if (storePriority.is_executed__c === '1') {
        return null
    }

    // [MENU] => Snooze
    const menuOptions = [
        {
            label: t.labels.PBNA_MOBILE_IP_SNOOZE.toUpperCase(),
            disabled: true
        }
    ]

    // [MENU] => No Sale
    if (storePriority.Status__c === 'Action') {
        menuOptions.push({
            label: t.labels.PBNA_MOBILE_NO_SALE.toUpperCase(),
            onSelect: async () => {
                const today = moment()

                await updateStorePriorityStatus(retailStoreId, 'No Sale', priority.Id)

                if (storePriority.AddedToCart__c === '1' && moment(priority.Start_Date__c).isAfter(today, 'day')) {
                    const actionData = {
                        retailStoreId,
                        priority,
                        storePriority
                    }
                    dispatch(setRedirectAction({ type: 'reloadPriorities', data: actionData }))
                    dispatch(setRedirectAction({ type: 'goToArchive', data: actionData }))
                    dispatch(setRedirectAction({ type: 'archivedPriorityNoSaleShowMessage', data: actionData }))
                    const navigateArgs = [
                        'CustomerDetailScreen',
                        {
                            customer: { AccountId: retailStoreId },
                            readonly: true,
                            tab: ActiveTabName.SALES_ACTIONS
                        }
                    ] as never
                    navigation.navigate(...navigateArgs)
                } else {
                    // set Status__c=<No Sale>; Date_NoSale__c=<Today>
                    dispatch(setPriorityNoSaleControl({ id: priority.Id, visited: false }))

                    const navigateArgs = [
                        'CustomerDetailScreen',
                        {
                            customer: { AccountId: retailStoreId },
                            readonly: true,
                            tab: ActiveTabName.SALES_ACTIONS,
                            actionType: 'priorityNoSale',
                            actionData: {
                                retailStoreId,
                                priority
                            }
                        }
                    ] as never
                    navigation.navigate(...navigateArgs)
                }
            }
        })
    } else if (storePriority.Status__c === 'No Sale' && storePriority.is_executed__c !== '1') {
        // [MENU] => Retrieve
        menuOptions.push({
            label: t.labels.PBNA_MOBILE_IP_RETRIEVE.toLocaleUpperCase(),
            onSelect: async () => {
                // go to archive and use Event<archivedPriorityRetrieveShowDialog> to reuse the retrieve actions
                //  - go to archive page
                //  - on that page
                //    - handle archivedPriorityRetrieveShowDialog to process Retrieve menu action
                const actionData = {
                    retailStoreId,
                    priority,
                    storePriority
                }
                dispatch(setRedirectAction({ type: 'goToArchive', data: actionData }))
                dispatch(setRedirectAction({ type: 'archivedPriorityRetrieveShowDialog', data: actionData }))

                const navigateArgs = [
                    'CustomerDetailScreen',
                    {
                        customer: { AccountId: retailStoreId },
                        readonly: true,
                        tab: ActiveTabName.SALES_ACTIONS
                    }
                ] as never
                navigation.navigate(...navigateArgs)
            }
        })
    }

    return <PopupMenu menuOptions={menuOptions} />
}
