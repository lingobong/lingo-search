function LingoSearchDataBase () {
    const datas = [];
    const index = {}; // { 'keyword': [ [dataIndex, score],[dataIndex, score] ] }
    const unique = {};
    function LSDB(){ }

    LSDB.prototype.clear = function () {
        datas.length = 0;
        for (const key in index) {
            delete index[ key ];
        }
        for (const key in unique) {
            delete unique[ key ];
        }
    };
    LSDB.prototype.remove = function (unique_keys) {
        let toDelete_unique_keys_object = {};
        for (let unique_key of unique_keys) {
            toDelete_unique_keys_object[unique_key] = 1;
            if (!!unique[unique_key]) {
                for ( let text of unique[unique_key] ) {
                    index[text] = index[text].filter(i => i[0] != unique_key);
                    index[text].length == 0 && delete index[text];
                }
                delete unique[unique_key];
            }
        }

        for (let dataIdx in datas) {
            let data = datas[dataIdx];
            datas[dataIdx] = !!toDelete_unique_keys_object[data.unique_key]?undefined:data;
        }
    };
    LSDB.prototype.insert = function (textAndScores = [], payload = {}) {
        let duplicated = false;
        let dataIndex = datas.push( payload ) - 1;
        if ( !unique[payload.unique_key] ) {
            unique[payload.unique_key]=[];
        }else{
            duplicated = true;
        }
        if (!duplicated) {
            for (let [text,score] of textAndScores) {
                if (!index[text]) {
                    index[text] = [];
                    unique[payload.unique_key].push(text);
                }
                index[text].push([ dataIndex, score ]);
            }
        }
        return {
            duplicated, // duplicated unique_key
        };
    };
    LSDB.prototype.search = function (textAndScores, searchOption = {}) {
        let dataIndexs = {};
        for ([text, score] of textAndScores) {
            if ( !!index[text] ) {
                for (let data of index[text]) {
                    if (!dataIndexs[data[0]]) dataIndexs[data[0]] = 0;
                    dataIndexs[data[0]] += data[1] * score;
                }
            }
        }
        let resultDatas = Object.entries( dataIndexs );
        resultDatas = resultDatas.map(d=>{
            let data = datas[d[0]];
            if (!!data) {
                data.score = d[1];
            }
            return data;
        }).filter(d=>d);
        resultDatas.sort((a, b)=>{
            for (let centerValue in searchOption.sort) {
                let sortDirection = searchOption.sort[centerValue];
                if (sortDirection == 'desc' || sortDirection == -1) {
                    if ( a[centerValue] == b[centerValue] || b[centerValue] == null ) {
                        continue;
                    }else{
                        return a[centerValue] < b[centerValue];
                    }
                }else{
                    if ( a[centerValue] == b[centerValue] || a[centerValue] == null ) {
                        continue;
                    }else{
                        return a[centerValue] > b[centerValue];
                    }
                }
            }
            return false;
        });
        resultDatas.length = Math.min(resultDatas.length, searchOption.limit);
        return resultDatas;
    };
    return new LSDB();
}
module.exports = LingoSearchDataBase;