const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const wait = require('@/utils/wait');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'zpxx';
    const arr = {
        xwrd: 'home!newsHome.action?category=12',
        tzgg: 'home!newsHome.action?category=13',
        zpxx: 'home!recruit.action?category=1&jobType=110001',
        gfjgxx: 'home!recruitList.action?category=1&jobType=110002',
        sxxx: 'home!recruitList.action?category=2',
        cyxx: 'home!newsHome.action?category=11',
    };
    const baseUrl = 'https://scc.pku.edu.cn/';
    const rootUrl = baseUrl + arr[type];

    const headers = {
      Host: 'scc.pku.edu.cn',
      Referer: 'https://scc.pku.edu.cn',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      DNT: 1,
      'Sec-Fetch-User': '?1',
      'Access-Control-Allow-Methods': '*',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Dest': 'document',
      Pragma: 'no-cache',
      'Upgrade-Insecure-Requests': 1,
      'Sec-Fetch-Site': 'none',
    };

    const list_response = await got({
        method: 'get',
        url: rootUrl,
        headers,
    });
    const $ = cheerio.load(list_response.data);

    const feed_title = $('h2.category').text();

    const list = $('div#articleList-body div.item.clearfix')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            const date = parseDate(item.find('div.item-date').text());
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl),
                pubDate: date,
            };
        })
        .get();

    const sorted = list.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()).slice(0, 10);
    await wait(1000);

    ctx.state.data = {
        title: `北京大学学生就业指导服务中心 - ${feed_title}`,
        link: rootUrl,
        item: await Promise.all(
            sorted.map(
                async (item) => {
                    const detail_page = await got({ method: 'get', url: item.link, headers });
                    const detail = cheerio.load(detail_page.data);
                    const script = detail('script', 'div#content-div').html();
                    if (script !== null) {
                      const content_route = script.match(/\$\("#content-div"\).load\("(\S+)"\)/)[1];
                      const content = await got({ method: 'get', url: new URL(content_route, baseUrl), headers });
                      item.description = content.data;
                    }
                    return item;
                }
            )
        ),
    };
};
