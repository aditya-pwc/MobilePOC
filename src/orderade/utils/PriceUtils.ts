export const ellipsis = (total: string, maxSize: number) => {
    if (total.length > maxSize) {
        return total.substring(0, maxSize) + '...'
    }
    return total
}

export const formatPrice = (input: string | number) => {
    const parsed = typeof input === 'number' ? input : parseFloat(input)
    if (isNaN(parsed)) {
        return ''
    }
    return parsed.toFixed(2)
}
