/* 配置文件(可以被 data/widgets/custom.js 覆盖) */
import {
    cutString,
    ReplaceSpace,
    ReplaceCRLF,
    ialParser,
    markdown2span,
    dateFormat,
    timeFormat,
    timestampFormat,
    isEmptyString,
} from './../utils/string.js';

import {
    templateParse
} from './../utils/templateParser.js'

export var config = {
    token: '', // API token, 无需填写
    query: { // 查询配置
        width: '128px', // 挂件宽度
        height: '32px', // 挂件高度
        radius: '8px', // 挂件圆角
        render: {
            // 块查询部分字段渲染方案, 可以设置为 'ref' (渲染为块引用) 或 'link' (渲染为块超链接)
            type: 'ref', // 块类型
            hpath: 'ref', // 块所在文档路径
            id: 'ref', // 块 ID
            parent_id: 'ref', // 块的上级块 ID
            root_id: 'ref', // 块所在文档 ID
        },
        prefix: {
            // 非默认查询时字段别名前缀
            ref: '__ref__', // 该字段渲染为引用
            link: '__link__', // 该字段渲染为链接
            pre: '__pre__', // 该字段渲染为预览
            raw: '__raw__', // 该字段渲染为原始值
            date: '__date__', // 该字段渲染为日期
            time: '__time__', // 该字段渲染为时间
            datetime: '__datetime__', // 该字段渲染为日期时间
        },
        attribute: { // 块属性
            code: 'query-code', // 查询代码块
            widget: 'query-widget', // 查询挂件块
            table: 'query-table', // 查询结果表格块
        },
        regs: {
            blocks: /^\s*SELECT\s+\*\s+FROM\s+blocks.*/i, // 块查询的正则表达式
            limit: /\s+LIMIT\s+/i, // SQL LIMIT 关键字正则表达式
        },
        sql: {
            // SQL 语句处理
            limit: { // 查询记录数量限制, 若启用且为设置 LIMIT 语句, 则在查询语句末尾添加 "LIMIT begin, end"
                enable: false, // 是否启用限制
                begin: 0, // 开始记录数
                end: 100, // 结束记录数
            },
        },
        maxlen: 64, // 查询结果每个字段最大长度
        maxrow: 3, // 查询结果每个字段最大行数
        limit: 'row', // 查询结果字段限制, (null 为不限制, 'len' 为限制长度, 'row' 为限制行数)
        CRLF: '<br />', // 换行符替换
        space: ' ', // 空白字符替换
        template: { // 类似模板字段解析支持, 类似 .prefix{.field}, 目前支持的有 .root{.<挂件所在文档块的字段名>} .parent{.<挂件上级块的字段名>} .block{挂件块的字段名}
            enable: true, // 是否启用模板解析
            handler: async (data) => { // 模板解析处理函数
                return await templateParse(data);
            }
        },
        default: {
            // 非块查询的处理模式
            name: (key) => { // 字段名称处理函数
                switch (true) {
                    case key.startsWith(config.query.prefix.ref):
                        return key.substr(config.query.prefix.ref.length);
                    case key.startsWith(config.query.prefix.link):
                        return key.substr(config.query.prefix.link.length);
                    case key.startsWith(config.query.prefix.pre):
                        return key.substr(config.query.prefix.pre.length);
                    case key.startsWith(config.query.prefix.date):
                        return key.substr(config.query.prefix.date.length);
                    case key.startsWith(config.query.prefix.time):
                        return key.substr(config.query.prefix.time.length);
                    case key.startsWith(config.query.prefix.datetime):
                        return key.substr(config.query.prefix.datetime.length);
                    case key.startsWith(config.query.prefix.raw):
                        return key.substr(config.query.prefix.raw.length);
                    default:
                        return key;
                }
            },
            handler: (row, key) => { // 其他查询结果默认处理方法, row 是查询结果的一条记录, key 是字段名
                switch (true) {
                    case key.startsWith(config.query.prefix.ref):
                        return `((${row[key]} "${row[key]}"))`;
                    case key.startsWith(config.query.prefix.link):
                        return `[${row[key]}](${row[key]})`;
                    case key.startsWith(config.query.prefix.pre):
                        return markdown2span(row[key]);
                    case key.startsWith(config.query.prefix.date):
                        return dateFormat(row[key]);
                    case key.startsWith(config.query.prefix.time):
                        return timeFormat(row[key]);
                    case key.startsWith(config.query.prefix.datetime):
                        return timestampFormat(row[key]);
                    case key.startsWith(config.query.prefix.raw):
                    default:
                        return `\`${row[key]}\``;
                }
            },
            style: {
                column: '',
                align: ':-',
            },
        },
        fields: [ // 需渲染的 blocks 表的字段, 顺序分先后
            'type', // 内容块类型，参考((20210210103523-ombf290 "类型字段"))
            // 'content', // 去除了 Markdown 标记符的文本
            'markdown', // 包含完整 Markdown 标记符的文本
            'hpath', // 人类可读的内容块所在文档路径
            'created', // 创建时间
            'updated', // 更新时间

            // 'id', // 内容块 ID
            // 'parent_id', // 双亲块 ID, 如果内容块是文档块则该字段为空
            // 'root_id', // 文档块 ID
            // 'box', // 笔记本 ID
            // 'path', // 内容块所在文档路径
            // 'name', // 内容块名称
            // 'alias', // 内容块别名
            // 'memo', // 内容块备注
            // 'hash', // content 字段的 SHA256 校验和
            // 'length', // markdown 字段文本长度
            // 'subtype', // 内容块子类型，参考((20210210103411-tcbcjja "子类型字段"))
            // 'ial', // 内联属性列表，形如 `{: name="value"}`
            // 'sort', // 排序权重, 数值越小排序越靠前
        ],
        style: {
            // 查询结果样式
            table: {
                // 表格样式
                enable: false, // 是否启用使用块自定义属性设置表格样式
                attributes: [
                    {
                        // 表格自定义属性属性, 详情请参考 [siyuan-theme-dark-plus/custom-table-width.css at main · Zuoqiu-Yingyi/siyuan-theme-dark-plus](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus/blob/main/style/module/custom-table-width.css)
                        key: 'custom-table-width', // 表格宽度自定义属性名
                        value: 'auto', // 表格宽度自定义属性值
                    },
                ],
            },
            column: {
                // 列样式, 自定义宽度的字段可以设置为 '{: style="width: 512px"}'
                content: '',
                markdown: '',
                created: '',
                updated: '',
                type: '',
                hpath: '',

                id: '',
                parent_id: '',
                root_id: '',
                hash: '',
                box: '',
                path: '',
                name: '',
                alias: '',
                memo: '',
                length: '',
                subtype: '',
                ial: '',
                sort: '',
            },
            align: { // 查询结果字段对齐样式(':-' 左对齐, ':-:' 居中, '-:' 右对齐)
                content: ':-',
                markdown: ':-',
                created: ':-:',
                updated: ':-:',
                type: ':-:',
                hpath: ':-',

                id: ':-:',
                parent_id: ':-:',
                root_id: ':-:',
                hash: ':-:',
                box: ':-:',
                path: ':-',
                name: ':-',
                alias: ':-',
                memo: ':-',
                length: '-:',
                subtype: '-:',
                ial: ':-',
                sort: '-:',
            },
        },
        filter: {
            // 查询结果过滤器
            blocks: { // 块查询的过滤
                enable: true, // 是否启用过滤
                handlers: [ // 过滤处理方法序列
                    (row, data) => { // 过滤查询结果中的查询结构(查询代码块, Query 挂件块)
                        // row: 查询结果一条记录
                        // data: 挂件数据
                        // return: 返回 true 则过滤掉当前记录, 返回 false 则不过滤
                        switch (true) {
                            case row.ial.indexOf(`custom-type="${data.config.query.attribute.code}"`) != -1:
                            case row.ial.indexOf(`custom-type="${data.config.query.attribute.widget}"`) != -1:
                            case row.ial.indexOf(`custom-type="${data.config.query.attribute.table}"`) != -1:
                                return true;
                            default:
                                return false;
                        }
                    },
                ],
            }
        },
        handler: { // 块查询结果各字段处理方法
            content: (row) => {
                switch (config.query.limit) {
                    case 'len':
                        return markdown2span(cutString(ReplaceSpace(row.content, config.query.space), config.query.maxlen));
                    case 'row':
                        return markdown2span(ReplaceCRLF(cutString(row.content, undefined, config.query.maxrow), config.query.CRLF));
                    default:
                        return markdown2span(row.content);
                }
            },
            markdown: (row) => {
                switch (config.query.limit) {
                    case 'len':
                        return markdown2span(cutString(ReplaceSpace(row.markdown, config.query.space), config.query.maxlen));
                    case 'row':
                        return markdown2span(ReplaceCRLF(cutString(row.markdown, undefined, config.query.maxrow), config.query.CRLF));
                    default:
                        return markdown2span(row.markdown);
                }
            },
            created: (row) => {
                return timestampFormat(row.created);
            },
            updated: (row) => {
                return timestampFormat(row.updated);
            },
            type: (row) => {
                switch (config.query.render.type) {
                    case 'link':
                        return `[${config.query.map.blocktype[row.type]}](siyuan://blocks/${row.id})`;
                    case 'ref':
                    default:
                        return `((${row.id} "${config.query.map.blocktype[row.type]}"))`;
                }
            },
            hpath: (row) => {
                switch (config.query.render.hpath) {
                    case 'link':
                        return `[${row.hpath}](siyuan://blocks/${row.root_id})`;
                    case 'ref':
                    default:
                        return `((${row.root_id} "${row.hpath}"))`;
                }
            },

            id: (row) => {
                switch (config.query.render.id) {
                    case 'link':
                        return `[${row.id}](siyuan://blocks/${row.id})`;
                    case 'ref':
                    default:
                        return `((${row.id} "${row.id}"))`;
                }
            },
            parent_id: (row) => {
                if (isEmptyString(row.parent_id)) return '';
                else {
                    switch (config.query.render.parent_id) {
                        case 'link':
                            return `[${row.parent_id}](siyuan://blocks/${row.parent_id})`;
                        case 'ref':
                        default:
                            return `((${row.parent_id} "${row.parent_id}"))`;
                    }
                }
            },
            root_id: (row) => {
                switch (config.query.render.root_id) {
                    case 'link':
                        return `[${row.root_id}](siyuan://blocks/${row.root_id})`;
                    case 'ref':
                    default:
                        return `((${row.root_id} "${row.root_id}"))`;
                }
            },
            hash: (row) => {
                return `\`${row.hash}\``;
            },
            box: (row) => {
                return `\`${row.box}\``;
            },
            path: (row) => {
                return `\`${row.path}\``;
            },
            name: (row) => {
                return markdown2span(row.name);
            },
            alias: (row) => {
                return markdown2span(row.alias);
            },
            memo: (row) => {
                return markdown2span(row.memo);
            },
            length: (row) => {
                return row.length;
            },
            subtype: (row) => {
                return config.query.map.subtype[row.subtype];
            },
            ial: (row) => {
                let ial = ialParser(row.ial);
                let ial_markdown = [];
                for (let key of Object.keys(ial)) {
                    switch (key) {
                        case 'id':
                        case 'updated':
                            continue;
                        case 'icon':
                            ial_markdown.push(`\`${key}\`\: :${ial[key].replace(/\.\w+$/, '')}:`);
                            break;
                        default:
                            ial_markdown.push(`\`${key}\`\: \`${ial[key]}\``);
                            break;
                    }
                }
                return ial_markdown.join(config.query.CRLF);
            },
            sort: (row) => {
                return row.sort;
            },
        },
        map: {
            // 映射表
            blocktype: { // 块类型映射
                d: '文档块',
                h: '标题块',
                l: '列表块',
                i: '列表项',
                c: '代码块',
                m: '公式块',
                t: '表格块',
                b: '引述块',
                s: '超级块',
                p: '段落块',
                tb: '分隔线',
                video: '视频块',
                audio: '音频块',
                widget: '挂件块',
                iframe: 'iframe',
                query_embed: '嵌入块',
                '': '',
                null: '',
                undefined: '',
            },
            subtype: { // 子类型映射
                o: '有序列表',
                u: '无序列表',
                t: '任务列表',
                h1: '一级标题',
                h2: '二级标题',
                h3: '三级标题',
                h4: '四级标题',
                h5: '五级标题',
                h6: '六级标题',
                '': '',
                null: '',
                undefined: '',
            },
        },
    },
};

try {
    let custom = await import('/widgets/custom.js');
    config = custom.config != null ? custom.config : config;
} catch (err) {
    console.log(err);
} finally {
    console.log(config);
}
