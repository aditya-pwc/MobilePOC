/**
 * @description Utils for upload file.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-02-22
 * @lastModifiedDate 2021-02-22
 */

import { net } from 'react-native-force'
import { CommonParam } from '../../common/CommonParam'

export const FileHelper = () => {
    return {
        /**
         * @description Upload file to Salesforce, the target obj is ContentVersion
         * @param title
         * @param pathOnClient
         * @param versionData
         */
        uploadFile: (title: string, pathOnClient: string, versionData: string) => {
            return new Promise((resolve, reject) => {
                net.create(
                    'ContentVersion',
                    {
                        Title: title,
                        PathOnClient: pathOnClient,
                        VersionData: versionData
                    },
                    (success) => {
                        resolve(success)
                    },
                    (error) => {
                        reject(error)
                    }
                )
            })
        },
        /**
         * @description Get the ContentDocumentId on ContentVersion.
         * @param id
         */
        getContentDocumentId: (id: string) => {
            return new Promise((resolve, reject) => {
                net.query(
                    `SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id='${id}'`,
                    (success) => {
                        resolve(success)
                    },
                    (error) => {
                        reject(error)
                    }
                )
            })
        },
        /**
         * @description To link an entity to ContentDocument.
         * @param documentId
         * @param entityId
         * @param visibility
         */
        linkContentToEntity: (documentId: string, entityId: string, visibility: string) => {
            const fields = {
                ContentDocumentId: documentId,
                LinkedEntityId: entityId,
                Visibility: visibility
            }
            return new Promise((resolve, reject) => {
                net.create(
                    'ContentDocumentLink',
                    fields,
                    (success) => {
                        resolve(success)
                    },
                    (error) => {
                        reject(error)
                    }
                )
            })
        },
        /**
         * @description Retrieve ContentVersion body from Salesforce.
         * @param id
         */
        downloadFile: (id: string) => {
            return new Promise((resolve, reject) => {
                const url = `${CommonParam.endpoint}/services/data/v51.0/sobjects/ContentVersion/${id}/VersionData`
                fetch(url, {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + CommonParam.accessToken
                    }
                })
                    .then((success) => {
                        resolve(success)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        }
    }
}

export default FileHelper
