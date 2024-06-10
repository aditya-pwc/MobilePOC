import { CommonParam } from '../../../common/CommonParam'
import { formatWithTimeZone, todayDateWithTimeZone } from '../../../common/utils/TimeZoneUtils'
import { DropDownType } from '../../enum/Common'
import { AddVisitModel } from '../../interface/AddVisitModel'
import { Persona } from '../../../common/enums/Persona'
import { storeClassLog, appendLog } from '../../../common/utils/LogUtils'
import { Log } from '../../../common/enums/Log'
import { t } from '../../../common/i18n/t'
import ErrorUtils from 'common-mobile-lib/@common-mobile-lib/base-utils/src/ErrorUtils'
import { BreadcrumbVisibility, Instrumentation } from '@appdynamics/react-native-agent'
import moment from 'moment'
import { TIME_FORMAT } from '../../../common/enums/TimeFormat'
import VisitService from '../../service/VisitService'

export const getShowText = (addVisitList: Array<AddVisitModel>) => {
    return addVisitList?.length === 1 ? 'visit' : 'visit(s)'
}

export const syncAddVisits = async (
    addVisitList: Array<AddVisitModel>,
    setShowModal: Function,
    navigation: any,
    dropDownRef: any,
    setIsCreate: Function
) => {
    try {
        global.$globalModal.openModal()
        const todayDate = todayDateWithTimeZone(true)
        const now = Date.now()
        addVisitList.forEach((item) => {
            const logMsg = `User added a visit: ${CommonParam.GPID__c}-${item.Id} at ${formatWithTimeZone(
                moment(now),
                TIME_FORMAT.YMDTHMS,
                true,
                true
            )}`
            Instrumentation.leaveBreadcrumb(logMsg, BreadcrumbVisibility.CRASHES_AND_SESSIONS)
            appendLog(Log.MOBILE_INFO, 'orderade:add visit', logMsg)
        })
        await VisitService.createVisit(addVisitList, todayDate, now)

        setTimeout(() => {
            global.$globalModal.closeModal()
            setShowModal(true)
        }, 1000)
        setTimeout(() => {
            setShowModal(false)
            if (CommonParam.PERSONA__c === Persona.PSR) {
                navigation.goBack()
            }
        }, 2000)
    } catch (err) {
        setIsCreate(false)
        dropDownRef.current.alertWithType(
            DropDownType.ERROR,
            t.labels.PBNA_MOBILE_CREATE_VISIT_FAIL_ERR,
            ErrorUtils.error2String(err)
        )
        storeClassLog(
            Log.MOBILE_ERROR,
            'Orderade: Create Visit',
            `Create visit failed: ${ErrorUtils.error2String(err)}`
        )
        global.$globalModal.closeModal()
    }
}
