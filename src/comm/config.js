let env = process.env.REACT_APP_ENV;
let baseUrl = '';

//开发环境
if (env === 'development') {
    baseUrl = 'http://www.licyo.net/medicalimagedm/'
    // baseUrl = 'http://localhost:8001/medicalimagedm/'
}
//测试环境
else if (env === 'test') {
    baseUrl = 'http://www.licyo.net/medicalimagedm/'
}
//生产环境（未定）
else if (env === 'production') {
    baseUrl = 'http://www.licyo.net/medicalimagedm/'
}


export const BASE_URL = baseUrl;