const fs = require('fs');
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const axios = require('axios');
const {baseUrlList} = require('../config/config.js');
let currentUrl = '';
let urlType = http;
baseUrlList.forEach(item => {
    currentUrl = item;
    urlType = item.startsWith("https") ? https : http;
    startWorms(item)
});

function startWorms(baseUrl, htmlType = 'li') {
    urlType.get(baseUrl, (res) => {
        let content = "";
        res.on('data', buf => {
            content += buf;
        });
        res.on('end', () => {
            if (htmlType == 'li') {
                analysisHtml(content);
            } else {
                analysisArticle(content);
            }
        })
    })
};

//解析html
function analysisHtml(content) {
    let $ = cheerio.load(content);
    $('body a').each(function (i, elem) {
        let href = elem.attribs.href || "";
        let matchHref = /((http|https|www|.cn|.com|.top))/ig;
        if (href && !matchHref.test(href)) {
            let reg = /.*?(\.html)/;
            if (reg.test(href)) {
                startWorms(currentUrl + href, 'text')
            }else{
                startWorms(currentUrl + href,'li');
            }

        }
    })
}

function analysisArticle(content) {
    let $ = cheerio.load(content);
    let title = $('.article .title').text();
    let description = $('.article .content').text().substr(0, 100).replace(/\s+/g, "");
    let contentHtml="";
    if($('.article .content').html()){
        contentHtml = $('.article .content').html().replace(/<script.*?>.*?<\/script>/ig, '');
    }
    let params = {
        title: title.replace(/\s+/g, ""),
        content: contentHtml,
        description: description
    };
    axios({
        url: 'http://localhost:3000/add/article',
        method: 'post',
        headers: {
            'Content-Type': 'application/json;charset=utf8'
        },
        data: params
    }).then(res => {
        console.log("success:" + res);
    }).catch(err => {
        console.log(err);
    })
}

