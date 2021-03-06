const Controller = require('./Controller');
const {UserService} = require('../../database/services/UserService');

const userService = new UserService();

class UserController extends Controller {
	constructor(service) {
		super(service);
	}

	auth = async (req, res) => {
		let response = await this.service.auth(req.body, req.app.get('JWT_SECRET_KEY'));
		return res.status(response.statusCode).send(response);
	};

	register = async (req, res) => {
		let response = await this.service.register(req.body);
		return res.status(response.statusCode).send(response);
	};
}

module.exports = new UserController(userService);
