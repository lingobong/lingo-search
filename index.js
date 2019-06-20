/**
 * LS this
 * regexp
 * 
 */
const utils = require('./utils');

function LingoSearch(options = {}) {
    const defaultDB = utils.LSDB();
    const LSOptions = {
        useWeight: false,
        languageRegExpString: null,
        db: defaultDB,
        maxCellLength: 7,
    };

    const LS = function (options = {}) {
        /**
         * options = {
         *  regexp: String or Array => not delete language regexp to parse
         * }
         */
        if (!options) options = {};

        const {
            regexp = LSOptions.languageRegExpString,
            db = LSOptions.db,
            maxCellLength = LSOptions.maxCellLength,
            useWeight = LSOptions.useWeight,
        } = options;

        let regexps = [];
        if ( !options.regexp ) {
            if (!this.options.languageRegExpString) {
                regexps.push('а-яА-ЯЁё'); // russian
                regexps.push('0-9'); // number
                regexps.push('a-zA-Z'); // alphabet
                regexps.push('가-힣ㄱ-ㅎㅏ-ㅣ'); // 한글 korean
                regexps.push('\u3000-\u303f'); // Punctuation
                regexps.push('\u3040-\u309f'); // Hiragana
                regexps.push('\u30a0-\u30ff'); // Katakana
                regexps.push('\uff00-\uff9f'); // Full-width Roman, Half-width Katakana
                regexps.push('\u4e00-\u9faf'); // CJK (Common & Uncommon)
                regexps.push('\u3400-\u4dbf'); // CJK Ext. A
                regexps.push('\u00C0-\u00ff'); // portuguese
                regexps.push(' '); // space
                regexps.push('àâäèéêëîïôœùûüÿçÀÂÄÈÉÊËÎÏÔŒÙÛÜŸÇ'); // french
            }else if (options.regexp.constructor.name == 'String') {
                regexps.push(options.regexp);
            }else if (options.regexp.constructor.name == 'Array') {
                regexps = options.regexp;
            }else{
                return new Error('type error');
            }
            this.options.languageRegExpString = regexps.join('');
        }
        
        this.options.db = db;
        this.options.maxCellLength = maxCellLength;
        this.options.useWeight = useWeight;
    };
    LS.prototype.options = LSOptions;
    LS.prototype.config = function (options) {
        this.options = new LingoSearch(options).options;
    };
    LS.prototype.insert = async function ( insertDatas = [], payload = {}, callback ) {
        if (payload.unique_key == null) {
            return new Error('unique key can not empty');
        }

        let textAndScores = utils.scoredByText(insertDatas, this.options);
        if ( callback ) {
            await callback(textAndScores, payload);
        }else{
            await this.options.db.insert(textAndScores, payload);
        }
    };
    LS.prototype.search = async function ( query = '', searchOptions = { }, callback ) {
        /**
         * searchOptions
         *  limit
         *  
         */
        if ( !!searchOptions && searchOptions.constructor.name == 'Object' ) {
            if ( !searchOptions.limit ) searchOptions.limit = Math.max(0, searchOptions.limit);
            if ( !searchOptions.sort ) searchOptions.sort = { score: 'desc', unique_key: 'desc' };
        }
        let datas = [];
        if (query.constructor.name == 'String') {
            datas.push({
                text: query,
                score: 1,
            });
        }else if (query.constructor.name == 'Array') {
            datas = query;
        }else if (query.constructor.name == 'Object') {
            datas.push( query );
        }else{
            return new Error('type error');
        }

        let textAndScores = utils.scoredByText(datas, this.options);
        if ( callback ) {
            return await callback.apply(this, [textAndScores, searchOptions]);
        } else {
            return await this.options.db.search(textAndScores, searchOptions);
        }
    };
    LS.prototype.remove = async function (unique_key, deleteOptions = {}, callback ) {
        let unique_keys = [];
        if (unique_key.constructor.name == 'Array') {
            unique_key = unique_key;
        }else{
            unique_keys.push(unique_key);
        }
        if ( callback ) {
            return await callback.apply(this, [unique_keys, deleteOptions]);
        } else {
            return await this.options.db.remove(unique_keys, deleteOptions);
        }
    };
    return new LS(options);
}
module.exports = LingoSearch;