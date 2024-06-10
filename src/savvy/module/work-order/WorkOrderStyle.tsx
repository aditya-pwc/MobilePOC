/*
 * @Description:WorkOrderStyle
 * @Author: Mary Qian
 * @Date: 2021-08-19 03:26:54
 * @LastEditTime: 2022-12-12 09:59:58
 * @LastEditors: Mary Qian
 */

import { StyleSheet } from 'react-native'
import Utils from '../../common/DateTimeUtils'
import { commonStyle } from '../../../common/styles/CommonStyle'

export const workOrderStyles = StyleSheet.create({
    ...commonStyle,
    // WorkOrderHeader Start
    workOrderTitle: {
        fontWeight: '700',
        textTransform: 'uppercase',
        fontSize: 12
    },
    workOrderBadge: {
        marginLeft: 7,
        borderColor: '#D3D3D3',
        borderWidth: 1,
        width: 22,
        height: 22,
        backgroundColor: '#FFF',
        borderRadius: 11
    },
    workOrderNum: {
        fontWeight: '700',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 20
    },
    // WorkOrderHeader End
    // WorkOrderList Start
    content: {
        marginRight: Utils.isTablet ? 80 : 22,
        marginLeft: Utils.isTablet ? 80 : 22
    },
    fullWidth: {
        marginRight: Utils.isTablet ? -80 : -22,
        marginLeft: Utils.isTablet ? -80 : -22
    },
    // WorkOrderList End
    // WorkOrderCard Start
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        width: '100%',
        position: 'relative'
    },
    workOrderContainer: {
        padding: Utils.isTablet ? 80 : 22,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        backgroundColor: '#FFF'
    },
    // WorkOrderCard End
    // WorkOrder Brief Start
    boxContentTextArea: {
        flex: 1,
        flexShrink: 1,
        flexDirection: 'column'
    },
    shelfTitle: {
        fontWeight: '900',
        fontSize: 18
    },
    icon: {
        width: 28,
        height: 28
    },
    iconLocation: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 14,
        right: 10
    },
    upDownArrow: {
        marginRight: 10
    },
    // WorkOrder Brief End
    // Common Start
    labelStyle: {
        color: '#565656',
        fontSize: 12
    },
    propertyStyle: {
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingBottom: 15,
        width: '50%'
    },
    valueStyle: {
        color: '#000',
        paddingTop: 4,
        fontSize: 14
    },
    boldValueStyle: {
        color: '#000',
        paddingTop: 4,
        fontWeight: '700',
        fontSize: 16
    },
    // Common End
    // WorkOrder Detail Info Start
    baseLine: {
        alignItems: 'baseline'
    },
    description: {
        marginTop: 15,
        marginBottom: 15,
        fontSize: 14,
        color: '#565656'
    },
    referencePhotoContainer: {
        flexDirection: 'row',
        flex: 1,
        marginBottom: 15,
        width: '100%'
    },
    referenceImg: {
        width: 40,
        height: 40,
        marginRight: 10
    },
    // WorkOrder Detail Info End
    // WorkOrder Product Start
    flavorName: {
        color: '#565656',
        fontSize: 14
    },
    qtyValue: {
        color: '#000',
        fontSize: 12,
        fontWeight: '700'
    },
    timelineProductContainer: {
        width: '100%',
        height: 50,
        marginBottom: 15
    },
    timelineProductValueContainer: {
        width: '100%',
        height: 20,
        marginTop: 5,
        marginBottom: 10,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center'
    },
    // WorkOrder Product End
    // WorkOrder Comments Start
    commentStyle: {
        color: '#000',
        paddingTop: 10,
        fontSize: 14,
        width: '100%'
    },
    underLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    // WorkOrder Comments End
    // WorkOrder Take Picture Start
    takePhotoContainer: {
        width: '100%',
        marginTop: 15,
        marginBottom: 15
    },
    takePhotoIcon: {
        height: 18,
        width: 22,
        marginRight: 10
    },
    takePhotoTitle: {
        color: '#00A2D9',
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    executionPhotoContainer: {
        marginLeft: 'auto',
        flexDirection: 'row'
    },
    photoImg: {
        width: 40,
        height: 40,
        marginLeft: 10,
        borderRadius: 5
    },
    // WorkOrder Execution Photo For Timeline Start
    exePhotoForTimelineWrapper: {
        width: '100%',
        marginTop: 15,
        marginBottom: 15
    },
    exePhotoTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000'
    },
    exePhoto: {
        width: 30,
        height: 30
    },
    // WorkOrder Execution Photo For Timeline End
    // WorkOrder Take Picture End
    // WorkOrder Mark Complete Start
    chat: {
        height: 18,
        width: 18
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#3D3D3D',
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    titleStyle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFF',
        textTransform: 'uppercase',
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 45,
        width: '100%'
    },
    buttonStyle: {
        height: 44,
        width: '100%',
        fontSize: 12,
        fontWeight: '700',
        borderRadius: 5
    },
    completedStyle: {
        backgroundColor: '#E5E5E5',
        color: '#000'
    },
    uncompletedStyle: {
        backgroundColor: '#00A2D9'
    },
    // WorkOrder Mark Complete End
    // WorkOrder timeline Start
    timelineWrapper: {
        bottom: 0
    },
    // WorkOrder timeline End
    workOrderContent: {
        width: '100%',
        marginTop: 20
    }
})
