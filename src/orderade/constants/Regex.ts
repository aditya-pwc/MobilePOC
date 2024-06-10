const EDVPriceRegexGroup = [
    '( \\d+\\/\\$\\d+\\.\\d+ )',
    '( \\d+\\/\\$\\d+ )',
    '( \\d+\\/\\$\\d+\\.\\d+)',
    '( \\d+\\/\\$\\d+)'
]
const EDVPriceInputRegexGroup = ['([1-9]d{0,3})', '(d{1,2}.d{1,2})']
export const Regex = {
    EDVPriceRegex: new RegExp(EDVPriceRegexGroup.join('|'), 'i'),
    EDVPriceInputRegex: new RegExp(EDVPriceInputRegexGroup.join('|'), 'i')
}

export default Regex
