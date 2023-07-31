const request = require('supertest')
const { Booking, BookingService, Customer, Hotel, Image, Review, Room, Service, sequelize } = require('../models')
const { jwtSign } = require('../helpers/jwt')
const app = require('../app')

beforeAll(async () => {
})