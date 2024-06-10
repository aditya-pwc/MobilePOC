export const replaceQuotesToWildcard = (searchValue: string, wildcard: string = '%') => {
    return searchValue
        .replaceAll("'", wildcard)
        .replaceAll('`', wildcard)
        .replaceAll('‘', wildcard)
        .replaceAll('’', wildcard)
        .replaceAll('"', wildcard)
        .replaceAll('“', wildcard)
        .replaceAll('”', wildcard)
}

export const replaceAccountNameQuotesToWildcard = (searchValue: string, wildcard: string = '') => {
    // Replaces the special symbol for accountName
    return searchValue
        .replaceAll("'", wildcard)
        .replaceAll('`', wildcard)
        .replaceAll('‘', wildcard)
        .replaceAll('’', wildcard)
        .replaceAll('"', wildcard)
        .replaceAll('“', wildcard)
        .replaceAll('”', wildcard)
        .replaceAll('#', wildcard)
        .replaceAll('”', wildcard)
        .replaceAll(',', wildcard)
        .replaceAll('@', wildcard)
        .replaceAll('-', wildcard)
        .replaceAll('*', wildcard)
        .replaceAll(')', wildcard)
        .replaceAll('(', wildcard)
        .replaceAll('/', wildcard)
        .replaceAll('+', wildcard)
        .replaceAll('$', wildcard)
        .replaceAll('!', wildcard)
        .replaceAll('&', wildcard)
        .replaceAll('~', wildcard)
        .replaceAll('^', wildcard)
        .replaceAll('?', wildcard)
        .replaceAll('[', wildcard)
        .replaceAll(']', wildcard)
        .replaceAll('{', wildcard)
        .replaceAll('}', wildcard)
        .replaceAll(':', wildcard)
        .replaceAll(';', wildcard)
        .replaceAll('<', wildcard)
        .replaceAll('>', wildcard)
        .replaceAll('=', wildcard)
}

export const spiltStringByLength = (str: string, length: number): string[] => {
    const result = []
    const resultLength = Math.ceil(str.length / length)

    for (let i = 0; i < resultLength; i++) {
        const start = i * length
        const end = start + length
        result.push(str.slice(start, end))
    }

    return result
}
