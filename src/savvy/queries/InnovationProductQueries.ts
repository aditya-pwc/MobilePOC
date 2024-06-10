const InnovationProductQueries = {
    getMetricsInnovationProduct: {
        q:
            ' ORDER BY ' +
            '{StoreProduct:Product.National_Launch_Date__c} NULLS LAST,' +
            'LOWER(COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c},{StoreProduct:Product.Sub_Brand__c})+0),' +
            'COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c},{StoreProduct:Product.Sub_Brand__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c},{StoreProduct:Product.Sub_Brand__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c},{StoreProduct:Product.Sub_Brand__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,' +
            'COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c},{StoreProduct:Product.Sub_Brand__c}) NULLS LAST,' +
            'LOWER(COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Flavor_Name__c})+0),' +
            'COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Flavor_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Flavor_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Flavor_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Flavor_Name__c}) NULLS LAST,' +
            'LOWER(COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c})+0),' +
            'COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c}) NULLS LAST'
    },
    getCarouselSKUItemSortQuery: {
        q:
            ' ORDER BY ' +
            'LOWER(COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Sub_Brand__c})+0),' +
            'COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Sub_Brand__c}) COLLATE NOCASE,' +
            'CASE WHEN COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Sub_Brand__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Sub_Brand__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({StoreProduct:Product.Formatted_Flavor__c}, {StoreProduct:Product.Sub_Brand__c}),' +
            'LOWER(COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c})+0),' +
            'COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({StoreProduct:Product.Formatted_Package__c}, {StoreProduct:Product.Package_Type_Name__c})'
    },
    getCarouselCardQuery: {
        f: [
            'count',
            'Id',
            'RetailStoreId',
            'Auth_Date__c',
            'Product.Brand_Name__c',
            'Product.Sub_Brand__c',
            'Product.GTIN__c',
            'Product.Formatted_Brand__c',
            'Product.Formatted_Sub_Brand_Name__c',
            'Product.Brand_Code__c',
            'Product.Sub_Brand_Code__c',
            'Product.National_Launch_Date__c',
            'No_11_WTD_Void__c',
            'No_12_LCW_Void__c',
            'YTD_Volume__c',
            'Product.ProductCode',
            'Vol_11_WTD__c'
        ],
        q1:
            'SELECT ' +
            'COUNT(*),' +
            '{StoreProduct:Id},{StoreProduct:RetailStoreId},{StoreProduct:Auth_Date__c},' +
            '{StoreProduct:Product.Brand_Name__c},{StoreProduct:Product.Sub_Brand__c},' +
            '{StoreProduct:Product.GTIN__c},' +
            '{StoreProduct:Product.Formatted_Brand__c},{StoreProduct:Product.Formatted_Sub_Brand_Name__c},' +
            '{StoreProduct:Product.Brand_Code__c},{StoreProduct:Product.Sub_Brand_Code__c},{StoreProduct:Product.National_Launch_Date__c},' +
            '{StoreProduct:No_11_WTD_Void__c},{StoreProduct:No_12_LCW_Void__c},{StoreProduct:YTD_Volume__c},{StoreProduct:Product.ProductCode},{StoreProduct:Vol_11_WTD__c} ' +
            'FROM {StoreProduct} ' +
            'WHERE ',
        q2:
            ' GROUP BY {StoreProduct:Product.National_Launch_Date__c},{StoreProduct:Product.Brand_Code__c},{StoreProduct:Product.Sub_Brand_Code__c}' +
            ' ORDER BY ' +
            'LOWER(COALESCE({StoreProduct:Product.Formatted_Brand__c}, {StoreProduct:Product.Brand_Name__c})+0),' +
            'COALESCE({StoreProduct:Product.Formatted_Brand__c}, {StoreProduct:Product.Brand_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN COALESCE( {StoreProduct:Product.Formatted_Brand__c}, {StoreProduct:Product.Brand_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({StoreProduct:Product.Formatted_Brand__c}, {StoreProduct:Product.Brand_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({StoreProduct:Product.Formatted_Brand__c}, {StoreProduct:Product.Brand_Name__c}),' +
            'LOWER(COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c}, {StoreProduct:Product.Sub_Brand__c})+0),COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c},{StoreProduct:Product.Sub_Brand__c}' +
            ') COLLATE NOCASE,' +
            'CASE WHEN COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c},{StoreProduct:Product.Sub_Brand__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c}, {StoreProduct:Product.Sub_Brand__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c},{StoreProduct:Product.Sub_Brand__c})',
        q3:
            ' GROUP BY {StoreProduct:Product.National_Launch_Date__c},{StoreProduct:Product.Brand_Code__c},{StoreProduct:Product.Sub_Brand_Code__c}' +
            ' ORDER BY ' +
            'COALESCE({StoreProduct:Product.Formatted_Brand__c}, {StoreProduct:Product.Brand_Name__c}),' +
            'COALESCE({StoreProduct:Product.Formatted_Sub_Brand_Name__c}, {StoreProduct:Product.Sub_Brand__c}),{StoreProduct:Product.National_Launch_Date__c}'
    },
    MetricsItemSortQuery: {
        queryByNationalDefault:
            'LOWER(COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) NULLS LAST,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) NULLS LAST,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) NULLS LAST',
        queryByNationalASC: ' ORDER BY {MetricsProduct:National_Launch_Date} NULLS LAST,',
        queryByNationalDESC: ' ORDER BY {MetricsProduct:National_Launch_Date} DESC NULLS LAST,',
        queryByNameASC:
            ' ORDER BY ' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) NULLS LAST,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) NULLS LAST',
        queryByNameDESC:
            ' ORDER BY ' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) COLLATE NOCASE DESC,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c})+0),' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[Z-Az-a]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[9-0]*" THEN 2  ' +
            'ELSE 3 END,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[Z-Az-a]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[9-0]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) NULLS LAST,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[Z-Az-a]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[9-0]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) NULLS LAST',
        queryByDistASC: ' ORDER BY {MetricsProduct:DistLCW}+0 NULLS LAST,',
        queryByDistDESC: ' ORDER BY {MetricsProduct:DistLCW}+0 DESC NULLS LAST,',
        queryByDistDefault:
            'LOWER(COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) NULLS LAST,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) NULLS LAST',
        sortDefaultValue:
            '{MetricsProduct:National_Launch_Date} NULLS LAST,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c},{MetricsProduct:Sub_Brand__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN ' +
            'COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) NULLS LAST,' +
            'LOWER(COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c})+0),' +
            'COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) COLLATE NOCASE,' +
            'CASE WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[A-Za-z]*" THEN 1 ' +
            'WHEN COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) GLOB "[0-9]*" THEN 2  ' +
            'ELSE 3 END,COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) NULLS LAST'
    }
}

