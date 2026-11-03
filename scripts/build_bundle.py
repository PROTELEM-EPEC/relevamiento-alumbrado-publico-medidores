import os

base_dir = r"D:\Proyectos\relevamiento-alumbrado-publico-medidores"
index_html_src = os.path.join(base_dir, "src", "Index.html")
styles_html_src = os.path.join(base_dir, "src", "Styles.html")
js_html_src = os.path.join(base_dir, "src", "JavaScript.html")

bundle_dst = os.path.join(base_dir, "src", "Bundle_Standalone_AppsScript.html")
index_dst = os.path.join(base_dir, "index.html")

with open(index_html_src, "r", encoding="utf-8") as f:
    template = f.read()

with open(styles_html_src, "r", encoding="utf-8") as f:
    styles = f.read().strip()

with open(js_html_src, "r", encoding="utf-8") as f:
    javascript = f.read().strip()

bundled = template.replace("<?!= include('Styles'); ?>", styles)
bundled = bundled.replace("<?!= include('JavaScript'); ?>", javascript)

with open(bundle_dst, "w", encoding="utf-8") as f:
    f.write(bundled)

with open(index_dst, "w", encoding="utf-8") as f:
    f.write(bundled)

print(f"Bundled created successfully: {len(bundled)} chars in {bundle_dst} and {index_dst}")

