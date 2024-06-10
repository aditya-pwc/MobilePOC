const fs = require('fs')
const pathSep = require('path').sep
const { getDefaultConfig } = require('metro-config')

function createModuleId(path) {
    const projectRootPath = __dirname
    let moduleId = path.substr(projectRootPath.length + 1)
    console.log('moduleId', moduleId)

    const regExp = pathSep == '\\' ? new RegExp('\\\\', 'gm') : new RegExp(pathSep, 'gm')
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
                return function (path) {
                    const moduleId = createModuleId(path)

                    fs.appendFile('./moduleIds_ios.txt', `${moduleId}\n`, (err) => err && console.error(err))
                    return moduleId
                }
            }
        },
        resolver: {
            assetExts: assetExts.filter((ext) => ext !== 'svg'),
            sourceExts: [...sourceExts, 'svg']
        }
    }
})()
