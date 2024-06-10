/**
 * @description Survey Questions Style.
 * @author Sylvia Yuan
 * @email yue.yuan@pwc.com
 * @date 2023-07-31
 */

import { baseStyle } from '../../../common/styles/BaseStyle'
import { StyleSheet } from 'react-native'
import SurveyQuestionsStyle from './SurveyQuestionsStyle'

const AuditStyle = StyleSheet.create({
    ...SurveyQuestionsStyle,
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },

    listViewContainer: {
        paddingTop: 37,
        marginHorizontal: 22
    },
    stepOne: {
        width: 150,
        paddingLeft: 22,
        justifyContent: 'center',
        height: 60,
        backgroundColor: baseStyle.color.bgGray
    },
    stepTwo: {
        width: 185,
        marginLeft: -20,
        justifyContent: 'center',
        paddingLeft: 27,
        zIndex: -1,
        height: 60,
        backgroundColor: baseStyle.color.bgGray
    },
    stepThree: {
        width: 155,
        left: -20,
        justifyContent: 'center',
        paddingLeft: 30,
        zIndex: -5,
        height: 60,
        backgroundColor: baseStyle.color.bgGray
    },
    sectionBox: {
        paddingHorizontal: 22,
        marginTop: 20,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    actualBox: {
        flexDirection: 'row',
        alignItems: 'flex-end'
        // marginLeft: 46
    },
    actualText: {
        width: 60,
        height: 30
    },
    iconSectionBox: {
        width: 66,
        height: 85,
        borderWidth: 1,
        borderColor: '#C8D6FF',
        backgroundColor: '#E4EBFF',
        paddingHorizontal: 6,
        paddingVertical: 15
    },
    iconBox: {
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contractText: {
        fontSize: 12,
        color: '#514F4D'
    },
    width110: {
        width: 110
    },
    flexRowItem: {
        flex: 1,
        marginRight: 0
    },
    noMarginRight: {
        marginRight: 0
    },
    marginRight22: {
        marginRight: 22
    },
    flexRowWithSpaceBetween: {
        justifyContent: 'space-between',
        flex: 1,
        marginRight: 15
    },
    executionKpiRowView: {
        flexDirection: 'row',
        marginBottom: 1,
        justifyContent: 'space-between',
        marginHorizontal: 22,
        display: 'flex'
    },
    executionKpiRowCustomColumnBox: {
        flexWrap: 'wrap',
        marginRight: 15,
        flex: 1,
        flexDirection: 'column'
    },
    executionKpiRowCustomContainer: {
        justifyContent: 'space-between',
        width: '100%',
        marginRight: 0
    },
    executionKpiRowMedalData: {
        flexDirection: 'column',
        width: 66
    },
    competitorContainer: {
        justifyContent: 'space-between',
        backgroundColor: '#F2F4F7',
        paddingHorizontal: 22
    },

    actualCompetitorCustomContainer: {
        justifyContent: 'space-between',
        flex: 1,
        marginRight: 0
    },
    rewardsBox: {
        backgroundColor: '#F2F4F7',
        paddingHorizontal: 22,
        alignItems: 'center',
        height: 110,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    fastImage: {
        width: 300,
        flexDirection: 'row',
        alignItems: 'center'
    },
    POGBox: {
        backgroundColor: '#F2F4F7',
        width: '100%',
        height: 80,
        marginTop: 10,
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    POGText: {
        fontSize: 12,
        paddingRight: 10,
        lineHeight: 14,
        color: '#00A2D9',
        fontWeight: '800'
    },
    comparisonBox: {
        flexDirection: 'row',
        marginHorizontal: 22,
        marginTop: 20,
        justifyContent: 'space-between'
    },
    docImage: {
        marginRight: 14,
        width: 20,
        height: 25
    },
    auditTableRowInput: {
        paddingRight: 0,
        width: 60,
        height: 40,
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: baseStyle.color.white,
        borderColor: baseStyle.color.borderGray
    },
    auditTableRowInputContainer: {
        color: 'rgba(255,255,255)'
    },
    auditTableRowGreenInput: {
        borderColor: baseStyle.color.green
    },
    auditTableRowRedInput: {
        borderColor: baseStyle.color.red
    },
    auditTableRowHeaderView: { width: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    auditTableRowInputStyle: {
        fontSize: 12,
        margin: 'auto'
    },
    auditInputContainerStyle: {
        borderBottomColor: 'rgba(0,0,0,0)'
    },
    auditTableInputStyle: {
        color: baseStyle.color.black,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    auditRevertText: {
        color: baseStyle.color.borderGray,
        fontSize: 12,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginLeft: 7
    },
    auditTableContainer: { marginTop: 29 },
    auditRevertContainer: {
        marginHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center'
    },
    auditTableHeaderContainer: {
        width: 100,
        flexDirection: 'row',
        marginRight: 44
    },
    auditTableHeaderImage: {
        width: 14,
        height: 14
    },
    auditTableContainerSubTitle: {
        fontSize: 14,
        fontWeight: baseStyle.fontWeight.fw_700,
        marginLeft: 22,
        marginBottom: 29
    },
    auditRewardContainer: {
        marginTop: 29,
        marginHorizontal: 22
    },
    auditRewardContainerTitle: {
        fontWeight: baseStyle.fontWeight.fw_700,
        fontSize: 14,
        marginBottom: 29
    },
    auditRewardContainerSubTitle: {
        fontWeight: baseStyle.fontWeight.fw_400,
        fontSize: 12,
        marginBottom: 10,
        color: baseStyle.color.titleGray
    },
    auditRewardContent: {
        fontSize: 14
    },
    backupTitleStyle: {
        fontWeight: '900',
        fontSize: 18
    },
    imageIcon: {
        marginTop: 2,
        width: 20,
        height: 20,
        marginLeft: 6
    },
    infoSvgIcon: {
        marginTop: 3,
        width: 18,
        height: 18,
        marginLeft: 6
    },
    customTitleStyle: {
        fontWeight: '700',
        fontSize: 16,
        width: 'auto',
        overflow: 'hidden'
    },
    customTitleStyle1: {
        fontWeight: '700',
        fontSize: 14
    },
    customViewStyle: {
        paddingHorizontal: '5%',
        paddingBottom: 10
    },
    newTableRowHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headerInputTitle: {
        width: 60,
        marginRight: 15,
        justifyContent: 'center',
        display: 'flex'
    },
    headerTotalTitle: {
        width: 60,
        marginRight: 20,
        justifyContent: 'center',
        display: 'flex'
    },
    revertNewContainer: {
        marginHorizontal: 0,
        flexDirection: 'row',
        alignItems: 'center'
    },
    tableRowHeaderRequiredText: {
        color: 'red',
        position: 'absolute',
        right: 2,
        top: -8,
        fontSize: 30
    },
    tableRowFrHeaderRequiredText: {
        right: -10
    },
    tableRowHeaderText: {
        fontSize: 12,
        fontWeight: '400',
        textAlign: 'center'
    },
    requireBox: {
        width: 66,
        height: 59,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E4EBFF',
        marginBottom: 1
    }
})

export default AuditStyle
