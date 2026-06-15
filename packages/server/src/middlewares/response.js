const _ = require('lodash');

exports.success = (res, data = null, message = '操作成功') => {
  res.json({
    code: 0,
    message,
    data
  });
};

exports.error = (res, message = '操作失败', code = 1, statusCode = 400) => {
  res.status(statusCode).json({
    code,
    message,
    data: null
  });
};

exports.paginate = (res, data, total, page = 1, pageSize = 10) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      list: data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  });
};

exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
