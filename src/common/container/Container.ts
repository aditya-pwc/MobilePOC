import { PROPS_KEY } from './Inject'

export class Container {
    bindMap = new Map()

    bind(identifier: string, clazz: any, constructorArgs?: Array<any>) {
        this.bindMap.set(identifier, {
            clazz,
            constructorArgs: constructorArgs || []
        })
    }

    get<T>(identifier: string): T {
        const target = this.bindMap.get(identifier)

        const { clazz, constructorArgs } = target

        const props = Reflect.getMetadata(PROPS_KEY, clazz)
        const inst = Reflect.construct(clazz, constructorArgs) as T

        for (const prop in props) {
            const identifier = props[prop].value
            inst[prop as keyof typeof inst] = this.get(identifier)
        }
        return inst
    }
}
