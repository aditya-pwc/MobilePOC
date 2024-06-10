import { CLASS_KEY } from './Provider'
import { moduleMap } from './ModuleMap'
import { Container } from './Container'

export function load(container: Container) {
    for (const key in moduleMap) {
        const v = moduleMap[key as keyof typeof moduleMap]
        const metadata = Reflect.getMetadata(CLASS_KEY, v)
        if (metadata) {
            container.bind(metadata.id, v, metadata.args)
        }
    }
}
