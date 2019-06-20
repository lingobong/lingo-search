### Example
```js
const LS1 = require('../lingo-search/instance');

// data insert
function data_insert(){
  LS1.insert([
    { text:'영국 원어민은 미세먼지를 뭐라고 할까?', score: 100, },
    { text:'엘프녀의 특급강의', score: 10, }
  ],{
    unique_key: 1,
    payload: { // It can contain any form.
      videoData :'video-id-1', // temp Data
    }
  });

  LS1.insert({ text:'엘프녀 안젤리나 다닐로바와 러시아애교vs한국애교', score: 100, }, {
    unique_key: 2,
    payload: { videoData :'video-id-2' }
  });

  LS1.insert({ text:'영어이름 짓는방법 3가지 팁!', score: 100, },{
    unique_key: 3,
    payload: { videoData :'video-id-3' }
  });

  LS1.insert({ text:'넷플릭스 추천드라마 10개(영어공부용)', score: 100, },{
    unique_key: 4,
    payload: { videoData :'video-id-4' }
  });
}

// data insert
function data_search( keyword ) {
  LS1
    .search(keyword,{ limit: 3, sort: { 'score': 'desc', } })
    .then(rs=>{
      console.log(rs);
    });
}


data_insert();
data_search('엘프');
```

### Result
```json
[
    {
        unique_key: 2,
        payload: { videoData: 'video-id-2' },
        score: 0.8506616257088846
    },
    {
        unique_key: 1,
        payload: { videoData: 'video-id-1' },
        score: 0.703125
    }
]
```