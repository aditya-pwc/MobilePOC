const CapturePictureQueries = {
    getCapturePictureQuery: {
        queryAllPicture: `SELECT 
        {PictureData:IsUploaded},{PictureData:Type},
        {PictureData:TargetId},{PictureData:Data},
        {PictureData:_soupEntryId},{PictureData:__local__},
        {PictureData:__locally_created__},{PictureData:__locally_updated__},
        {PictureData:__locally_deleted__} 
        FROM {PictureData} 
        WHERE {PictureData:IsUploaded} = 'false' AND {PictureData:Type} = 'Execution Photo'`,
        queryTargetPicture: `SELECT 
        {PictureData:IsUploaded},{PictureData:Type},
        {PictureData:TargetId},{PictureData:Data},{PictureData:_soupEntryId},
        {PictureData:__local__},{PictureData:__locally_created__},
        {PictureData:__locally_updated__},{PictureData:__locally_deleted__} 
        FROM {PictureData} 
        WHERE {PictureData:IsUploaded} = 'false' AND {PictureData:Type} = 'Execution Photo'`,
        targetValues: ['IsUploaded', 'Type', 'TargetId', 'Data']
    }
}

export default CapturePictureQueries
