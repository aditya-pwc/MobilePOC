/**
 * @description Utils for Aes encrypt.
 * @author Xupeng Bao
 * @date 2021-12-31
 */

import CryptoJS from 'crypto-js'
import { CommonApi } from '../../common/api/CommonApi'

export const decryptWithString = (word: string) => {
    const key = CryptoJS.enc.Base64.parse(CommonApi.PBNA_CRYPTOKEY)
    const iv = CryptoJS.enc.Utf8.parse(CommonApi.PBNA_INITIALIZATION_VECTOR)
    const decryptStr = CryptoJS.AES.decrypt(word, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })
    return CryptoJS.enc.Utf8.stringify(decryptStr).toString()
}
