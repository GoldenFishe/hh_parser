const puppeteer = require('puppeteer');
const fs = require('fs');

const getDataFromPage = () => {
    const data = [];
    const searchItem = document.querySelectorAll('.vacancy-serp-item');
    for (let item of searchItem) {
        data.push({
            title: item.childNodes[2].childNodes[0].innerText,
            salary: item.childNodes[2].childNodes[1].innerText,
            employer: item.childNodes[3].childNodes[0].innerText
        })
    }
    return data;
};

const writeDataToFile = data => {
    const stringData = JSON.stringify(data);
    fs.writeFile('data.json', stringData, 'utf8', err => {
        if (err) throw err;
    });
}

const start = async () => {
    let browser = null;
    let result = [];
    let nextPageButton = null;
    try {
        browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.goto('https://voronezh.hh.ru/search/vacancy?clusters=true&area=26&no_magic=true&enable_snippets=true&salary=&st=searchVacancy&text=Frontend&from=suggest_post', {waitUntil: 'domcontentloaded'});
        do {
            const pageData = await page.evaluate(getDataFromPage);
            result = [...result, ...pageData];
            nextPageButton = await page.$('.HH-Pager-Controls-Next');
            if (nextPageButton) {
                await nextPageButton.click();
                await page.waitForNavigation({waitUntil: 'domcontentloaded'})
            }
        } while (nextPageButton);
    } catch (err) {
        console.error(err);
    } finally {
        if (browser) await browser.close();
    }
    return result;
};

start()
    .then(res => {
        console.log(res);
        console.log(res.length)
        writeDataToFile(res);
    })
    .catch(err => {
        console.log(err);
    });