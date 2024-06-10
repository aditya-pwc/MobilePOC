import React from 'react'
import renderer from 'react-test-renderer'
import { Badge } from './Badge'

describe('Badge', () => {
    it('green renders correctly', () => {
        const component = renderer.create(<Badge label={'test'} type={'green'} />)
        expect(component.toJSON()).toMatchSnapshot()
    })

    it('yellow renders correctly', () => {
        const component = renderer.create(<Badge label={'test'} type={'yellow'} />)
        expect(component.toJSON()).toMatchSnapshot()
    })

    it('red renders correctly', () => {
        const component = renderer.create(<Badge label={'test'} type={'red'} />)
        expect(component.toJSON()).toMatchSnapshot()
    })

    it('grey renders correctly', () => {
        const component = renderer.create(<Badge label={'test'} type={'grey'} />)
        expect(component.toJSON()).toMatchSnapshot()
    })

    it('green_outline renders correctly', () => {
        const component = renderer.create(<Badge label={'test'} type={'green_outline'} />)
        expect(component.toJSON()).toMatchSnapshot()
    })

    it('grey_outline renders correctly', () => {
        const component = renderer.create(<Badge label={'test'} type={'grey_outline'} />)
        expect(component.toJSON()).toMatchSnapshot()
    })
})
