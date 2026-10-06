const fs = require('fs');
const path = require('path');

// 读取组件文件
const headerPath = path.join(__dirname, 'header.html');
const footerPath = path.join(__dirname, 'footer.html');
const headerContent = fs.readFileSync(headerPath, 'utf-8');
const footerContent = fs.readFileSync(footerPath, 'utf-8');

// 定义需要处理的 HTML 文件列表
const pages = [
    'index2.html',
    'fenxi.html',
    'gerenzx.html',
    'dati1.html',
    'cx1.html',
    'denglu.html',
    'guanyuwm.html',
    'kepu.html',
    'kepu2.html',
    'kepu3.html',
    'luntan.html',
    'yiduiyi.html',
    'zhuanjiazhuzhen.html'
];

// 确保输出目录存在
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 递归复制文件夹
function copyFolderSync(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 处理每个 HTML 文件
pages.forEach(page => {
    const pagePath = path.join(__dirname, page);
    if (!fs.existsSync(pagePath)) {
        console.log(`⚠️ 跳过不存在的文件: ${page}`);
        return;
    }

    let html = fs.readFileSync(pagePath, 'utf-8');

    // 【关键修改】只替换 HTML 占位符，不修改任何 JavaScript 代码
    html = html.replace(
        /<div\s+id="header-placeholder"\s*><\/div>/gi,
        headerContent
    );
    html = html.replace(
        /<div\s+id="footer-placeholder"\s*><\/div>/gi,
        footerContent
    );

    // 不再移除 fetch 相关代码！保留原样，不影响功能

    const outputPath = path.join(distDir, page);
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅ 已生成: ${page}`);
});

// 复制静态资源
copyFolderSync(path.join(__dirname, 'assets'), path.join(distDir, 'assets'));
copyFolderSync(path.join(__dirname, 'images'), path.join(distDir, 'images'));

console.log('\n🎉 构建完成！');