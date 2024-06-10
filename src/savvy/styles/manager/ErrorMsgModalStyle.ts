/**
 * @description ErrorMsgModal style.
 * @author Hao Chen
 * @email hao.c.chen@pwc.com
 * @date 2021-10-15
 */

import { StyleSheet } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...commonStyle.alignCenter,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    contentCon: {
        width: 300,
        height: 290,
        backgroundColor: 'white',
        borderRadius: 8,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden'
    },
    content: {
        ...commonStyle.alignCenter,
        paddingVertical: 34,
        paddingHorizontal: 29
    },
    image: {
        width: 50,
        height: 48,
        marginBottom: 10
    },
    label: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000',
        marginVertical: 10
    },
    message: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'center'
    },
    buttonCon: {
        backgroundColor: '#6C0CC3',
        ...commonStyle.alignCenter,
        height: 60
    },
    buttonText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#FFFFFF'
    }
})

export default styles
