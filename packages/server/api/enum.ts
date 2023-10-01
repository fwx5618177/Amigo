export enum ApiEndpoints {
    /** 获取QQ等级 */
    GetQQLevel = 'https://club.vip.qq.com/api/vip/getQQLevelInfo?requestBody={"iUin":${0}}',

    /** 获取群资料 */
    GetGroupInfo = 'https://qinfo.clt.qq.com/cgi-bin/qun_info/get_group_info_all?gc=${0}&bkn=${1}',

    /** 获取群设置 */
    GetGroupSettings = 'https://qinfo.clt.qq.com/cgi-bin/qun_info/get_group_setting_v2?gc=${0}&bkn=${1}',

    /** 获取新群成员 */
    GetGroupMembersNew = 'https://qinfo.clt.qq.com/cgi-bin/qun_info/get_group_members_new?gc=${0}&bkn=${1}',

    /** 获取群操作记录 */
    GetSysMsg = 'https://qinfo.clt.qq.com/cgi-bin/qun_info/get_sys_msg?gc=${0}&bkn=${1}',

    /** 查找QQ资料 */
    FindQQ = 'https://cgi.find.qq.com/qqfind/buddy/search_v3?keyword=${0}',

    /** 开关匿名 */
    SetAnonySwitch = 'https://qqweb.qq.com/c/anonymoustalk/set_anony_switch?bkn=${0}&value=${1}&group_code=${2}',

    /** 获取群荣誉 */
    GetGroupHonor = 'https://qun.qq.com/interactive/qunhonor?gc=${0}',

    /** 获取精华消息 */
    GetDigestList = 'https://qun.qq.com/cgi-bin/group_digest/digest_list?bkn=${0}&group_code=${1}&page_start=${2}&page_limit=${3}',

    /** 获取群公告列表 */
    GetAnnounceList = 'https://web.qun.qq.com/cgi-bin/announce/get_t_list?bkn=${0}&qid=${1}&ft=23&s=-1&n=20',

    /** 发布群公告 */
    AddAnnounce = 'https://web.qun.qq.com/cgi-bin/announce/add_qun_notice?bkn=${0}',

    /** 搜索群成员 */
    SearchGroupMembers = 'https://qun.qq.com/cgi-bin/qun_mgr/search_group_members?gc=${0}&st=${1}%end=${2}&sort=0&bkn=${3}',

    /** 获取群头像 */
    GetGroupAvatar = 'https://p.qlogo.cn/gh/${0}/${0}/${1}',

    /** 获取群历史头像 */
    GetGroupHistoryAvatar = 'https://p.qlogo.cn/gh/${0}/${0}_${1}/${2}',

    /** 获取QQ头像 */
    GetQQAvatar = 'https://q1.qlogo.cn/g?b=qq&s=${0}&nk=${1}',

    /** 更改群头像 */
    ChangeGroupAvatar = 'http://htdata3.qq.com/cgi-bin/httpconn?htcmd=0x6ff0072&ver=5520&ukey=${0}&range=0&uin=${1}&seq=1&groupuin=${2}&filetype=3&imagetype=5&userdata=0&subcmd=1&subver=101&clip=0_0_0_0&filesize=${3}',

    /** 搜索资料 */
    SearchProfile = 'https://find.qq.com/proxy/domain/cgi.find.qq.com/qqfind/find_v11?backver=2',
}

// API替换函数
export function getApiUrl(endpoint: ApiEndpoints, params: Record<string, number | string>): string {
    const url = endpoint;
    let link: string = '';

    Object.keys(params).forEach(key => {
        link = url.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), params[key].toString());
    });

    return link;
}

// 使用示例
// const url = getApiUrl(ApiEndpoints.GetQQLevel, { 0: 123456 });
// console.log(url);
