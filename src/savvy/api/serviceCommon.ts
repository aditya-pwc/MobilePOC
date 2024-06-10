/**
 * @description Axios instance for calling common external system.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */

import axios from 'axios'

export const serviceCommon = axios.create({
    timeout: 10000
})
