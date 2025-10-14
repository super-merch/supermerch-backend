// utils/paginate.js
export default function paginate(items = [], page = 1, perPage = 9, totalOverride = null) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const size = Math.max(1, parseInt(perPage) || 10);

    const total = typeof totalOverride === 'number' && !Number.isNaN(totalOverride)
        ? totalOverride
        : items.length;

    const start = (pageNum - 1) * size;
    const end = start + size;
    const data = items.slice(start, end);

    return {
        data,
        currentPage: pageNum,
        per_page: size,
        item_count:total,
        total_pages: Math.ceil(total / size)

    };
}
