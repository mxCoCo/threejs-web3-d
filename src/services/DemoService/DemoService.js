import { requestPostFile, requestPost, requestGet, requestPostRes } from '../ModelService';


/**
 * 根据模型ID,获取模型信息接口
 * @param {} params
 */
export const GetModelById = (params) => {
    const url = "/studydata/caseinfo";
    return requestGet(url, params)
};


/**
 * 根据模型ID,下载模型接口
 * @param {} params
 */
export const GetModelDownLoadById = (params) => {
    const url = "oss/downloadbyID";
    return requestGet(url, params)
};