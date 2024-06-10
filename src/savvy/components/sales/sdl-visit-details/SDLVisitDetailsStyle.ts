/*
 * @Date: 2022-01-13 02:59:19
 * @LastEditors: Matthew Huang
 * @LastEditTime: 2022-03-01 13:12:54
 */
import { StyleSheet } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import { commonStyle } from '../../../../common/styles/CommonStyle'

export const styles = StyleSheet.create({
    ...commonStyle,
    marginTop21: {
        minHeight: 180,
        paddingHorizontal: 22
    },
    marginBottom20: {
        marginBottom: 20
    },
    statisticsTitleStyle: {
        color: '#565656',
        fontSize: 12,
        marginBottom: 4
    },
    statisticsColumnStyle: {
        flex: 1,
        alignItems: 'flex-start',
        paddingVertical: 15
    },
    statisticsSubTitleStyle: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16
    },
    statisticsSubTitleRight: {
        marginRight: 10
    },
    statisticsSubTitleContain: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    cellContainStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 22
    },
    paddingHorizontal: {
        paddingHorizontal: 22
    },
    sumView: {
        backgroundColor: '#FFFFFF',
        paddingBottom: 70
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 30
    },
    accordionContain: {
        width: '100%',
        borderBottomWidth: 1,
        backgroundColor: '#FFF',
        borderBottomColor: '#D3D3D3'
    },
    driverCardContain: {
        marginTop: -57,
        marginBottom: -10
    },
    visitCardContain: {
        marginTop: -35
    },
    clockContainer: {
        width: 164,
        height: 50,
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    clockImg: {
        width: 22,
        height: 22
    },
    clockContent: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20
    },
    clockTime: {
        color: '#000000',
        fontWeight: '700',
        fontSize: 12
    },
    clockStatus: {
        fontWeight: '400'
    },
    lineView: {
        height: 16,
        width: 1,
        marginHorizontal: 5,
        backgroundColor: '#D3D3D3'
    },
    clockContain: {
        alignItems: 'flex-end',
        paddingHorizontal: 22,
        marginTop: 30
    },
    flexDirectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    selectLabel: {
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    typeLabel: {
        lineHeight: 44,
        fontSize: baseStyle.fontSize.fs_14,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    selectValue: {
        color: baseStyle.color.black
    },
    subTitle: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_400,
        color: baseStyle.color.titleGray
    },
    selectedContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
    },
    flexRowAlignCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    marginBottom_30: {
        marginBottom: 30
    },
    flexSelectRow: {
        height: 50,
        marginTop: 10,
        borderBottomColor: baseStyle.color.borderGray,
        alignItems: 'center'
    },
    flexRow: {
        height: 16,
        marginBottom: 30,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    subtypeCell: {
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        marginBottom: 10,
        marginRight: 10,
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 15
    },
    instructionsText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: baseStyle.fontSize.fs_16
    },
    alignItemsCenter: {
        alignItems: 'center'
    },
    orderStateContainer: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 10
    },
    casesContainer: {
        flex: 1,
        marginRight: 30
    },
    marginBottom_4: {
        marginBottom: 4
    },
    casesSoldContainer: {
        flex: 1,
        marginRight: 40
    },
    flex_1: {
        flex: 1
    },
    activityIndicatorStyle: {
        marginLeft: 20,
        marginRight: 'auto'
    },
    flexBox: {
        display: 'flex'
    },
    hiddenBox: {
        display: 'none'
    }
})
