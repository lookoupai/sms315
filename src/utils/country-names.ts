/**
 * 国家名称国际化工具
 * 使用浏览器原生 Intl.DisplayNames API 获取本地化的国家名称
 */

// 常见国家名称到ISO代码的映射
const countryNameToCode: Record<string, string> = {
  // 中文名称到ISO代码
  '中国': 'CN',
  '美国': 'US',
  '英国': 'GB',
  '日本': 'JP',
  '韩国': 'KR',
  '德国': 'DE',
  '法国': 'FR',
  '加拿大': 'CA',
  '澳大利亚': 'AU',
  '新加坡': 'SG',
  '马来西亚': 'MY',
  '泰国': 'TH',
  '印度': 'IN',
  '印度尼西亚': 'ID',
  '菲律宾': 'PH',
  '越南': 'VN',
  '俄罗斯': 'RU',
  '巴西': 'BR',
  '墨西哥': 'MX',
  '阿根廷': 'AR',
  '智利': 'CL',
  '秘鲁': 'PE',
  '哥伦比亚': 'CO',
  '委内瑞拉': 'VE',
  '土耳其': 'TR',
  '埃及': 'EG',
  '南非': 'ZA',
  '尼日利亚': 'NG',
  '肯尼亚': 'KE',
  '摩洛哥': 'MA',
  '以色列': 'IL',
  '沙特阿拉伯': 'SA',
  '阿联酋': 'AE',
  '卡塔尔': 'QA',
  '科威特': 'KW',
  '巴林': 'BH',
  '阿曼': 'OM',
  '约旦': 'JO',
  '黎巴嫩': 'LB',
  '伊拉克': 'IQ',
  '伊朗': 'IR',
  '阿富汗': 'AF',
  '巴基斯坦': 'PK',
  '孟加拉国': 'BD',
  '斯里兰卡': 'LK',
  '缅甸': 'MM',
  '柬埔寨': 'KH',
  '老挝': 'LA',
  '蒙古': 'MN',
  '哈萨克斯坦': 'KZ',
  '乌兹别克斯坦': 'UZ',
  '吉尔吉斯斯坦': 'KG',
  '塔吉克斯坦': 'TJ',
  '土库曼斯坦': 'TM',
  '格鲁吉亚': 'GE',
  '亚美尼亚': 'AM',
  '阿塞拜疆': 'AZ',
  '白俄罗斯': 'BY',
  '乌克兰': 'UA',
  '摩尔多瓦': 'MD',
  '立陶宛': 'LT',
  '拉脱维亚': 'LV',
  '爱沙尼亚': 'EE',
  '芬兰': 'FI',
  '瑞典': 'SE',
  '挪威': 'NO',
  '丹麦': 'DK',
  '冰岛': 'IS',
  '爱尔兰': 'IE',
  '荷兰': 'NL',
  '比利时': 'BE',
  '卢森堡': 'LU',
  '瑞士': 'CH',
  '奥地利': 'AT',
  '意大利': 'IT',
  '西班牙': 'ES',
  '葡萄牙': 'PT',
  '希腊': 'GR',
  '塞浦路斯': 'CY',
  '马耳他': 'MT',
  '波兰': 'PL',
  '捷克': 'CZ',
  '斯洛伐克': 'SK',
  '匈牙利': 'HU',
  '罗马尼亚': 'RO',
  '保加利亚': 'BG',
  '克罗地亚': 'HR',
  '斯洛文尼亚': 'SI',
  '塞尔维亚': 'RS',
  '波黑': 'BA',
  '黑山': 'ME',
  '北马其顿': 'MK',
  '阿尔巴尼亚': 'AL',
  '不丹': 'BT',
  '东帝汶': 'TL',
  
  // 英文名称到ISO代码
  'China': 'CN',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Japan': 'JP',
  'South Korea': 'KR',
  'Germany': 'DE',
  'France': 'FR',
  'Canada': 'CA',
  'Australia': 'AU',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Thailand': 'TH',
  'India': 'IN',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Vietnam': 'VN',
  'Russia': 'RU',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Peru': 'PE',
  'Colombia': 'CO',
  'Venezuela': 'VE',
  'Turkey': 'TR',
  'Egypt': 'EG',
  'South Africa': 'ZA',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Morocco': 'MA',
  'Israel': 'IL',
  'Saudi Arabia': 'SA',
  'United Arab Emirates': 'AE',
  'Qatar': 'QA',
  'Kuwait': 'KW',
  'Bahrain': 'BH',
  'Oman': 'OM',
  'Jordan': 'JO',
  'Lebanon': 'LB',
  'Iraq': 'IQ',
  'Iran': 'IR',
  'Afghanistan': 'AF',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Sri Lanka': 'LK',
  'Myanmar': 'MM',
  'Cambodia': 'KH',
  'Laos': 'LA',
  'Mongolia': 'MN',
  'Kazakhstan': 'KZ',
  'Uzbekistan': 'UZ',
  'Kyrgyzstan': 'KG',
  'Tajikistan': 'TJ',
  'Turkmenistan': 'TM',
  'Georgia': 'GE',
  'Armenia': 'AM',
  'Azerbaijan': 'AZ',
  'Belarus': 'BY',
  'Ukraine': 'UA',
  'Moldova': 'MD',
  'Lithuania': 'LT',
  'Latvia': 'LV',
  'Estonia': 'EE',
  'Finland': 'FI',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Iceland': 'IS',
  'Ireland': 'IE',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Luxembourg': 'LU',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Italy': 'IT',
  'Spain': 'ES',
  'Portugal': 'PT',
  'Greece': 'GR',
  'Cyprus': 'CY',
  'Malta': 'MT',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Slovakia': 'SK',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Slovenia': 'SI',
  'Serbia': 'RS',
  'Bosnia and Herzegovina': 'BA',
  'Montenegro': 'ME',
  'North Macedonia': 'MK',
  'Albania': 'AL',
  'Bhutan': 'BT',
  'East Timor': 'TL',
  'Timor-Leste': 'TL'
}

