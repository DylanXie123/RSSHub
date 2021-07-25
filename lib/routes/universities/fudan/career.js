const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const baseUrl = 'https://career.fudan.edu.cn/mobile.php/Article/getlist';
    const url = 'https://career.fudan.edu.cn/mobile.php/Systemregion/getlist';

    const arr = {
      zytz: { id: '956551f8-728a-2ab7-bef5-c8bfea27be83', name: '重要通知' },
      xwdt: { id: 'ee9f59f3-7294-5a32-eeca-93ef7bbe9281', name: '新闻动态' },
      gsgg: { id: 'e8ef0ca1-2485-5efd-b085-39c8cac57b70', name: '公示公告' },
      syhd: { id: '4a0e0bb8-6a04-7457-24cd-189b16d27a45', name: '生涯活动' },
      zycp: { id: '3e6e9d43-06fc-2baa-ac0e-e06c36385421', name: '职业评测' },
      symk: { id: '87d22b4a-8b06-2ee2-291b-31d8facde666', name: '生涯慕课' },
    };
    const header = {
      auth: ' Baisc MTAyNDY6MTAyNDY=',
      Host: 'career.fudan.edu.cn',
    };
    const body = {
      school_id: '5f431052-b4af-0969-a37a-955f7903c8d5',
      cate_id: arr[category].id,
      page: 1,
      size: 20,
      login_user_id: 1,
      login_admin_school_code: 10246,
      login_admin_school_id: '5f431052-b4af-0969-a37a-955f7903c8d5',
      isorder: 1,
    };

    const list_response = await got({
      method: 'post',
      url: baseUrl,
      json: body,
      headers: header,
    });

    const data = list_response.data.data.list;

    ctx.state.data = {
        title: `复旦大学学生就业信息网-${arr[category].name}`,
        link: baseUrl,
        item: data.map((item) => ({
            description: item.content,
            author: item.author,
            title: item.title,
            link: `https://career.fudan.edu.cn/News/newsXiang.html?cateid=${arr[category].id}&id=${item.id}`,
            pubDate: new Date(item.addtime * 1000).toUTCString(),
        })),
    };
};
