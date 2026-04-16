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

  const target1 = 'bg-gray-50 dark:bg-gray-900';
  const replacement1 = 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl';

  const target2 = 'bg-white dark:bg-gray-900';
  const replacement2 = 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl';

  if (content.includes(target1)) {
      content = content.split(target1).join(replacement1);
      changed = true;
  }
  if (content.includes(target2)) {
      content = content.split(target2).join(replacement2);
      changed = true;
  }

  if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated backgrounds in:', file);
  }
});
console.log('Done.');
