export const renderNotes = (notes, renderMoreNotes, maxLength) => {
    if (notes?.length > maxLength && !renderMoreNotes) {
        return notes.slice(0, maxLength) + '...'
    }
    return notes
}
