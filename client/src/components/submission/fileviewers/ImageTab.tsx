import React from 'react';
import { FileProperties } from '../FileOverview';
import { File } from '../../../../../models/api/File';
import { getFileUrl } from '../../../../helpers/APIHelper';

export function ImageTab({file}: FileProperties) {
    return (
        <div className="contentTab">
            <div className="m-3 mb-6">
                <img src={getFileUrl(file.ID)} alt={file.name} />
            </div>
        </div>
    );
}

export function imageTabCanHandle(file: File) {
    return file.type.startsWith("image/");
}