// ISO代码到常见名称的反向映射（用于fallback）
const codeToCommonName: Record<string, { zh: string; en: string }> = {
  'CN': { zh: '中国', en: 'China' },
  'US': { zh: '美国', en: 'United States' },
  'GB': { zh: '英国', en: 'United Kingdom' },
  'JP': { zh: '日本', en: 'Japan' },
  'KR': { zh: '韩国', en: 'South Korea' },
  'DE': { zh: '德国', en: 'Germany' },
  'FR': { zh: '法国', en: 'France' },
  'CA': { zh: '加拿大', en: 'Canada' },
  'AU': { zh: '澳大利亚', en: 'Australia' },
  'SG': { zh: '新加坡', en: 'Singapore' },
  'MY': { zh: '马来西亚', en: 'Malaysia' },
  'TH': { zh: '泰国', en: 'Thailand' },
  'IN': { zh: '印度', en: 'India' },
  'ID': { zh: '印度尼西亚', en: 'Indonesia' },
  'PH': { zh: '菲律宾', en: 'Philippines' },
  'VN': { zh: '越南', en: 'Vietnam' },
  'RU': { zh: '俄罗斯', en: 'Russia' },
  'BR': { zh: '巴西', en: 'Brazil' },
  'BT': { zh: '不丹', en: 'Bhutan' },
  'TL': { zh: '东帝汶', en: 'East Timor' },
  'DK': { zh: '丹麦', en: 'Denmark' },
  'UA': { zh: '乌克兰', en: 'Ukraine' }
  // 可以继续添加更多常用国家
}

/**
 * 从国家名称中提取ISO代码
 * 支持格式：国家名 (code) 或 直接的国家名
 */
function extractCountryCode(countryName: string): string | null {
  // 匹配括号中的代码，如 "中国 (cn)" -> "cn"
  const codeMatch = countryName.match(/\(([a-zA-Z]{2})\)$/)
  if (codeMatch) {
    return codeMatch[1].toUpperCase()
  }
  
  // 尝试从映射表获取
  return countryNameToCode[countryName] || null
}

/**
 * 获取国际化的国家名称
 * @param countryName 原始国家名称
 * @param locale 目标语言 ('zh-CN' | 'en-US')
 * @returns 本地化的国家名称
 */
export function getLocalizedCountryName(countryName: string, locale: string): string {
  if (!countryName) return countryName

  try {
    // 1. 提取国家代码
    let countryCode = extractCountryCode(countryName)
    
    // 2. 如果没有找到代码，尝试从映射表获取
    if (!countryCode) {
      countryCode = countryNameToCode[countryName]
    }
    
    if (countryCode) {
      // 3. 使用浏览器原生API获取本地化名称
      if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
        try {
          const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
          const localizedName = displayNames.of(countryCode)
          if (localizedName && localizedName !== countryCode) {
            return localizedName
          }
        } catch (error) {
          console.warn('Intl.DisplayNames failed for code:', countryCode, error)
        }
      }
      
      // 4. Fallback到预定义的常见名称
      const commonName = codeToCommonName[countryCode]
      if (commonName) {
        return locale.startsWith('zh') ? commonName.zh : commonName.en
      }
    }
    
    // 5. 如果都失败了，返回原始名称（去掉括号中的代码）
    return countryName.replace(/\s*\([a-zA-Z]{2}\)$/, '')
  } catch (error) {
    console.warn('Country name localization failed:', error)
    return countryName
  }
}

/**
 * 批量获取国际化的国家名称
 * @param countries 国家列表
 * @param locale 目标语言
 * @returns 本地化后的国家列表
 */
export function getLocalizedCountries<T extends { name: string }>(
  countries: T[], 
  locale: string
): (T & { localizedName: string })[] {
  return countries.map(country => ({
    ...country,
    localizedName: getLocalizedCountryName(country.name, locale)
  }))
}