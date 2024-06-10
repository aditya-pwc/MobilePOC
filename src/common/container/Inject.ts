import 'reflect-metadata'
export const PROPS_KEY = 'ioc:inject_props'

export function Inject() {
    return function (target: any, targetKey: string) {
        const annotationTarget = target.constructor
        let props = {} as Record<string, { value: string }>
        if (Reflect.hasOwnMetadata(PROPS_KEY, annotationTarget)) {
            props = Reflect.getMetadata(PROPS_KEY, annotationTarget)
        }

        props[targetKey as keyof typeof props] = {
            value: targetKey
        }

        Reflect.defineMetadata(PROPS_KEY, props, annotationTarget)
    }
}
