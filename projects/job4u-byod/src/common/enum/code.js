module.exports = {
	SUCCESS: {
		EN: { code: 200, message: 'Success' },
		VI: { code: 200, message: 'Thành công' }
	},
	ERROR: {
		EN: { code: 500, message: 'Error' },
		VI: { code: 500, message: 'Lỗi' }
	},
	BAD_REQUEST: {
		EN: { code: 400, message: 'Bad request' },
		VI: { code: 400, message: 'Dữ liệu không hợp lệ' }
	},
	API_NOT_FOUND: {
		EN: { code: 404, message: 'Api not found' },
		VI: { code: 404, message: 'Dường dẫn không tìm thấy' }
	},
	ACCOUNT_NOT_FOUND: {
		EN: { code: 404, message: 'Account not found' },
		VI: { code: 404, message: 'Tài khoản không tìm thấy' }
	},
	ACCOUNT_ALREADY_EXISTS: {
		EN: { code: 409, message: 'Account already exists' },
		VI: { code: 409, message: 'Tài khoản đã tồn tại' }
	},
}