export default InnovationProductQueries

export const InnovProdSearchQueries = (searchText: string) => {
    return (
        `(COALESCE({MetricsProduct:Formatted_Sub_Brand_Name__c}, {MetricsProduct:Sub_Brand__c}) LIKE '%${searchText}%' ` +
        `OR COALESCE({MetricsProduct:Formatted_Flavor__c}, {MetricsProduct:Flavor_Name__c}) LIKE '%${searchText}%' ` +
        `OR COALESCE({MetricsProduct:Formatted_Package__c}, {MetricsProduct:Package_Type_Name__c}) LIKE '%${searchText}%')`
    )
}

const getLocationQuery = (selected: any) => {
    switch (selected) {
        case 0:
            return ''
        case 1:
            return "{StoreProduct:Product_Availability__c} = '1'"
        case 2:
            return "{StoreProduct:Product_Availability__c} = '0'"
        default:
            return ''
    }
}

const getLaunchQuery = (selected: any) => {
    switch (selected) {
        case 0:
            return ''
        case 1:
            return "{StoreProduct:Product.National_Launch_Date__c} > DATE('now')"
        case 2:
            return "{StoreProduct:Product.National_Launch_Date__c} <= DATE('now')"
        default:
            return ''
    }
}
export const InnovaProdFilterQueries = (filterSelected: any) => {
    const filterQueryList = [getLocationQuery(filterSelected[0]), getLaunchQuery(filterSelected[1])]
    let filterQuery = ''
    filterQueryList.forEach((query) => {
        if (query) {
            if (filterQuery) {
                filterQuery += ' AND ' + query
            } else {
                filterQuery = query
            }
        }
    })
    return {
        filterQuery: filterQuery,
        filterSelected: filterSelected
    }
}
