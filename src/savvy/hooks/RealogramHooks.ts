import { Dispatch, SetStateAction, useEffect } from 'react'
import { FORMUrlStatusEnum, FormType } from '../enums/Contract'
import { Alert, Linking } from 'react-native'
import { handleUrl } from '../helper/rep/StartNewCDAHelper'
import { storeClassLog } from '../../common/utils/LogUtils'
import { Log } from '../../common/enums/Log'
import _ from 'lodash'
import { VisitStatus } from '../enums/Visit'
import NetInfo from '@react-native-community/netinfo'
import { isPersonaSDLOrPsrOrMDOrKAM } from '../../common/enums/Persona'
import { doRealogramVisitUpdate, handleCDAOfflineFormData, updateRealogramFormVisit } from './StartNewCDAHooks'
import { restDataCommonCall } from '../api/SyncUtils'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { VisitDetail } from '../components/rep/customer/store-tab/RealogramScreen'
import { CommonApi } from '../../common/api/CommonApi'
import { t } from '../../common/i18n/t'

interface VisitDetailsDefault {
    // eslint-disable-next-line camelcase
    Status__c: VisitStatus
    // eslint-disable-next-line camelcase
    Tag_Edit_Deep_Link__c?: boolean
}

export const useListenRealogramFormUrl = (
    visitId: string,
    setVisitStatus: Dispatch<SetStateAction<VisitStatus>>,
    isEditForm: boolean,
    setVisitDetails: Dispatch<SetStateAction<any>>,
    visitDetails: VisitDetail
) => {
    useEffect(() => {
        if (visitId) {
            const linkEmit = Linking.addEventListener('url', (e) => {
                if (e.url === CommonApi.PBNA_MOBILE_SAVVY_SCHEME + visitDetails.Mission_Response_ID__c) {
                    doRealogramVisitUpdate(visitId, visitDetails.Mobile_Unique_ID__c, isEditForm)
                        .then(() => {
                            setTimeout(() => {
                                setVisitStatus(VisitStatus.IN_PROGRESS)
                                setVisitDetails({
                                    ...visitDetails,
                                    Status__c: VisitStatus.IR_PROCESSING,
                                    Tag_Edit_Deep_Link__c: true
                                })
                            }, 1000)
                        })
                        .catch((e) => {
                            Alert.alert(t.labels.PBNA_MOBILE_LOW_CONNECTIVITY)
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'useListenRealogramFormUrl-Mission-Response',
                                ` ${ErrorUtils.error2String(e)}`
                            )
                        })
                } else {
                    const { status, mobileUniqueId } = handleUrl(JSON.stringify(e))

                    if (status === FORMUrlStatusEnum.COMPLETED) {
                        setVisitStatus(VisitStatus.IR_PROCESSING)

                        const defaultVisitDetails: VisitDetailsDefault = {
                            Status__c: VisitStatus.IR_PROCESSING
                        }

                        if (isEditForm) {
                            defaultVisitDetails.Tag_Edit_Deep_Link__c = true
                        }

                        setVisitDetails({
                            ...visitDetails,
                            ...defaultVisitDetails
                        })
                        if (!_.isEmpty(mobileUniqueId)) {
                            NetInfo.fetch().then(async (state) => {
                                if (isPersonaSDLOrPsrOrMDOrKAM() && !state.isInternetReachable) {
                                    await handleCDAOfflineFormData(
                                        visitId,
                                        mobileUniqueId,
                                        FormType.Realogram,
                                        isEditForm
                                    )
                                } else {
                                    await updateRealogramFormVisit(visitId, setVisitStatus, mobileUniqueId, isEditForm)
                                }
                            })
                        } else {
                            storeClassLog(
                                Log.MOBILE_ERROR,
                                'There is no mobileUniqueId useListenRealogramFormUrl',
                                ` ${ErrorUtils.error2String(e)}`
                            )
                        }
                    }
                }
            })
            return () => {
                linkEmit && linkEmit.remove()
            }
        }
    }, [visitId, isEditForm])
}

export const useVisitDetails = (
    visitId: string,
    setVisitDetails: Dispatch<SetStateAction<any>>,
    setIsEditForm: Dispatch<SetStateAction<any>>
) => {
    const getVisitDetails = (visitId: string) => {
        restDataCommonCall(
            `query/?q=
        SELECT Id,Tag_Edit_Deep_Link__c,Mobile_Unique_ID__c,Status__c,Mission_Response_ID__c
        From Visit
        WHERE Id = '${visitId}'
        `,
            'GET'
        )
            .then((res) => {
                if (!_.isEmpty(res?.data?.records)) {
                    const details = res?.data?.records[0]
                    setVisitDetails(details)
                    setIsEditForm(!!details.Mobile_Unique_ID__c)
                }
            })
            .catch((err) => {
                storeClassLog(Log.MOBILE_ERROR, 'useVisitDetails', ErrorUtils.error2String(err))
            })
    }

    useEffect(() => {
        getVisitDetails(visitId)
    }, [visitId])
}
