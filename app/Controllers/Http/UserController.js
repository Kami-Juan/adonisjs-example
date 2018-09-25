'use strict'

const Hash = use('Hash')
const Database = use('Database')
const { validate } = use('Validator')
const User = use('App/Models/User')

class UserController {
  async mostrarUsuarios ({ request, response }) {
    return await User.all();
  }

  async signup ({ request, response, auth }) {

    const rules = {
      email: 'required|email|unique:users,email',
      password: 'required',
      username: 'required|unique:users,username'
    }

    const messages = {
      'email.required': 'El campo email es requerido.',
      'email.email': 'Escribe un email válido.',
      'email.unique': 'El email ya existe en la base de datos.',
      'password.required': 'El campo contraseña es requerido.',
      'username.required': 'El campo nombre de usuario es requerido.',
      'username.unique': 'El nombre de usuario ya existe en la base de datos.'
    }

    const validation = await validate(request.all(), rules, messages);

    if (validation.fails()) {
      return response.send(validation.messages())
    }

    const { username, email, password } = request.all();

    const trx = await Database.beginTransaction();
    const user = await User.create({ username, email, password }, trx);
    trx.commit();

    let token;

    try {
      token = await auth
        .withRefreshToken()
        .attempt(email, password);
    } catch (e) {
      trx.rollback();
      return e;
    }

    return {
      token,
      user
    };
  }

  async login ({ request, response, auth }) {
    const { email, password } = request.all()

    const token = await auth
        .withRefreshToken()
        .attempt(email, password)

    return token
  }

  async logout ({ auth, request, response }) {
    const refreshToken = request.header('refresh_token');
    const user = await auth.getUser();

    await auth.authenticator('jwt').revokeTokensForUser(user,[refreshToken],true)

    return {
      mensaje: 'Se salió de la sesión exitosamente'
    }
  }

  async refreshToken ({auth, request}) {
    const refreshToken = request.input('refresh_token')

    return await auth.newRefreshToken().generateForRefreshToken(refreshToken)
  }
}

module.exports = UserController
