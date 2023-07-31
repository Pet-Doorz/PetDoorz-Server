const request = require('supertest')
const { encrypt } = require('../helpers/password')
const midtransClient = require("midtrans-client")
const getChatHistory = require('../helpers/thirdPartyRequest')
const authenticationCustomer = require('../middlewares/authenticationCustomer')
const app = require('../app')
const { jwtSign } = require('../helpers/jwt')
const { Customer, Booking, Review, sequelize } = require('../models')
const { describe } = require('yargs')

beforeAll(async () => {
    await queryInterface.bulkInsert('Customers', [{
        email: 'test@mail.com',
        password: encrypt('qwerty'),
        fullName: 'Test Silalahi',
        phoneNumber: '08972828282',
        createdAt: new Date(),
        updatedAt: new Date()
    }]);
})


afterAll(async () => {
    await queryInterface.bulkDelete('Customers', null, {
        truncate: true, restartIdentity: true, cascade: true
    });
})

describe('ENDPOINT /customers', () => {
    describe('POST /', () => {
        test('Register success!', async () => {

            const bodyReq = {
                email: 'register@mail.com',
                password: 'register',
                fullName: 'register test',
                phoneNumber: '08080808'
            }

            const response = (await request(app).post('/customers')).setEncoding(bodyReq)
            console.log(response, `<<<<<<<<<`);
        })
    })
})