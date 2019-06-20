const runes = require('runes');

function parseText(text, options){
    let mainAndSubTexts = getMainAndSubTexts( text, options );
    let textsBySpace = mainAndSubTexts.main.split(' ');
    let parsedList = [];
    for (let textBySpace of textsBySpace) {
        if(!textBySpace) continue;
        let textBySpace_runes  = runes(textBySpace);
        let textBySpace_length = textBySpace_runes.length;

        for (let i = 0 ; i < textBySpace_length ; i ++) {
            for (let j = i+1 ; j <= textBySpace_length ; j ++) {
                let splited = textBySpace_runes.slice(i,j);
                let splitedText = splited.join('');
                if (splited.length <= options.maxCellLength) {
                    parsedList.push(splitedText);
                }
            }
        }
    }

    return {
        main: parsedList,
        sub: runes(mainAndSubTexts.sub),
    };
};

function getMainAndSubTexts ( text, options ) {
    let main = null ;
    let sub = null ;

    main = text.replace( new RegExp('[^'+options.languageRegExpString+']', 'g'), '' );
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
        return new Error('type error');
    }

    let textScoreObject = {};
    for (let insertData of datas) {
        let textLength = runes(insertData.text.replace(/ /g,'')).length;
        let parsedText = parseText( insertData.text, options );

        let _textScoreObject = {};
        for (let wordList of [parsedText.main, parsedText.sub]) {
            for (let word of wordList) {
                let score = Math.pow( runes(word).length/textLength, !!options.useWeight?2:1 ) * insertData.score;
                if ( !!_textScoreObject[word] ) {
                    _textScoreObject[word] += score;
                }else{
                    _textScoreObject[word] = score;
                }
            }
        }
        for (let text in _textScoreObject) {
            if ( !!textScoreObject[text] ) {
                textScoreObject[text] += _textScoreObject[text];
            } else {
                textScoreObject[text] = _textScoreObject[text];
            }
        }
    }
    return Object.entries(textScoreObject);
};