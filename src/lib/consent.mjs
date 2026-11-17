/**
 * Cookie 同意偏好的存储键 —— 单一来源。
 *
 * 写入方：src/components/ConsentBanner.astro（用户点击三种选择之一）
 * 读取方：src/layouts/Head.astro（决定是否注入 GA / Umami 脚本）、页脚「Cookie 设置」
 *
 * 键名改了就两边一起改，别在各处再写字面量（评审 #522 P3）。
 */
export const CONSENT_STORAGE_KEY = 'consent-preference'
