/**
 * @desc amWiki 工作端·主模块
 * @author 耀轩之
 * @copyright 在Tevin的原基础上修改所得
 * @see {@link https://github.com/YaoXuanZhi/amWiki}
 * @license MIT - Released under the MIT license.
 */

var vscode = require('vscode');

// widnow.confirm2 = (msg) => {
//     return new Promise((resolve, reject) => {
//         resolve(
//             vscode.window.showWarningMessage(msg, '是').then(function (msg) {
//                 if ('是' !== msg) {
//                     return;
//                 }
//             })
//         );
//     });
// };


//手动刷新工具
var makeNav = require('./makeNav');
// //自动化工具
// var automatic = require('./automatic');
// wiki创建器
var creator = require('./creator');
// wiki创建器2.0版
var creatorplus = require('./creatorplus');
//页内目录创建器
// var catalogue = require('./catalogue');
//业内目录创建器2.0版
var editorForVSCode = require('./editorForVSCode')
var pageCatalogue = require('./pageCatalogue');
//截图粘帖模块
var pasterImg = require('./pasterImg');
//本地服务器模块
var webServer = require('./webServer');
//项目导出模块
var exportGithub = require('./export.github');
// //文件拖拽模块
// var fileDrop = require('./fileDrop');
var co = require('./co');

function activate(context) {
        var state = {};
        state.context = context;
        //文库列表记录
        state.libraryList = state.libraryList || [];
        //文库列表地址MD5，检查文库变化时创建
        state.libraryMD5 = state.libraryMD5 || {};
        //当前从资源管理器传入来的信息
        state.rescontext = {};
        
        state._config = null;
        state._wikis = null;

        //注册“基于当前config.json创建wiki”响应事件
        var amWikiCreateProc = vscode.commands.registerCommand('amWiki.create', function (rescontext) {
        state.rescontext = rescontext;
        // creator.create(state);

        //////////////////改进版的逻辑////////////////////
         var options = {};
        if (!state.rescontext || !state.rescontext.fsPath) {
            //假设被选中的文件已经打开
            const editor = vscode.editor || vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            options.editorPath = editor.document.fileName;
        } else {
            //假设被选中的文件没有打开
            options.editorPath = state.rescontext.fsPath;
        }

        if (options.editorPath.indexOf('config.json') < 0) {
            vscode.window.showWarningMessage('当前不是"config.json"文件！');
            return;
        }
        
        //获得当前extension所在目录
        var extensionPath = state.context.extensionPath;
        //找到默认文库的所在路径
        options.filesPath = extensionPath.replace(/\\/g, '/') + '/files/';

        creatorplus.create(options.editorPath, options.filesPath);
        //////////////////改进版的逻辑////////////////////
    });

    //注册“在当前文档上抓取h2、h3为页内目录”响应事件
    var amWikiCatalogueProc = vscode.commands.registerCommand('amWiki.catalogue', function () {
        // catalogue.make();
        var editor = new pageCatalogue(vscode); 
        pageCatalogue.make(editor);
    });

    //注册“手动更新当前文库导航”响应事件
    // var amWikiMakeNavProc = vscode.commands.registerCommand('amWiki.makeNav', function () {
    //     makeNav.update(state);
    // });

    //注册“粘帖截图”响应事件
    var pasteImgObj = new pasterImg(vscode);
    var amWikiPasteImgProc = vscode.commands.registerCommand('amWiki.pasteImg', function () {
        pasteImgObj.PasteImgFromClipboard();
    });

    //注册“启动node静态服务器”响应事件
    // var amWikiRunServerProc = vscode.commands.registerCommand('amWiki.runServer', function () {
    //     vscode.window.showInformationMessage('amWiki.runServer');
    // });

    //注册“浏览打开当前页面”响应事件
    var amWikiBrowserProc = vscode.commands.registerCommand('amWiki.browser', function () {
        //保存当前更改
        vscode.workspace.saveAll(false);
        //启动本地服务器
        webServer.run(state.libraryList);
        //更新文库导航
        if (makeNav.update(state)) {
            //在浏览器中预览此文档
            webServer.browser(state.libraryList);
        } else {
            vscode.window.showErrorMessage('更新导航失败，可能存在重复文件ID，请检查');
        }
    });

    //注册“导出项目为 github wiki”响应事件
    var amWikiExportTogitHubProc = vscode.commands.registerCommand('amWiki.exportTogitHub', function () {
        //保存当前更改
        vscode.workspace.saveAll(false);
        //将本文库以github wiki目录结构方式
        //导出到指定文件夹内
        exportGithub.export();
    });

    context.subscriptions.push(amWikiCreateProc);
    context.subscriptions.push(amWikiCatalogueProc);
    // context.subscriptions.push(amWikiMakeNavProc);
    context.subscriptions.push(amWikiPasteImgProc);
    // context.subscriptions.push(amWikiRunServerProc);
    context.subscriptions.push(amWikiBrowserProc);
    context.subscriptions.push(amWikiExportTogitHubProc);
}

