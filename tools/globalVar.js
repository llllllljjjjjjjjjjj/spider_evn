//全局变量初始化
!function () {
    let onEnter = function (obj) {
        try {
            ldvm.toolsFunc.printLog(obj.args);
        }
        catch (e) {

        }


    }
    console.log = ldvm.toolsFunc.hook(
        console.log,
        undefined,
        false,
        onEnter,
        function () { },
        ldvm.config.print
    );
    //对pluginArray创建5个plugin--name不同
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Chrome PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Chromium PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Microsoft Edge PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Chrome PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "WebKit built-in PDF",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })

}();