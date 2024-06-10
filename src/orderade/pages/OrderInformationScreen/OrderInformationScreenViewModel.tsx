export const getSummaryLst = (orderItemLst: any[]) => {
    const toDoList: any[] = []
    orderItemLst.forEach((v) =>
        v.products.forEach((item: any) =>
            toDoList.push({
                Quantity: item.quantity,
                UnitPrice: item.unitPrice
            })
        )
    )

    return toDoList
}
