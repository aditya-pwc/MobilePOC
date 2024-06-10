import React from 'react'
import { View } from 'react-native'

function getDisplayName<P>(WrappedComponent: React.ComponentType<P>) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export const withPersonaCheck = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    handleCheckPersona: (name: any) => boolean
) => {
    const ComponentWithPersonaCheck: React.FC<P> = (props) => {
        const isAuthorized = handleCheckPersona(getDisplayName(WrappedComponent))

        if (!isAuthorized) {
            // return <Text>You do not have permission to view this page.</Text>
            return <View />
        }

        return <WrappedComponent {...props} />
    }

    ComponentWithPersonaCheck.displayName = `withAuthorization(${getDisplayName(WrappedComponent)})`

    return ComponentWithPersonaCheck
}
