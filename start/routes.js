'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {import('@adonisjs/framework/src/Route/Manager'} */
const Route = use('Route')

Route.on('/').render('welcome')

Route.group(() => {
  Route.get('/usuarios', 'UserController.mostrarUsuarios').middleware(['auth:jwt'])
  Route.post('/signup', 'UserController.signup')
  Route.post('/login', 'UserController.login')
  Route.post('/refresh', 'UserController.refreshToken')
  Route.post('/logout', 'UserController.logout')
}).prefix('api/v1')



