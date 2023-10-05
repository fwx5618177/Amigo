# Amigo Bot

> Refactor icqqjs

TODO:

1. qq-bot
2. 视频处理
   1. plugins
   2. server
3. cli prompt
4. front
5. db or others
6. CI/CD

## Command: Typedoc

下面是上面提供的所有 TypeDoc 选项的翻译和整理表格。

| 选项名称                   | 描述                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| basePath                   | 指定显示文件路径时使用的基本路径。                                                                                |
| blockTags                  | TypeDoc 在解析注释时应识别的块标签。                                                                              |
| cacheBust                  | 在静态资产的链接中包含生成时间。                                                                                  |
| categorizeByGroup          | 指定分类将在组级别完成。                                                                                          |
| categoryOrder              | 指定类别出现的顺序。\*表示不在列表中的类别的相对顺序。                                                            |
| cleanOutputDir             | 如果设置，TypeDoc 将在写入输出之前删除输出目录。                                                                  |
| cname                      | 设置 CNAME 文件文本，用于 GitHub Pages 上的自定义域名。                                                           |
| commentStyle               | 确定 TypeDoc 查找注释的方式。                                                                                     |
| customCss                  | 主题导入的自定义 CSS 文件的路径。                                                                                 |
| darkHighlightTheme         | 指定深色模式下的代码高亮主题。                                                                                    |
| defaultCategory            | 指定没有类别的反射的默认类别。                                                                                    |
| disableGit                 | 假定所有都可以使用 sourceLinkTemplate 链接，启用此选项必须设置 sourceLinkTemplate。{path}将位于 basePath 的根下。 |
| disableSources             | 禁用在记录它时设置反射的源。                                                                                      |
| emit                       | 指定 TypeDoc 应发出的内容，'docs'、'both'或'none'。                                                               |
| entryPoints                | 文档的入口点。                                                                                                    |
| entryPointStrategy         | 用于将入口点转换为文档模块的策略。                                                                                |
| exclude                    | 定义在将目录指定为入口点时要排除的模式。                                                                          |
| excludeCategories          | 从文档中排除此类别内的符号。                                                                                      |
| excludeExternals           | 防止外部解析的符号被记录。                                                                                        |
| excludeInternal            | 防止标有@internal 的符号被记录。                                                                                  |
| excludeNotDocumented       | 防止没有明确记录的符号出现在结果中。                                                                              |
| excludeNotDocumentedKinds  | 指定可以通过 excludeNotDocumented 删除的反射类型。                                                                |
| excludePrivate             | 忽略私有变量和方法。                                                                                              |
| excludeProtected           | 忽略受保护的变量和方法。                                                                                          |
| excludeReferences          | 如果一个符号被多次导出，忽略第一次导出之外的所有内容。                                                            |
| excludeTags                | 从文档注释中删除列出的块/修饰符标签。                                                                             |
| externalPattern            | 定义应视为外部的文件的模式。                                                                                      |
| externalSymbolLinkMappings | 为不包含在文档中的符号定义自定义链接。                                                                            |
| gaID                       | 设置 Google Analytics 跟踪 ID 并激活跟踪代码。                                                                    |
| githubPages                | 生成.nojekyll 文件，以防止 GitHub Pages 中的 404 错误。默认为`true`。                                             |
| gitRemote                  | 使用指定的远程链接到 GitHub/Bitbucket 源文件。如果设置了 disableGit 或 disableSources，则无效。                   |
| gitRevision                | 使用指定的修订版本而不是最后的修订版本链接到 GitHub/Bitbucket 源文件。如果 disableSources 设置，则无效。          |
| groupOrder                 | 指定组出现的顺序。\*表示不在列表中的组的相对顺序。                                                                |
| help                       | 打印此消息。                                                                                                      |
| hideGenerator              | 不在页面末尾打印 TypeDoc 链接。                                                                                   |
| hideParameterTypesInTitle  | 隐藏签名标题中的参数类型以便更容易扫描。                                                                          |
| htmlLang                   | 设置生成的 html 标签中的 lang 属性。                                                                              |
| includes                   | 指定查找包含文档的位置（在注释中使用[[include:FILENAME]])。                                                       |
| includeVersion             | 将包版本添加到项目名称中。                                                                                        |
| inlineTags                 | TypeDoc 在解析注释时应识别的内联标签。                                                                            |
| intentionallyNotExported   | 不应产生“引用但未记录”警告的类型列表。                                                                            |
| jsDocCompatibility         | 设置注释解析的兼容性选项，增加与 JSDoc 注释的相似性。                                                             |
| json                       | 指定一个描述项目的 JSON 文件的位置和文件名被写入。                                                                |
| kindSortOrder              | 指定当指定'kind'时反射的排序顺序。                                                                                |
| lightHighlightTheme        | 指定浅色模式下的代码高亮主题。                                                                                    |
| logLevel                   | 指定应使用哪种级别的日志记录。                                                                                    |
| media                      | 指定应复制到输出目录的媒体文件的位置。                                                                            |
| modifierTags               | TypeDoc 在解析注释时应识别的修饰符标签。                                                                          |
| name                       | 设置将用于模板标题中的项目名称。                                                                                  |
| navigation                 | 确定导航侧栏是如何组织的。                                                                                        |
| navigationLinks            | 定义要包含在标题中的链接。                                                                                        |
| options                    | 指定应加载的 json 选项文件。如果未指定，TypeDoc 将在当前目录中查找'typedoc.json'。                                |
| out                        | 指定文档应写入的位置。                                                                                            |
| plugin                     | 指定应加载的 npm 插件。省略以加载所有已安装的插件。                                                               |
| preserveLinkText           | 如果设置，没有链接文本的@link 标签将使用文本内容作为链接。如果未设置，将使用目标反射名称。                        |
| preserveWatchOutput        | 如果设置，TypeDoc 将不会在编译运行之间清除屏幕。                                                                  |
| pretty                     | 指定输出 JSON 是否应用标签格式化。                                                                                |
| readme                     | 指定应在索引页上显示的自述文件的路径。传递`none`以禁用索引页并在全局页上开始文档。                                |
| requiredToBeDocumented     | 必须记录的反射种类的列表                                                                                          |
| searchInComments           | 如果设置，搜索索引还将包含注释。这将大大增加搜索索引的大小。                                                      |
| showConfig                 | 打印已解析的配置并退出。                                                                                          |