function activateplus(context) {
        var state = {};
        state.context = context;
        //文库列表记录
        state.libraryList = state.libraryList || [];
        //文库列表地址MD5，检查文库变化时创建
        state.libraryMD5 = state.libraryMD5 || {};
        //当前从资源管理器传入来的信息
        state.rescontext = {};    

        //注册“基于当前config.json创建wiki”响应事件
        var amWikiCreateProc = vscode.commands.registerCommand('amWiki.create', function (rescontext) {
        state.rescontext = rescontext;
        // creator.create(state);

        //////////////////改进版的逻辑////////////////////
         var options = {};
        if (!state.rescontext || !state.rescontext.fsPath) {
            //假设被选中的文件已经打开
            const editor = vscode.editor || vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            options.editorPath = editor.document.fileName;
        } else {
            //假设被选中的文件没有打开
            options.editorPath = state.rescontext.fsPath;
        }

        if (options.editorPath.indexOf('config.json') < 0) {
            vscode.window.showWarningMessage('当前不是"config.json"文件！');
            return;
        }
        
        //获得当前extension所在目录
        var extensionPath = state.context.extensionPath;
        //找到默认文库的所在路径
        options.filesPath = extensionPath.replace(/\\/g, '/') + '/files/';

        creatorplus.create(options.editorPath, options.filesPath);
        //////////////////改进版的逻辑////////////////////
    });

    //注册“在当前文档上抓取h2、h3为页内目录”响应事件
    var amWikiCatalogueProc = vscode.commands.registerCommand('amWiki.catalogue', function () {
        // catalogue.make();
        var editor = new pageCatalogue(vscode); 
        pageCatalogue.make(editor);
    });

    //注册“手动更新当前文库导航”响应事件
    // var amWikiMakeNavProc = vscode.commands.registerCommand('amWiki.makeNav', function () {
    //     makeNav.update(state);
    // });

    //注册“粘帖截图”响应事件
    var pasteImgObj = new pasterImg(vscode);
    var amWikiPasteImgProc = vscode.commands.registerCommand('amWiki.pasteImg', function () {
        pasteImgObj.PasteImgFromClipboard();
    });

    //注册“启动node静态服务器”响应事件
    // var amWikiRunServerProc = vscode.commands.registerCommand('amWiki.runServer', function () {
    //     vscode.window.showInformationMessage('amWiki.runServer');
    // });

    //注册“浏览打开当前页面”响应事件
    var amWikiBrowserProc = vscode.commands.registerCommand('amWiki.browser', function () {
        //保存当前更改
        vscode.workspace.saveAll(false);
        //启动本地服务器
        webServer.run(state.libraryList);
        //更新文库导航
        if (makeNav.update(state)) {
            //在浏览器中预览此文档
            webServer.browser(state.libraryList);
        } else {
            vscode.window.showErrorMessage('更新导航失败，可能存在重复文件ID，请检查');
        }
    });

    //注册“导出项目为 github wiki”响应事件
    var amWikiExportTogitHubProc = vscode.commands.registerCommand('amWiki.exportTogitHub', function () {
        //保存当前更改
        vscode.workspace.saveAll(false);
        //将本文库以github wiki目录结构方式
        //导出到指定文件夹内
        exportGithub.export();
    });

    context.subscriptions.push(amWikiCreateProc);
    context.subscriptions.push(amWikiCatalogueProc);
    // context.subscriptions.push(amWikiMakeNavProc);
    context.subscriptions.push(amWikiPasteImgProc);
    // context.subscriptions.push(amWikiRunServerProc);
    context.subscriptions.push(amWikiBrowserProc);
    context.subscriptions.push(amWikiExportTogitHubProc);
}function activate(context) {
        var state = {};
        state.context = context;
        //文库列表记录
        state.libraryList = state.libraryList || [];
        //文库列表地址MD5，检查文库变化时创建
        state.libraryMD5 = state.libraryMD5 || {};
        //当前从资源管理器传入来的信息
        state.rescontext = {};    

        //注册“基于当前config.json创建wiki”响应事件
        var amWikiCreateProc = vscode.commands.registerCommand('amWiki.create', function (rescontext) {
        state.rescontext = rescontext;
        // creator.create(state);

        //////////////////改进版的逻辑////////////////////
         var options = {};
        if (!state.rescontext || !state.rescontext.fsPath) {
            //假设被选中的文件已经打开
            const editor = vscode.editor || vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            options.editorPath = editor.document.fileName;
        } else {
            //假设被选中的文件没有打开
            options.editorPath = state.rescontext.fsPath;
        }

        if (options.editorPath.indexOf('config.json') < 0) {
            vscode.window.showWarningMessage('当前不是"config.json"文件！');
            return;
        }
        
        //获得当前extension所在目录
        var extensionPath = state.context.extensionPath;
        //找到默认文库的所在路径
        options.filesPath = extensionPath.replace(/\\/g, '/') + '/files/';

        creatorplus.create(options.editorPath, options.filesPath);
        //////////////////改进版的逻辑////////////////////
    });

    //注册“在当前文档上抓取h2、h3为页内目录”响应事件
    var amWikiCatalogueProc = vscode.commands.registerCommand('amWiki.catalogue', function () {
        // catalogue.make();
        var editor = new pageCatalogue(vscode); 
        pageCatalogue.make(editor);
    });

    //注册“手动更新当前文库导航”响应事件
    // var amWikiMakeNavProc = vscode.commands.registerCommand('amWiki.makeNav', function () {
    //     makeNav.update(state);
    // });

    //注册“粘帖截图”响应事件
    var pasteImgObj = new pasterImg(vscode);
    var amWikiPasteImgProc = vscode.commands.registerCommand('amWiki.pasteImg', function () {
        pasteImgObj.PasteImgFromClipboard();
    });

    //注册“启动node静态服务器”响应事件
    // var amWikiRunServerProc = vscode.commands.registerCommand('amWiki.runServer', function () {
    //     vscode.window.showInformationMessage('amWiki.runServer');
    // });

    //注册“浏览打开当前页面”响应事件
    var amWikiBrowserProc = vscode.commands.registerCommand('amWiki.browser', function () {
        //保存当前更改
        vscode.workspace.saveAll(false);
        //启动本地服务器
        webServer.run(state.libraryList);
        //更新文库导航
        if (makeNav.update(state)) {
            //在浏览器中预览此文档
            webServer.browser(state.libraryList);
        } else {
            vscode.window.showErrorMessage('更新导航失败，可能存在重复文件ID，请检查');
        }
    });

    //注册“导出项目为 github wiki”响应事件
    var amWikiExportTogitHubProc = vscode.commands.registerCommand('amWiki.exportTogitHub', function () {
        //保存当前更改
        vscode.workspace.saveAll(false);
        //将本文库以github wiki目录结构方式
        //导出到指定文件夹内
        exportGithub.export();
    });

    context.subscriptions.push(amWikiCreateProc);
    context.subscriptions.push(amWikiCatalogueProc);
    // context.subscriptions.push(amWikiMakeNavProc);
    context.subscriptions.push(amWikiPasteImgProc);
    // context.subscriptions.push(amWikiRunServerProc);
    context.subscriptions.push(amWikiBrowserProc);
    context.subscriptions.push(amWikiExportTogitHubProc);
}

exports.activate = activate;


