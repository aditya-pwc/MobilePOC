/*
 * @Author: your name
 * @Date: 2021-06-18 11:39:02
 * @LastEditTime: 2024-01-16 17:43:31
 * @LastEditors: Tom tong.jiang@pwc.com
 * @Description: In User Settings Edit
 * @FilePath: /Halo_Mobile/src/styles/BaseStyle.ts
 */
/**
 * @description Base style elements.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-05-24
 */

export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'

export const baseStyle = {
    color: {
        white: '#FFFFFF',
        black: '#000000',
        gray: 'gray',
        borderGray: '#D3D3D3',
        purple: '#6C0CC3',
        tabBlue: '#00A2D9',
        loadingGreen: '#2DD36F',
        tabShadowBlue: '#004C97',
        titleGray: '#565656',
        yellow: '#FFC409',
        cGray: '#CCCCCC',
        modalBlack: 'rgba(0, 0, 0, 0.2)',
        modalBlack50: 'rgba(0, 0, 0, 0.5)',
        modalBlack60: 'rgba(0, 0, 0, 0.6)',
        modalBlack70: 'rgba(0, 0, 0, 0.7)',
        modalBlack80: 'rgba(0, 0, 0, 0.8)',
        modalBlack90: 'rgba(0, 0, 0, 0.9)',
        modalBlack100: 'rgba(0, 0, 0, 1)',
        bgGray: '#F2F4F7',
        red: '#EB445A',
        LightBlue: '#00A1D9',
        liteGrey: '#D3D3D3',
        transparent: 'transparent',
        liteGrey2: '#DBDBDB',
        green: '#2DD36F',
        lightRed: '#EB445A',
        deepBlue: '#007AFF',
        lightBluePlus: '#E3EFFD'
    },
    fontWeight: {
        fw_bold: 'bold' as FontWeight,
        fw_400: '400' as FontWeight,
        fw_500: '500' as FontWeight,
        fw_600: '600' as FontWeight,
        fw_700: '700' as FontWeight,
        fw_800: '800' as FontWeight,
        fw_900: '900' as FontWeight
    },
    fontSize: {
        fs_8: 8,
        fs_11: 11,
        fs_12: 12,
        fs_14: 14,
        fs_16: 16,
        fs_18: 18,
        fs_20: 20,
        fs_22: 22,
        fs_24: 24
    },
    padding: {
        pd_15: 15,
        pd_20: 20,
        pd_22: 22
    },
    margin: {
        mg_2: 2,
        mg_5: 5,
        mg_20: 20,
        mg_22: 22,
        mg_54: 54,
        mg_267: 267
    }
}
