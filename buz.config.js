const fs = require('fs')
const pathSep = require('path').sep
const { getDefaultConfig } = require('metro-config')

const moduleIds = fs.readFileSync('./moduleIds_ios.txt', 'utf8').toString().split('\n')

function createModuleId(path) {
    const projectRootPath = __dirname
    let moduleId = path.substr(projectRootPath.length + 1)
    console.log(moduleId)

    const regExp = pathSep === '\\' ? new RegExp('\\\\', 'gm') : new RegExp(pathSep, 'gm')
    moduleId = moduleId.replace(regExp, '__')
    return moduleId
}

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts }
    } = await getDefaultConfig()
    return {
        transformer: {
            babelTransformerPath: require.resolve('react-native-svg-transformer'),
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: false
                }
            })
        },
        serializer: {
            createModuleIdFactory: function () {
                return createModuleId
            },
            processModuleFilter: function (modules) {
                const moduleId = createModuleId(modules.path)

                if (modules.path == '__prelude__') {
                    return false
                }

                if (moduleId == 'node_modules__metro-runtime__src__polyfills__require.js') {
                    return false
                }

                if (moduleIds.indexOf(moduleId) < 0) {
                    return true
                }
                return false
            },
            getPolyfills: function () {
                return []
            }
        },
        resolver: {
            assetExts: assetExts.filter((ext) => ext !== 'svg'),
            sourceExts: [...sourceExts, 'svg']
        }
    }
})()
