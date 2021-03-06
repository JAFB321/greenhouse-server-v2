const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { DBService } = require('./DBService');
const User = require('../models/User');


const encryptPassword = async (password) => {
	const hash = await bcrypt.hash(password, 10);
	return hash;
};

const matchPassword = async function (userpassword, password) {
	return await bcrypt.compare(password, userpassword);
};

const model = User.getInstance();

class UserService extends DBService {
	constructor() {
		super(model);
	}

    async auth({ username, password } = {}, secretKey) {
		try {
			const user = (await this.model.find({ username }))[0];

			if (user) {
				if (await matchPassword(user.password, password)) {
					const { _id, username, fullname } = user;
					const token = jwt.sign(
						{
							_id,
							username,
							fullname,
						},
						secretKey,
						{
							expiresIn: '1h',
						}
					);

					return {
						error: false,
						statusCode: 202,
						data: {
							user: {
								_id,
								username,
								fullname,
							},
							token,
						},
					};
				}
			}
		} catch (error) {
			console.log(error);
			return {
				error: true,
				statusCode: 500,
				error,
			};
		}

		return {
			error: true,
			statusCode: 401,
			data: {},
		};
	}

	async register(data) {
		const { password } = data;

		try {
			data.password = await encryptPassword(password);

			let item = await this.model.create(data);
			if (item)
				return {
					error: false,
					statusCode: 202,
					item,
				};
		} catch (error) {
			console.log('error', error);
			return {
				error: true,
				statusCode: 500,
				message: error.errmsg || 'Not able to create item',
				errors: error.errors,
			};
		}

		return {
			error: true,
			statusCode: 401,
			data: {},
		};
	}
}

module.exports = {UserService};