|

sidebarLinks | 定义要包含在侧栏中的链接。 | | skipErrorChecking | 在生成文档之前不运行 TypeScript 的类型检查。 | | sort | 指定记录值的排序策略。 | | sourceLinkTemplate | 指定生成源 URL 时使用的链接模板。如果未设置，将使用 git 远程自动创建。支持{path}、{line}、{gitRevision}占位符。 | | stripYamlFrontmatter | 从 markdown 文件中剥离 YAML 前奏曲。 | | theme | 指定用于呈现文档的主题名称 | | titleLink | 设置标题中的链接指向的位置。默认指向文档主页。 | | treatValidationWarningsAsErrors | 如果设置，验证期间发出的警告将被视为错误。此选项不能用于禁用对验证警告的 treatWarningsAsErrors。 | | treatWarningsAsErrors | 如果设置，所有警告都将被视为错误。 | | tsconfig | 指定应加载的 TypeScript 配置文件。如果未指定，TypeDoc 将在当前目录中查找'tsconfig.json'。 | | useTsLinkResolution | 当确定@link 标签指向哪里时使用 TypeScript 的链接分辨率。这仅适用于 JSDoc 样式注释。 | | validation | 指定 TypeDoc 应对生成的文档执行哪些验证步骤。 | | version | 打印 TypeDoc 的版本。 | | watch | 监视文件更改并在更改时重新构建文档。 |
