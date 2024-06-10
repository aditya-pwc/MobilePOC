import React from 'react'
import { LandingScreenBase } from '../../common/pages/LandingScreenBase/LandingScreenBase'
import { initApp } from '../utils/LandingUtils'

export const LandingScreenSavvy = () => {
    return <LandingScreenBase executor={initApp} />
}
