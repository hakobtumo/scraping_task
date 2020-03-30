require('dotenv').config();

const axios = require('axios');
const cheerio = require('cheerio');

const START_URL = process.env.START_URL;
const START_URL_OBJ = new URL(START_URL);
const CONTAINER = {};

(function MAIN() {
    console.log(`STARTING TO SCRAPE THE URLS OF ${process.env.START_URL} WEBSITE`)
    urlsOfPage(START_URL);
})();

function urlsOfPage(url) {
    CONTAINER[url] = "PENDING";
    axios.get(url).then(function (response) {
        console.log(`${response.status} | ${url}`)
        CONTAINER[url] = response.status;
        const urlObj = new URL(url);
        if (urlObj.hostname === START_URL_OBJ.hostname) {
            const $ = cheerio.load(response.data);
            $("[href]").each(function (_, elem) {
                let relativeUrl = elem.attribs.href;
                detectNotRequestedUrls(relativeUrl,url);
            });
            $("[url]").each(function (_, elem) {
                let relativeUrl = elem.attribs.url;
                detectNotRequestedUrls(relativeUrl,url);
            });
            recursion()
        }
    }).catch(error => {
        try {
            if (error.response.status) {
        	console.log(`${error.response.status} | ${url}`)
                CONTAINER[url] = error.response.status;
            }
        } catch (error) {
            CONTAINER[url] = "CANT REACH";
            console.log("CANT REACH |",url)
        }
    });
}

const PrintContainer = (function () {
    var a = setTimeout(toString, 6000)

    return function () {
        clearTimeout(a);
        a = setTimeout(toString, 6000);
    }
})();

function recursion() {
    const pendingUrls = getNotRequestedUrls();
    pendingUrls.forEach((url) => {
        if (CONTAINER[url] !== "PENDING") urlsOfPage(url);
    })
    if(pendingUrls.length===0) PrintContainer();
};

function getNotRequestedUrls() {
    return Object.keys(CONTAINER).filter(url => CONTAINER[url] === "NOT_REQUESTED_YET");
}

function toString() {
    let count = {}
    let arrVal = Object.values(CONTAINER);
    arrVal.forEach(el => {
        count[el] = ++count[el] || 1;
    });
    console.log('resultes:')
    console.log('statuscode - count')
    Object.entries(count).forEach(([key, val]) => {
        console.log(`${key}-${val}`)
    })
    console.log('total urls: ' + arrVal.length)
}

function detectNotRequestedUrls(relativeUrl,url) {
    let relativeUrlObj = new URL(relativeUrl, url);
    let absoluteUrl = relativeUrlObj.toString();

    if (!CONTAINER[absoluteUrl]) {
        CONTAINER[absoluteUrl] = "NOT_REQUESTED_YET";
    }
}
