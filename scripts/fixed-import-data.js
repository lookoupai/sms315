/**
 * 导入国家和项目数据到Supabase
 * 
 * 这个脚本会生成SQL语句用于导入到Supabase数据库
 */

// 主要国家列表 - 常用的国家代码
const mainCountries = [
  { name: '中国', code: 'cn', phone_code: '+86' },
  { name: '香港', code: 'hk', phone_code: '+852' },
  { name: '台湾', code: 'tw', phone_code: '+886' },
  { name: '美国', code: 'us', phone_code: '+1' },
  { name: '英国', code: 'gb', phone_code: '+44' },
  { name: '俄罗斯', code: 'ru', phone_code: '+7' },
  { name: '乌克兰', code: 'ua', phone_code: '+380' },
  { name: '哈萨克斯坦', code: 'kz', phone_code: '+7' },
  { name: '印度尼西亚', code: 'id', phone_code: '+62' },
  { name: '马来西亚', code: 'my', phone_code: '+60' },
  { name: '菲律宾', code: 'ph', phone_code: '+63' },
  { name: '缅甸', code: 'mm', phone_code: '+95' },
  { name: '越南', code: 'vn', phone_code: '+84' },
  { name: '泰国', code: 'th', phone_code: '+66' },
  { name: '印度', code: 'in', phone_code: '+91' },
  { name: '巴基斯坦', code: 'pk', phone_code: '+92' },
  { name: '肯尼亚', code: 'ke', phone_code: '+254' },
  { name: '坦桑尼亚', code: 'tz', phone_code: '+255' },
  { name: '吉尔吉斯斯坦', code: 'kg', phone_code: '+996' },
  { name: '以色列', code: 'il', phone_code: '+972' }
];

// 主要项目列表 - 常用的项目
const mainProjects = [
  { name: 'Telegram (TG) / (飞机)', code: 'tg' },
  { name: 'Instagram', code: 'ig' },
  { name: 'Google / Gmail (谷歌)', code: 'go' },
  { name: 'Facebook(脸书)', code: 'fb' },
  { name: 'WhatsApp / WS', code: 'wa' },
  { name: 'WeChat 微信', code: 'wc' },
  { name: 'QQ', code: 'qq' },
  { name: 'Taobao (淘宝)', code: 'tb' },
  { name: 'JD.com 京东', code: 'jd' },
  { name: 'Pinduoduo (拼多多)', code: 'pdd' },
  { name: 'Bilibili (哔哩哔哩)', code: 'bl' },
  { name: 'Xiaohongshu (小红书 / RED)', code: 'xhs' },
  { name: 'Kuaishou (快手科技)', code: 'ks' },
  { name: 'Tiktok (抖音)', code: 'tk' },
  { name: 'Discord', code: 'dc' }
];

/**
 * 生成国家数据的SQL语句
 */
function generateCountriesSQL() {
  console.log('-- 清空countries表');
  console.log('DELETE FROM countries;');
  console.log('');
  
  console.log('-- 导入国家数据');
  console.log('INSERT INTO countries (name, code, phone_code) VALUES');
  
  const values = mainCountries.map(country => 
    `('${country.name}', '${country.code}', '${country.phone_code}')`
  );
  
  console.log(values.join(',\n') + ';');
}

/**
 * 生成项目数据的SQL语句
 */
function generateProjectsSQL() {
  console.log('-- 清空projects表');
  console.log('DELETE FROM projects;');
  console.log('');
  
  console.log('-- 导入项目数据');
  console.log('INSERT INTO projects (name, code) VALUES');
  
  const values = mainProjects.map(project => 
    `('${project.name}', '${project.code}')`
  );
  
  console.log(values.join(',\n') + ';');
}

// 生成SQL语句
console.log('-- 生成的SQL语句用于导入国家和项目数据');
console.log('-- 执行时间：' + new Date().toISOString());
console.log('');

generateCountriesSQL();
console.log('');
generateProjectsSQL();