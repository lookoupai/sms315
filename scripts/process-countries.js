// 处理简化版的国家数据
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取简化版的国家数据
const countriesDataRaw = fs.readFileSync(path.join(__dirname, './countries-simplified.json'), 'utf8');
const countriesData = JSON.parse(countriesDataRaw);

// 提取国家信息
const countries = [];
for (const [key, value] of Object.entries(countriesData)) {
  countries.push({
    name: value.text_en,
    name_zh: value.text_zh, // 已经包含中文名称
    code: value.iso ? Object.keys(value.iso)[0] : '',
    phone_code: value.prefix ? Object.keys(value.prefix)[0] : ''
  });
}

// 按国家名称排序
countries.sort((a, b) => a.name.localeCompare(b.name));

// 保存为JSON文件
fs.writeFileSync(
  path.join(__dirname, 'countries-processed.json'),
  JSON.stringify(countries, null, 2)
);

console.log(`已处理 ${countries.length} 个国家数据`);

// 生成SQL插入语句
let sqlInsert = '-- 生成的SQL语句用于导入国家数据\n';
sqlInsert += `-- 执行时间：${new Date().toISOString().split('T')[0]}\n\n`;
sqlInsert += '-- 清空countries表\n';
sqlInsert += 'DELETE FROM countries;\n\n';
sqlInsert += '-- 导入国家数据\n';
sqlInsert += 'INSERT INTO countries (name, code, phone_code) VALUES\n';

const values = countries.map(country => 
  `('${country.name_zh.replace(/'/g, "''")}', '${country.code}', '${country.phone_code}')`
);

sqlInsert += values.join(',\n');
sqlInsert += ';\n';

// 保存SQL文件
fs.writeFileSync(
  path.join(__dirname, 'import-countries.sql'),
  sqlInsert
);

console.log('已生成SQL导入脚本');

// 生成中文国家名称映射表
const chineseNameTemplate = countries.map(country => 
  `"${country.code}": "${country.name_zh}"`
).join(',\n');

fs.writeFileSync(
  path.join(__dirname, 'country-names-zh-template.js'),
  `// 国家中文名称映射表\nconst countryNamesZh = {\n${chineseNameTemplate}\n};\n\nexport default countryNamesZh;`
);

console.log('已生成中文国家名称模板');
