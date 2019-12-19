const fs = require('fs');
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const axios = require('axios');
const Koa=require('koa');
const app=new Koa();
let baseUrl = "https://www.sanwenji.cn";
let urlType = baseUrl.startsWith("https") ? https : http;
urlType.get(baseUrl, (res) => {
    var content = "";
    // 获取数据
    res.on("data", buf => {
        content += buf;
    });
    res.on("end", () => {
        let $ = cheerio.load(content);
        $('.category .item a').each(function (i, elem) {
            let href = elem.attribs.href;
            let reg = /.*?(\.html)/;
            if (reg.test(href)) {
               sectionArticle(href);
            }
        });
    });
});

const sectionArticle = (href) => {
    let url = baseUrl + href;
    let urlType = url.startsWith("https") ? https : http;
    urlType.get(url, (res) => {
        var content = "";
        res.on('data', buf => {
            content += buf;
        });
        res.on('end', () => {
            analysisHtml(content);
        })
    })
};

const analysisHtml = (content) => {
    let $ = cheerio.load(content);
    let title = $('.article .title').text();
    let description=$('.article .content').text().substr(0,100).replace(/\s+/g,"");
    let contentHtml = $('.article .content').html().replace(/<script.*?>.*?<\/script>/ig,'');
    let params={
        title:title,
        content: contentHtml,
        description:description
    };
    axios({
        url:'http://localhost:3000/add/article',
        method:'post',
        headers:{
            'Content-Type':'application/json;charset=utf8'
        },
        data:params
    }).then(res=>{
        console.log("success:"+res)
    }).catch(err=>{
        console.log(err);
    })
};

app.listen(80);