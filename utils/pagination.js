export const generatePaginationParams = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip
    };
}

export const generatePaginationParamsForFilter = (query, allowedSortFields = []) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const sortField = allowedSortFields.includes(query.sort) ? query.sort : null;
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sortOption = sortField ? { [sortField]: sortOrder } : {};

    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
        sortOption
    };
};
