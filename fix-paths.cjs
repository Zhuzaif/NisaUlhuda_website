const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // 1. Replace src="/image.png" -> src={`${import.meta.env.BASE_URL}image.png`}
      content = content.replace(/src="\/([^"]+)"/g, 'src={`${import.meta.env.BASE_URL}$1`}');
      
      // 2. Replace image: '/image.png' -> image: `${import.meta.env.BASE_URL}image.png`
      content = content.replace(/image:\s*'\/([^']+)'/g, 'image: `${import.meta.env.BASE_URL}$1`');
      
      // 3. Replace background url in Download.tsx
      content = content.replace(/className="absolute inset-0 bg-\[url\('\/download_hero_bg\.png'\)\] bg-cover bg-center opacity-60"/g, 
        'className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}download_hero_bg.png)` }}');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir(path.join(process.cwd(), 'src'));
