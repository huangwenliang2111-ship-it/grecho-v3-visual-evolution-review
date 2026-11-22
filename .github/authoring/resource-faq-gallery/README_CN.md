<style>body,.markdown-body{font-family:"Microsoft YaHei","微软雅黑",sans-serif;line-height:1.75}</style>

# Resource Center R2.1 与 FAQ R2 生成源

整个目录由 GitHub Pages 工作流排除，站点入口和运行文件仍位于仓库根部。生成前请在独立目录复制仓库运行树，并保留 Home 和 Contact 的发布字节。以下命令从仓库根目录运行，执行 Resource 生成器需要 Python 3 和 lxml。

```powershell
$source = '.github/authoring/resource-faq-gallery'
$preview = 'D:/path/to/isolated-preview'
python -B "$source/build_resource_center.py" --source "$source/baseline/resource-center/index.html" --preview $preview
python -B "$source/build_faq_r2.py" --baseline "$source/baseline-r1/faq/index.html" --preview $preview
Copy-Item -LiteralPath "$source/b1-gallery.css" -Destination "$preview/assets/css/b1-gallery.css"
```

四张 Hero 图为已审核的 WebP 发布字节。原始图像及生成记录保存在此前本地 R1 交付档案。先比较生成结果的 SHA-256 再合并交付。
