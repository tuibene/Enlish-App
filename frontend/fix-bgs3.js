const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : [...filelist, dirFile];
    } catch (err) {
      if (err.code === 'OENT' || err.code === 'ENOTDIR') return;
      throw err;
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'app')).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const target1 = 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl';
  const replacement1 = 'bg-white/80 dark:bg-[#0B1120]/80';

  // For the case where dark mode was mapped to #0B1120 originally but I replaced it with gray-900/40
  // My previous script DID replace dark:bg-[#0B1120] to dark:bg-gray-900/40 backdrop-blur-xl
  // So everything is exactly 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl' now

  if (content.includes(target1)) {
      content = content.split(target1).join(replacement1);
      changed = true;
  }

  // Also catch variations without backdrop-blur if they exist, or just the string itself.
  if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Removed blur from:', file);
  }
});
console.log('Done.');
