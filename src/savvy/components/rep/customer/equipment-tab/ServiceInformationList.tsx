/**
 * @description The component to show common service information tile.
 * @author Kiren Cao
 * @date 2021-11-20
 */
import React, { FC, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import CText from '../../../../../common/components/CText'
import { renderServiceInformationTile } from '../../../../helper/rep/CustomerHelper'
import PickerTile from '../../lead/common/PickerTile'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'
import { Request } from '../../../../interface/RequstInterface'

interface ServiceInformationTileProps {
    serviceDraftList: Array<Request>
    serviceSubmittedList: Array<Request>
    serviceCancelledList: Array<Request>
    serviceClosedList: Array<Request>
    serviceFailedList: Array<Request>
    onClick: Function
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginTop: 20
    }
})
const ServiceInformationList: FC<ServiceInformationTileProps> = (props: ServiceInformationTileProps) => {
    const {
        serviceDraftList,
        serviceSubmittedList,
        serviceCancelledList,
        serviceClosedList,
        serviceFailedList,
        onClick
    } = props
    const [requestType, setRequestType] = useState(0)
    const serviceRequestOption = [
        t.labels.PBNA_MOBILE_ALL_SERVICE_REQUEST,
        t.labels.PBNA_MOBILE_ONSITE_MOVE,
        t.labels.PBNA_MOBILE_EXCHANGE,
        t.labels.PBNA_MOBILE_PICKUP,
        t.labels.PBNA_MOBILE_REPAIR
    ]
    const [serviceInfoList, setServiceInfoList] = useState([])
    const serviceList = _.cloneDeep(
        _.compact(
            _.concat(serviceDraftList, serviceSubmittedList, serviceCancelledList, serviceClosedList, serviceFailedList)
        )
    )
    const checkType = (value, list, type, secondType?) => {
        if (_.isEqual(value.equip_move_type_cde__c, type) || _.isEqual(value.equip_move_type_cde__c, secondType)) {
            list.push(value)
            list.push('p')
        }
    }
    useEffect(() => {
        const tempList = []
        if (requestType === 1 || requestType === 0) {
            serviceList.forEach((v) => {
                checkType(v, tempList, 'ONS')
            })
        }
        if (requestType === 2 || requestType === 0) {
            serviceList.forEach((v) => {
                checkType(v, tempList, 'EXI', 'EXP')
            })
        }
        if (requestType === 3 || requestType === 0) {
            serviceList.forEach((v) => {
                checkType(v, tempList, 'PIC')
            })
        }
        if (requestType === 4 || requestType === 0) {
            serviceList.forEach((v) => {
                checkType(v, tempList, 'Repair')
            })
        }
        tempList.pop()
        setServiceInfoList(tempList)
    }, [
        serviceDraftList,
        serviceSubmittedList,
        serviceCancelledList,
        serviceClosedList,
        serviceFailedList,
        requestType
    ])
    return (
        <View>
            <View style={styles.container}>
                <CText
                    style={{
                        fontSize: t.labels.PBNA_MOBILE_SERVICE_INFORMATION.length > 20 ? 12 : 14,
                        fontWeight: '700',
                        marginTop: 10
                    }}
                >
                    {t.labels.PBNA_MOBILE_SERVICE_INFORMATION.toUpperCase()}
                </CText>
                <PickerTile
                    data={[
                        `-- ${t.labels.PBNA_MOBILE_SELECT_REQUEST_TYPE.toUpperCase()} --`,
                        ...serviceRequestOption.map((v) => {
                            return v
                        })
                    ]}
                    containerStyle={{
                        width: t.labels.PBNA_MOBILE_SERVICE_INFORMATION.length > 20 ? '45%' : '40%',
                        alignItems: 'flex-end'
                    }}
                    disabled={false}
                    label={''}
                    defValue={t.labels.PBNA_MOBILE_ALL_SERVICE_REQUEST}
                    placeholder={t.labels.PBNA_MOBILE_SELECT}
                    required
                    noPaddingHorizontal
                    onDone={(v: any) => {
                        setRequestType(_.indexOf(serviceRequestOption, v))
                    }}
                    borderStyle={{}}
                    title={t.labels.PBNA_MOBILE_REQUEST_TYPE}
                    inputStyle={{ fontSize: serviceRequestOption[requestType].length > 20 ? 10 : 14 }}
                />
            </View>
            {renderServiceInformationTile(serviceInfoList, onClick)}
        </View>
    )
}

export default ServiceInformationList
