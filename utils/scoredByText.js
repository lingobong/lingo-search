const runes = require('runes');

function parseText({ text, parse = true, type: wordType }, options){
    let mainAndSubTexts = getMainAndSubTexts( text, options );
    let textsBySpace = mainAndSubTexts.main.split(' ');
    let parsedList = [];
    let lastAccessedWord = null;
    for (let textBySpace of textsBySpace) {
        if(!textBySpace) continue;
        let textBySpace_runes  = runes(textBySpace);
        let textBySpace_length = textBySpace_runes.length;
        if (parse) {
        for (let i = 0 ; i < textBySpace_length ; i ++) {
            for (let j = i+1 ; j <= textBySpace_length ; j ++) {
                let splited = textBySpace_runes.slice(i,j);
                let splitedText = splited.join('');
                if (splited.length <= options.maxCellLength && textBySpace != splitedText) {
                    parsedList.push({
                        type: 'part',
                        word: wordType + splitedText,
                    });
                }
            }
        }
        }
        let fullWords = [textBySpace];
        if (!!lastAccessedWord) {
            fullWords.push(lastAccessedWord+textBySpace);
        }
        for (let fullWord of fullWords) {
            if (!!fullWord) {
                let runesFullWord = runes(fullWord);
                if (runesFullWord.length <= options.maxCellLength*2) {
                    parsedList.push({
                        type: 'full',
                        word: wordType + fullWord,
                    });
                }
            }
        }
        lastAccessedWord = textBySpace;
    }

    let subList = runes(mainAndSubTexts.sub);
    subList = subList.map(s => ({
        type: 'part',
        word: s,
    }));
    return {
        main: parsedList,
        sub: subList,
    };
};

function getMainAndSubTexts ( text, options ) {
    let main = null ;
    let sub = null ;

    main = text.replace( new RegExp('[^'+options.languageRegExpString+']', 'g'), ' ' );
    sub = text.replace( new RegExp('['+options.languageRegExpString+']', 'g'), '' );

    return { main, sub };
}

module.exports = function scoredByText( _datas = {}, options = {} ){
    let datas = [];
    if ( _datas.constructor.name == 'Array' ) {
        datas = _datas;
    }else if ( _datas.constructor.name == 'Object' ) {
        datas.push( _datas );
    }else if ( _datas.constructor.name == 'String' ) {
        _datas = {
            text: _datas,
            score: 1,
        };
        datas.push( _datas );
    }else{
        throw new Error('type error');
    }
    for(let data of datas){
        if (data.text.constructor.name == 'Array') {
            data.text = data.text.join(' ');
            data.parse = data.parse == null ? false : data.parse;
        }
        if (!options.includeUrl) {
            data.text = data.text.replace(/([\w]*):\/\/([^ ^\n]{4,})/g,' ');
        }
        data.type = !!data.type ? data.type + '/' : '';
    }

    let textScoreObject = {};
    for (let insertData of datas) {
        let scoreSum = 0;
        let textLength = runes(insertData.text.replace(/ /g,'')).length;
        let parsedText = parseText( insertData, options );

        let _textScoreObject = {};
        for (let wordList of [parsedText.main, parsedText.sub]) {
            for (let { type, word } of wordList) {
                let score = Math.pow( runes(word.split('/').pop()).length/textLength, !!options.useWeight?2:1 ) * insertData.score;
                if (type == 'full') score *= Math.PI;

                let word_lower = word.toLowerCase();
                for (let wordByUpper of options.separateUpperLower ? [word, word_lower] : [word_lower, word_lower]) {
                    if ( !!_textScoreObject[wordByUpper] ) {
                        _textScoreObject[wordByUpper] += score/2;
                    }else{
                        _textScoreObject[wordByUpper] = score/2;
                    }
                    scoreSum += score/2;
                }
            }
        }
        

        for (let text in _textScoreObject) {
            if ( !!textScoreObject[text] ) {
                textScoreObject[text] += _textScoreObject[text]/scoreSum*insertData.score;
            } else {
                textScoreObject[text] = _textScoreObject[text]/scoreSum*insertData.score;
            }
        }
    }
    return Object.entries(textScoreObject);
};